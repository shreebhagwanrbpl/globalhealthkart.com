import { cache } from "react";
import {
  WEBSITE_ID,
  PRIMARY_COMPANY,
  ALL_COMPANIES,
  normalizeDomainId,
  isItemVisibleOnWebsite,
  normalizeProduct,
  makeSlug,
  normalizeSlug,
} from "./catalog-utils.js";
import {
  fetchCatalogDataFromSqlite,
  fetchSiteDataFromSqlite,
  isSqliteAvailable,
} from "./sqliteDb.js";
import {
  fetchCatalogFromAdmin,
  fetchSiteDataFromAdmin,
} from "./admin-api.js";

export {
  WEBSITE_ID,
  PRIMARY_COMPANY,
  ALL_COMPANIES,
  normalizeDomainId,
  isItemVisibleOnWebsite,
  normalizeProduct,
  makeSlug,
  normalizeSlug,
};

// Aliases for compatibility
export const normalizeSiteId = normalizeDomainId;
export const isVisibleOnWebsite = isItemVisibleOnWebsite;

/**
 * Fetch and process full catalog data from local SQLite DB (Instant <2ms) with Admin API fallback
 */
export const fetchFullCatalogData = cache(async (websiteId = WEBSITE_ID) => {
  try {
    // 1. Direct local SQLite Read (<2ms)
    if (isSqliteAvailable()) {
      const sqliteResult = fetchCatalogDataFromSqlite(websiteId);
      if (sqliteResult && (sqliteResult.products?.length > 0 || sqliteResult.categoryList?.length > 0)) {
        return sqliteResult;
      }
    }

    // 2. Admin API fallback if SQLite is not available or empty
    const rawResult = await fetchCatalogFromAdmin(websiteId);
    const categoryProducts = [];
    const categoryList = [];

    if (Array.isArray(rawResult?.products) && rawResult.products.length > 0) {
      rawResult.products.forEach((p, idx) => {
        if (isItemVisibleOnWebsite(p, websiteId)) {
          const norm = normalizeProduct(p, p.category, p.subCategory, `${p.id || idx}`);
          if (norm) categoryProducts.push(norm);
        }
      });
    }

    const categoriesData = rawResult?.categories || rawResult?.categoryList || rawResult?.data || [];
    if (Array.isArray(categoriesData)) {
      categoriesData.forEach((cat) => {
        const catName = cat.name || cat.category || cat.id || "Category";
        if (!isItemVisibleOnWebsite(cat, websiteId)) return;

        const subcategoryList = [];

        if (Array.isArray(cat.products)) {
          cat.products.forEach((p, pIdx) => {
            if (isItemVisibleOnWebsite(p, websiteId)) {
              const norm = normalizeProduct(p, catName, catName, `${cat.id || "cat"}-${p.id || pIdx}`);
              if (norm && !categoryProducts.some((cp) => cp.slug === norm.slug)) {
                categoryProducts.push(norm);
              }
            }
          });
        }

        const subcategories = cat.subcategories || cat.subCategories || [];
        if (Array.isArray(subcategories)) {
          subcategories.forEach((sub) => {
            const subName = sub.name || sub.subCategory || sub.id || "Subcategory";
            if (!isItemVisibleOnWebsite(sub, websiteId)) return;

            const subProds = [];
            if (Array.isArray(sub.products)) {
              sub.products.forEach((p, pIdx) => {
                if (isItemVisibleOnWebsite(p, websiteId)) {
                  const norm = normalizeProduct(p, catName, subName, `${cat.id}-${sub.id}-${p.id || pIdx}`);
                  if (norm) {
                    subProds.push(norm);
                    if (!categoryProducts.some((cp) => cp.slug === norm.slug)) {
                      categoryProducts.push(norm);
                    }
                  }
                }
              });
            }

            subcategoryList.push({
              id: sub.id || makeSlug(subName),
              name: subName,
              subCategory: subName,
              products: subProds,
            });
          });
        }

        categoryList.push({
          id: cat.id || makeSlug(catName),
          name: catName,
          category: catName,
          subcategories: subcategoryList,
        });
      });
    }

    return {
      categoryProducts,
      categoryList,
      products: categoryProducts,
    };
  } catch (err) {
    console.error("[db-server] Error in fetchFullCatalogData:", err);
    return {
      categoryProducts: [],
      categoryList: [],
      products: [],
    };
  }
});

/**
 * Fetch full flat catalog of visible products
 */
