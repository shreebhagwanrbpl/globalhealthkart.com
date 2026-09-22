import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import {
  CURRENT_COMPANY_ID,
  CURRENT_WEBSITE_ID,
  WEBSITE_CONFIG,
  isItemVisible,
  normalizeDomainId,
} from "./constants.js";

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

// Document cache with short TTL (5 seconds) to prevent redundant simultaneous reads during SSR
// while avoiding locking stale visibility states
const docCache = {};
let inFlightCatalogPromise = null;
let lastCatalogFetchTime = 0;
let lastCatalogData = null;
const SSR_CACHE_TTL_MS = 2000; // 2 seconds max during render burst

/**
 * Fetch a single document with short TTL cache.
 */
export async function fetchDocCached(path, forceFresh = false) {
  const now = Date.now();
  if (!forceFresh && docCache[path] && now - docCache[path].time < SSR_CACHE_TTL_MS) {
    return docCache[path].data;
  }

  try {
    const parts = path.split("/").filter(Boolean);
    const docRef = doc(db, ...parts);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      docCache[path] = { data, time: now };
      return data;
    }
    return null;
  } catch (err) {
    console.error(`Error fetching doc at ${path}:`, err);
    throw err;
  }
}

/**
 * Normalizes a single product object from Firestore into standard frontend shape
 */
function normalizeProductShape(prod, categoryName, subCategoryName, uniqueId) {
  const title = prod.title || prod.name || "Untitled Product";
  const desc = prod.desc || prod.description || "";
  const rawImages = Array.isArray(prod.images)
    ? prod.images
    : prod.image
    ? [prod.image]
    : [];
  
  return {
    ...prod,
    id: prod.id || prod.categoryProductId || uniqueId,
    uid: uniqueId,
    categoryProductId: prod.categoryProductId || prod.id || uniqueId,
    title,
    name: title,
    slug: prod.slug || makeSlug(title),
    price: prod.price || "",
    desc,
    description: desc,
    capacity: prod.capacity || "",
    throughput: prod.throughput || "",
    instrument: prod.instrument || "",
    model: prod.model || "",
    usage: prod.usage || "",
    brand: prod.brand || WEBSITE_CONFIG.companyName || "",
    parameters: prod.parameters || "",
    automation: prod.automation || "",
    availability: prod.availability || "",
    size: prod.size || "",
    category: categoryName || prod.category || "General Category",
    subCategory: subCategoryName || prod.subCategory || prod.subcategory || "General",
    images: rawImages,
    originalImages: prod.originalImages || rawImages,
    image: rawImages[0] || "",
    video: prod.video || "",
    pdf: prod.pdf || "",
    isPublished: prod.isPublished !== false,
    websiteIds: Array.isArray(prod.websiteIds) ? prod.websiteIds : [],
    companyId: prod.companyId || CURRENT_COMPANY_ID,
  };
}

/**
 * Fetch Full Catalog from Master Catalog:
 * Path: companies/{companyId}/categories/{categoryId}/subcategories/{subcategoryId}
 * 
 * Bulletproof Cascading Visibility:
 * 1. Category check: If category is hidden -> Skip all its subcategories and products.
 * 2. Subcategory check: If subcategory is hidden -> Skip all its products.
 * 3. Product check: If product is hidden (isPublished === false or not in websiteIds) -> Skip product.
 */
