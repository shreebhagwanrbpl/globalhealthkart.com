import path from "path";
import fs from "fs";
import { DatabaseSync } from "node:sqlite";
import {
  WEBSITE_ID,
  SQLITE_DB_PATH,
  ALL_COMPANIES,
  PRIMARY_COMPANY,
  normalizeDomainId,
  isItemVisibleOnWebsite,
  normalizeProduct,
  makeSlug,
} from "./catalog-utils.js";

let dbInstance = null;
let resolvedDbPath = null;

/**
 * Resolve the path to the catalog SQLite database
 */
export function getCatalogDbPath() {
  if (resolvedDbPath && fs.existsSync(resolvedDbPath)) {
    return resolvedDbPath;
  }

  const candidatePaths = [
    process.env.SQLITE_DB_PATH,
    path.resolve(process.cwd(), SQLITE_DB_PATH),
    path.resolve(process.cwd(), "../SuperAdminRBPL/data/catalog.db"),
    path.resolve(process.cwd(), "../../SuperAdminRBPL/data/catalog.db"),
    path.resolve(process.cwd(), "./data/catalog.db"),
    "C:/Users/Admin/Documents/GitHub/SuperAdminRBPL/data/catalog.db",
  ].filter(Boolean);

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      resolvedDbPath = p;
      return p;
    }
  }

  return null;
}

/**
 * Check if the SQLite database is available on this environment
 */
export function isSqliteAvailable() {
  const p = getCatalogDbPath();
  return Boolean(p && fs.existsSync(p));
}

/**
 * Get or initialize the SQLite database connection in read-only WAL mode
 */
export function getSqliteDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const dbPath = getCatalogDbPath();
  if (!dbPath) {
    return null;
  }

  try {
    const db = new DatabaseSync(dbPath);
    // Instant real-time read performance from WAL buffer
    db.exec("PRAGMA query_only = ON;");
    db.exec("PRAGMA read_uncommitted = ON;");
    dbInstance = db;
    return dbInstance;
  } catch (err) {
    console.error("[sqliteDb] Failed to initialize SQLite DatabaseSync:", err);
    return null;
  }
}

/**
 * Helper to query documents by exact collection path
 */
export function getDocumentsByCollection(collectionPath) {
  const db = getSqliteDb();
  if (!db) return [];
  try {
    const stmt = db.prepare("SELECT * FROM documents WHERE collection_path = ?");
    return stmt.all(collectionPath);
  } catch (err) {
    console.error(`[sqliteDb] Error querying collection "${collectionPath}":`, err);
    return [];
  }
}

/**
 * Helper to query a single document by exact path
 */
export function getDocumentByPath(docPath) {
  const db = getSqliteDb();
  if (!db) return null;
  try {
    const stmt = db.prepare("SELECT * FROM documents WHERE path = ? LIMIT 1");
    const row = stmt.get(docPath);
    if (!row) return null;
    return JSON.parse(row.data);
  } catch (err) {
    console.error(`[sqliteDb] Error querying doc "${docPath}":`, err);
    return null;
  }
}

/**
 * Fetch and process full catalog data from SQLite with Cascading Visibility
 * (<2ms zero-delay direct read)
 */