export async function fetchFullCatalog(options = {}) {
  const data = await fetchFullCatalogData();
  return data?.categoryProducts || [];
}

/**
 * Fetch categories hierarchy
 */
export async function getCategoriesData() {
  const data = await fetchFullCatalogData();
  return {
    categoryList: data?.categoryList || [],
    categoryProducts: data?.categoryProducts || [],
  };
}

/**
 * Get product by slug
 */
export async function getProductBySlug(slug) {
  if (!slug) return null;
  const products = await fetchFullCatalog();
  const target = normalizeSlug(slug);
  return (
    products.find(
      (p) =>
        normalizeSlug(p.slug) === target ||
        normalizeSlug(p.id) === target ||
        normalizeSlug(p.categoryProductId) === target
    ) || null
  );
}

/**
 * Fetch Home page data from SQLite with Admin API fallback
 */
export async function getHomeData(websiteId = WEBSITE_ID) {
  try {
    if (isSqliteAvailable()) {
      const sqliteData = fetchSiteDataFromSqlite("home", websiteId);
      if (sqliteData) return sqliteData;
    }

    const res = await fetchSiteDataFromAdmin(websiteId, "home");
    if (res?.success && res.data) {
      return res.data;
    }
    return res?.data || res || null;
  } catch (err) {
    console.error("[db-server] Error getting home data:", err);
    return null;
  }
}

/**
 * Fetch Services page data from SQLite with Admin API fallback
 */
export async function getServicesData(websiteId = WEBSITE_ID) {
  try {
    if (isSqliteAvailable()) {
      const sqliteData = fetchSiteDataFromSqlite("services", websiteId);
      if (sqliteData) {
        return sqliteData.services || sqliteData;
      }
    }

    const res = await fetchSiteDataFromAdmin(websiteId, "services");
    if (res?.success && res.data) {
      return res.data.services || res.data || [];
    }
    if (Array.isArray(res?.services)) {
      return res.services;
    }
    return res?.data?.services || [];
  } catch (err) {
    console.error("[db-server] Error getting services data:", err);
    return [];
  }
}

/**
 * Fetch Contact page data from SQLite with Admin API fallback
 */
export async function getContactData(websiteId = WEBSITE_ID) {
  try {
    if (isSqliteAvailable()) {
      const sqliteData = fetchSiteDataFromSqlite("contact", websiteId);
      if (sqliteData) {
        return sqliteData.contactInfo || sqliteData;
      }
    }

    const res = await fetchSiteDataFromAdmin(websiteId, "contact");
    if (res?.success && res.data) {
      return res.data.contactInfo || res.data || [];
    }
    if (Array.isArray(res?.contactInfo)) {
      return res.contactInfo;
    }
    if (Array.isArray(res)) {
      return res;
    }
    return res?.data?.contactInfo || [];
  } catch (err) {
    console.error("[db-server] Error getting contact data:", err);
    return [];
  }
}

/**
 * Fetch District data from SQLite with Admin API fallback
 */
export async function getDistrictData(districtSlug, websiteId = WEBSITE_ID) {
  if (!districtSlug) return null;
  try {
    if (isSqliteAvailable()) {
      const sqliteData = fetchSiteDataFromSqlite(`district_${districtSlug}`, websiteId);
      if (sqliteData) return sqliteData;
    }

    const res = await fetchSiteDataFromAdmin(websiteId, `district_${districtSlug}`);
    if (res?.success && res.data) {
      return res.data;
    }
    return res?.data || null;
  } catch (err) {
    console.error(`[db-server] Error getting district data for ${districtSlug}:`, err);
    return null;
  }
}

/**
 * Fetch Districts list from SQLite with Admin API fallback
 */
export async function getDistrictsList(websiteId = WEBSITE_ID) {
  try {
    if (isSqliteAvailable()) {
      const sqliteData = fetchSiteDataFromSqlite("districts", websiteId);
      if (sqliteData) {
        const list = sqliteData.districts || sqliteData.data || sqliteData;
        if (Array.isArray(list)) {
          return list.map((d) => d.slug || d.id || d).filter(Boolean);
        }
      }
    }

    const res = await fetchSiteDataFromAdmin(websiteId, "districts");
    if (res?.success && Array.isArray(res.data)) {
      return res.data.map((d) => d.slug || d.id || d).filter(Boolean);
    }
    if (Array.isArray(res)) {
      return res.map((d) => d.slug || d.id || d).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.error("[db-server] Error getting districts list:", err);
    return [];
  }
}