export async function fetchMasterCompanyCatalog(
  companyId = CURRENT_COMPANY_ID,
  websiteId = CURRENT_WEBSITE_ID
) {
  const startTime = performance.now();
  const allProducts = [];

  try {
    // 1. Query Master Categories for the company
    const categoriesCol = collection(db, "companies", companyId, "categories");
    const categorySnap = await getDocs(categoriesCol);

    // Process all categories in parallel
    await Promise.all(
      categorySnap.docs.map(async (categoryDoc) => {
        const catData = categoryDoc.data();
        const catId = categoryDoc.id;
        const categoryName = catData.name || catData.category || catId;

        // ====================================================
        // CASCADE STEP 1: Check Category Visibility
        // If Category is hidden -> immediately skip all subcategories & products!
        // ====================================================
        if (!isItemVisible(catData, websiteId)) {
          return;
        }

        try {
          // 2. Query Subcategories for this visible category
          const subcategoriesCol = collection(
            db,
            "companies",
            companyId,
            "categories",
            catId,
            "subcategories"
          );
          const subcategoriesSnap = await getDocs(subcategoriesCol);

          subcategoriesSnap.docs.forEach((subDoc) => {
            const subData = subDoc.data();
            const subId = subDoc.id;
            const subCategoryName = subData.name || subData.subCategory || subId;

            // ====================================================
            // CASCADE STEP 2: Check Subcategory Visibility
            // If Subcategory is hidden -> immediately skip all products!
            // ====================================================
            if (!isItemVisible(subData, websiteId)) {
              return;
            }

            // ====================================================
            // CASCADE STEP 3: Check Product Visibility
            // Read products from subData.products array
            // ====================================================
            const rawProducts = Array.isArray(subData.products) ? subData.products : [];
            
            rawProducts.forEach((prod, index) => {
              if (isItemVisible(prod, websiteId)) {
                const uid = `${catId}-${subId}-${prod.id || index}`;
                allProducts.push(
                  normalizeProductShape(prod, categoryName, subCategoryName, uid)
                );
              }
            });
          });
        } catch (subErr) {
          console.error(`Error fetching subcategories for category ${catId}:`, subErr);
        }

        // Direct category products (if any)
        if (Array.isArray(catData.products) && catData.products.length > 0) {
          catData.products.forEach((prod, index) => {
            if (isItemVisible(prod, websiteId)) {
              const uid = `${catId}-direct-${prod.id || index}`;
              allProducts.push(
                normalizeProductShape(prod, categoryName, prod.subCategory || categoryName, uid)
              );
            }
          });
        }
      })
    );

    const duration = performance.now() - startTime;
    console.log(
      `[data-fetcher] Master Catalog fetched: ${allProducts.length} visible product(s) for company "${companyId}" / website "${websiteId}" in ${duration.toFixed(1)}ms`
    );

    return allProducts;
  } catch (err) {
    console.error(`[data-fetcher] Error fetching master catalog for company ${companyId}:`, err);
    return [];
  }
}

/**
 * Fetch Full Catalog with Zero-Delay Sync:
 * Queries Master Catalog for CURRENT_COMPANY_ID and CURRENT_WEBSITE_ID.
 * Authoritative: What SuperAdmin assigns or unassigns is reflected directly.
 */
export async function fetchFullCatalog(options = {}) {
  const { forceFresh = false } = options;
  const now = Date.now();

  if (!forceFresh && lastCatalogData !== null && now - lastCatalogFetchTime < SSR_CACHE_TTL_MS) {
    return lastCatalogData;
  }

  if (inFlightCatalogPromise && !forceFresh) {
    return inFlightCatalogPromise;
  }

  const fetchPromise = (async () => {
    try {
      // Primary & Authoritative: Fetch from Master Company Catalog
      const products = await fetchMasterCompanyCatalog(CURRENT_COMPANY_ID, CURRENT_WEBSITE_ID);

      lastCatalogData = products;
      lastCatalogFetchTime = Date.now();
      return products;
    } catch (err) {
      console.error("[data-fetcher] Fatal error in fetchFullCatalog:", err);
      return lastCatalogData || [];
    } finally {
      if (inFlightCatalogPromise === fetchPromise) {
        inFlightCatalogPromise = null;
      }
    }
  })();

  if (!forceFresh) {
    inFlightCatalogPromise = fetchPromise;
  }

  return fetchPromise;
}

/**
 * Cached helper functions for static page contents
 */
export async function fetchHomeData() {
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/home`);
}

export async function fetchContactData() {
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/contact`);
}

export async function fetchServicesData() {
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/pages/services`);
}

export async function fetchDistrictData(district) {
  if (!district) return null;
  return fetchDocCached(`websites/${CURRENT_WEBSITE_ID}/districts/${district}`);
}
