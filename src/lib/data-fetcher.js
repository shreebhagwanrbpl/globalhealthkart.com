import {
  makeSlug,
  normalizeSlug,
  normalizeDomainId,
  isItemVisibleOnWebsite,
  normalizeProduct,
  WEBSITE_ID,
} from "./catalog-utils.js";

export { makeSlug, normalizeSlug, normalizeDomainId, isItemVisibleOnWebsite, normalizeProduct, WEBSITE_ID };
export const normalizeSiteId = normalizeDomainId;
export const isVisibleOnWebsite = isItemVisibleOnWebsite;

let clientCatalogCache = null;
let clientCatalogPromise = null;
let lastCatalogFetch = 0;
const CLIENT_CACHE_TTL = 15000; // 15 seconds

/**
 * Fetch full catalog for client or server components
 */
export async function fetchFullCatalog(options = {}) {
  if (typeof window === "undefined") {
    const { fetchFullCatalog: fetchServerCatalog } = await import("./db-server.js");
    return await fetchServerCatalog(options);
  }

  const data = await fetchFullCatalogData();
  return data?.categoryProducts || data?.products || [];
}

/**
 * Fetch catalog data with categories hierarchy
 */
export async function fetchFullCatalogData() {
  if (typeof window === "undefined") {
    const { fetchFullCatalogData: fetchServerCatalog } = await import("./db-server.js");
    return await fetchServerCatalog();
  }

  const now = Date.now();
  if (clientCatalogCache && now - lastCatalogFetch < CLIENT_CACHE_TTL) {
    return clientCatalogCache;
  }

  if (clientCatalogPromise) {
    return clientCatalogPromise;
  }

  clientCatalogPromise = (async () => {
    try {
      const res = await fetch("/api/catalog", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Failed to fetch catalog: ${res.status}`);
      }
      const data = await res.json();
      clientCatalogCache = data;
      lastCatalogFetch = Date.now();
      return data;
    } catch (err) {
      console.error("[data-fetcher] Error in fetchFullCatalogData:", err);
      return { categoryProducts: [], categoryList: [], products: [] };
    } finally {
      clientCatalogPromise = null;
    }
  })();

  return clientCatalogPromise;
}

export async function getCategoriesData() {
  const data = await fetchFullCatalogData();
  return {
    categoryList: data?.categoryList || [],
    categoryProducts: data?.categoryProducts || data?.products || [],
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

/**
 * Fetch Home Page Data
 */
export async function fetchHomeData() {
  if (typeof window === "undefined") {
    const { getHomeData } = await import("./db-server.js");
    return await getHomeData();
  }

  try {
    const res = await fetch("/api/site-data?type=home", { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || json || null;
  } catch (err) {
    console.error("[data-fetcher] Error fetching home data:", err);
    return null;
  }
}

/**
 * Fetch Services Data
 */
export async function fetchServicesData() {
  if (typeof window === "undefined") {
    const { getServicesData } = await import("./db-server.js");
    return await getServicesData();
  }

  try {
    const res = await fetch("/api/site-data?type=services", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.services || json?.services || json?.data || [];
  } catch (err) {
    console.error("[data-fetcher] Error fetching services data:", err);
    return [];
  }
}

/**
 * Fetch Contact Data
 */
export async function fetchContactData() {
  if (typeof window === "undefined") {
    const { getContactData } = await import("./db-server.js");
    return await getContactData();
  }

  try {
    const res = await fetch("/api/site-data?type=contact", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.contactInfo || json?.contactInfo || json?.data || [];
  } catch (err) {
    console.error("[data-fetcher] Error fetching contact data:", err);
    return [];
  }
}

/**
 * Fetch District Data
 */
export async function fetchDistrictData(districtSlug) {
  if (!districtSlug) return null;

  if (typeof window === "undefined") {
    const { getDistrictData } = await import("./db-server.js");
    return await getDistrictData(districtSlug);
  }

  try {
    const res = await fetch(`/api/site-data?type=district_${districtSlug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.error(`[data-fetcher] Error fetching district data for ${districtSlug}:`, err);
    return null;
  }
}

/**
 * Fetch Districts List
 */
export async function fetchDistrictsList() {
  if (typeof window === "undefined") {
    const { getDistrictsList } = await import("./db-server.js");
    return await getDistrictsList();
  }

  try {
    const res = await fetch("/api/site-data?type=districts", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data || [];
  } catch (err) {
    console.error("[data-fetcher] Error fetching districts list:", err);
    return [];
  }
}

/**
 * Polling subscription to catalog changes
 */
export function subscribeToCatalog(onUpdate, intervalMs = 5000) {
  let active = true;

  const poll = async () => {
    if (!active) return;
    try {
      const catalog = await fetchFullCatalog();
      if (active && onUpdate) {
        onUpdate(catalog);
      }
    } catch (err) {
      console.warn("[data-fetcher] Catalog subscription poll error:", err);
    }
  };

  poll();
  const timer = setInterval(poll, intervalMs);

  return () => {
    active = false;
    clearInterval(timer);
  };
}