export function fetchCatalogDataFromSqlite(websiteId = WEBSITE_ID) {
  const db = getSqliteDb();
  if (!db) {
    return { categoryProducts: [], categoryList: [], products: [] };
  }

  const targetSite = normalizeDomainId(websiteId);
  const categoryProducts = [];
  const categoryList = [];
  const seenProductSlugs = new Set();

  try {
    for (const companyId of ALL_COMPANIES) {
      const categoriesPath = `companies/${companyId}/categories`;
      const catDocs = getDocumentsByCollection(categoriesPath);

      for (const catRow of catDocs) {
        let catData = null;
        try {
          catData = JSON.parse(catRow.data);
        } catch (_) {
          continue;
        }

        const catId = catRow.doc_id || catData.id || catData.slug;
        const catName = catData.name || catData.title || catData.category || catId;

        // 1. Cascading Visibility: Check if Category is visible on website
        if (!isItemVisibleOnWebsite(catData, targetSite)) {
          continue; // Entire category & children hidden
        }

        const subcategoryList = [];

        // Fetch subcategories for this category
        const subcategoriesPath = `companies/${companyId}/categories/${catId}/subcategories`;
        const subcatDocs = getDocumentsByCollection(subcategoriesPath);

        for (const subRow of subcatDocs) {
          let subData = null;
          try {
            subData = JSON.parse(subRow.data);
          } catch (_) {
            continue;
          }

          const subId = subRow.doc_id || subData.id || subData.slug;
          const subName = subData.name || subData.title || subData.subCategory || subId;

          // 2. Cascading Visibility: Check if Subcategory is visible on website
          if (!isItemVisibleOnWebsite(subData, targetSite)) {
            continue; // Entire subcategory & products hidden
          }

          const subProds = [];

          // Process embedded products inside subcategory document
          if (Array.isArray(subData.products)) {
            for (let idx = 0; idx < subData.products.length; idx++) {
              const p = subData.products[idx];
              if (isItemVisibleOnWebsite(p, targetSite)) {
                const norm = normalizeProduct(p, catName, subName, `${catId}-${subId}-${p.id || idx}`);
                if (norm) {
                  subProds.push(norm);
                  if (!seenProductSlugs.has(norm.slug)) {
                    seenProductSlugs.add(norm.slug);
                    categoryProducts.push(norm);
                  }
                }
              }
            }
          }

          // Process subcollection products if any
          const subProdDocs = getDocumentsByCollection(`${subcategoriesPath}/${subId}/products`);
          for (let idx = 0; idx < subProdDocs.length; idx++) {
            let pData = null;
            try {
              pData = JSON.parse(subProdDocs[idx].data);
            } catch (_) {
              continue;
            }
            if (isItemVisibleOnWebsite(pData, targetSite)) {
              const norm = normalizeProduct(pData, catName, subName, `${catId}-${subId}-${pData.id || idx}`);
              if (norm) {
                subProds.push(norm);
                if (!seenProductSlugs.has(norm.slug)) {
                  seenProductSlugs.add(norm.slug);
                  categoryProducts.push(norm);
                }
              }
            }
          }

          subcategoryList.push({
            id: subId,
            name: subName,
            subCategory: subName,
            slug: subData.slug || makeSlug(subName),
            products: subProds,
            count: subProds.length,
          });
        }

        categoryList.push({
          id: catId,
          name: catName,
          category: catName,
          slug: catData.slug || makeSlug(catName),
          subcategories: subcategoryList,
          count: subcategoryList.reduce((acc, s) => acc + s.products.length, 0),
        });
      }

      // Standalone products in companies/{companyId}/products
      const masterProds = getDocumentsByCollection(`companies/${companyId}/products`);
      for (let idx = 0; idx < masterProds.length; idx++) {
        let pData = null;
        try {
          pData = JSON.parse(masterProds[idx].data);
        } catch (_) {
          continue;
        }
        if (isItemVisibleOnWebsite(pData, targetSite)) {
          const norm = normalizeProduct(pData, pData.category || "General", pData.subCategory || "General", `master-${pData.id || idx}`);
          if (norm && !seenProductSlugs.has(norm.slug)) {
            seenProductSlugs.add(norm.slug);
            categoryProducts.push(norm);
          }
        }
      }
    }

    return {
      categoryProducts,
      categoryList,
      products: categoryProducts,
    };
  } catch (err) {
    console.error("[sqliteDb] Error in fetchCatalogDataFromSqlite:", err);
    return { categoryProducts: [], categoryList: [], products: [] };
  }
}

/**
 * Fetch page content (home, services, contact, districts) directly from SQLite
 */
export function fetchSiteDataFromSqlite(type = "home", websiteId = WEBSITE_ID) {
  const db = getSqliteDb();
  if (!db) return null;

  const targetSite = normalizeDomainId(websiteId);

  try {
    for (const companyId of ALL_COMPANIES) {
      // 1. Try normalized website path: websites/{companyId}/{targetSite}/pages/{type}
      const p1 = `websites/${companyId}/${targetSite}/pages/${type}`;
      const doc1 = getDocumentByPath(p1);
      if (doc1) return doc1;

      // 2. Try raw website path: websites/{companyId}/{websiteId}/pages/{type}
      const p2 = `websites/${companyId}/${websiteId}/pages/${type}`;
      const doc2 = getDocumentByPath(p2);
      if (doc2) return doc2;
    }

    return null;
  } catch (err) {
    console.error(`[sqliteDb] Error in fetchSiteDataFromSqlite for type="${type}":`, err);
    return null;
  }
}
