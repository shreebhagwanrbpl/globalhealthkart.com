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
const CLIENT_CACHE_TTL = 15000;

export async function fetchFullCatalog(options = {}) {
  if (typeof window === "undefined") {
    const { fetchFullCatalog: fetchServerCatalog } = await import("./db-server.js");
    return await fetchServerCatalog(options);
  }

  const data = await fetchFullCatalogData();
  return data?.categoryProducts || data?.products || [];
}

export async function fetchFullCatalogData() {
  if (typeof window === "undefined") {
    const { fetchFullCatalogData: fetchServerData } = await import("./db-server.js");
    return await fetchServerData();
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
        throw new Error("Failed to fetch catalog: " + res.status);
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

export async function fetchHomeData() {
  if (typeof window === "undefined") {
    const { getHomeData } = await import("./db-server.js");
    return await getHomeData();
  }

  try {
    const res = await fetch("/api/site-data?type=home", { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data?.pages?.home || json?.data || json || null;
  } catch (err) {
    console.error("[data-fetcher] Error fetching home data:", err);
    return null;
  }
}

export async function fetchServicesData() {
  if (typeof window === "undefined") {
    const { getServicesData } = await import("./db-server.js");
    return await getServicesData();
  }

  try {
    const res = await fetch("/api/site-data?type=services", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.pages?.services?.services || json?.data?.services || json?.services || [];
  } catch (err) {
    console.error("[data-fetcher] Error fetching services data:", err);
    return [];
  }
}

export async function fetchContactData() {
  if (typeof window === "undefined") {
    const { getContactData } = await import("./db-server.js");
    return await getContactData();
  }

  try {
    const res = await fetch("/api/site-data?type=contact", { cache: "no-store" });
    if (!res.ok) return [];
    const json = await res.json();
    return json?.data?.pages?.contact?.contactInfo || json?.data?.contactInfo || json?.contactInfo || [];
  } catch (err) {
    console.error("[data-fetcher] Error fetching contact data:", err);
    return [];
  }
}

export async function fetchDistrictData(districtSlug) {
  if (!districtSlug) return null;

  if (typeof window === "undefined") {
    const { getDistrictData } = await import("./db-server.js");
    return await getDistrictData(districtSlug);
  }

  try {
    const res = await fetch("/api/site-data?type=district_" + districtSlug, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.error("[data-fetcher] Error fetching district data:", err);
    return null;
  }
}

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
