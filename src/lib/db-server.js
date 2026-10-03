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

export const normalizeSiteId = normalizeDomainId;
export const isVisibleOnWebsite = isItemVisibleOnWebsite;

/**
 * Fetch and process full catalog data from SuperAdmin MongoDB API
 * Automatically groups products into dynamic Category & Subcategory trees
 */
export const fetchFullCatalogData = cache(async (websiteId = WEBSITE_ID) => {
  try {
    const rawResult = await fetchCatalogFromAdmin(websiteId);
    const categoryProducts = [];
    const categoryMap = new Map();

    const rawProducts = Array.isArray(rawResult?.products) ? rawResult.products : [];

    rawProducts.forEach((p, idx) => {
      if (isItemVisibleOnWebsite(p, websiteId)) {
        // Extract real category and subcategory from MongoDB document
        const catName = (p.data?.category || p.category || p.data?.categoryId || "Test Strips").trim();
        const subName = (p.data?.subCategory || p.data?.subcategory || p.subCategory || "General").trim();
        const uniqueId = p.id || p.data?.id || p.productId || p.data?.productId || "prod-" + idx;

        const norm = normalizeProduct(p, catName, subName, uniqueId);
        if (norm) {
          categoryProducts.push(norm);

          // Group into Category -> Subcategory hierarchy
          const catKey = catName.toLowerCase();
          if (!categoryMap.has(catKey)) {
            categoryMap.set(catKey, {
              id: makeSlug(catName),
              name: catName,
              category: catName,
              subcategoriesMap: new Map(),
            });
          }

          const catEntry = categoryMap.get(catKey);
          const subKey = subName.toLowerCase();
          if (!catEntry.subcategoriesMap.has(subKey)) {
            catEntry.subcategoriesMap.set(subKey, {
              id: makeSlug(subName),
              name: subName,
              subCategory: subName,
              products: [],
            });
          }

          catEntry.subcategoriesMap.get(subKey).products.push(norm);
        }
      }
    });

    // Build categoryList array with subcategories array
    const categoryList = Array.from(categoryMap.values()).map((cat) => ({
      id: cat.id,
      name: cat.name,
      category: cat.name,
      subcategories: Array.from(cat.subcategoriesMap.values()),
    }));

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

export async function fetchFullCatalog(options = {}) {
  const data = await fetchFullCatalogData();
  return data?.categoryProducts || [];
}

export async function getCategoriesData() {
  const data = await fetchFullCatalogData();
  return {
    categoryList: data?.categoryList || [],
    categoryProducts: data?.categoryProducts || [],
  };
}

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

export async function getHomeData(websiteId = WEBSITE_ID) {
  try {
    const res = await fetchSiteDataFromAdmin(websiteId, "home");
    if (res?.pages?.home) return res.pages.home;
    if (res?.data?.pages?.home) return res.data.pages.home;
    if (res?.data) return res.data;
    return res || null;
  } catch (err) {
    console.error("[db-server] Error getting home data:", err);
    return null;
  }
}

export async function getServicesData(websiteId = WEBSITE_ID) {
  try {
    const res = await fetchSiteDataFromAdmin(websiteId, "services");
    if (res?.pages?.services?.services) return res.pages.services.services;
    if (res?.data?.pages?.services?.services) return res.data.pages.services.services;
    if (Array.isArray(res?.data?.services)) return res.data.services;
    if (Array.isArray(res?.services)) return res.services;
    return [];
  } catch (err) {
    console.error("[db-server] Error getting services data:", err);
    return [];
  }
}

export async function getContactData(websiteId = WEBSITE_ID) {
  try {
    const res = await fetchSiteDataFromAdmin(websiteId, "contact");
    if (Array.isArray(res?.pages?.contact?.contactInfo)) return res.pages.contact.contactInfo;
    if (Array.isArray(res?.data?.pages?.contact?.contactInfo)) return res.data.pages.contact.contactInfo;
    if (Array.isArray(res?.data?.contactInfo)) return res.data.contactInfo;
    if (Array.isArray(res?.contactInfo)) return res.contactInfo;
    return [];
  } catch (err) {
    console.error("[db-server] Error getting contact data:", err);
    return [];
  }
}

export async function getDistrictData(districtSlug, websiteId = WEBSITE_ID) {
  if (!districtSlug) return null;
  try {
    const res = await fetchSiteDataFromAdmin(websiteId, "district_" + districtSlug);
    if (res?.data) return res.data;
    return res || null;
  } catch (err) {
    console.error("[db-server] Error getting district data:", err);
    return null;
  }
}

export async function getDistrictsList(websiteId = WEBSITE_ID) {
  try {
    const res = await fetchSiteDataFromAdmin(websiteId, "districts");
    if (Array.isArray(res?.data)) {
      return res.data.map((d) => d.slug || d.id || d).filter(Boolean);
    }
    return [];
  } catch (err) {
    console.error("[db-server] Error getting districts list:", err);
    return [];
  }
}
