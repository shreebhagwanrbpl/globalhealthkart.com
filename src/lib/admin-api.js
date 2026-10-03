import {
  WEBSITE_ID as DEFAULT_WEBSITE_ID,
  PRIMARY_COMPANY as DEFAULT_PRIMARY_COMPANY,
} from "./catalog-utils.js";

export const DEFAULT_ADMIN_API_BASE_URL = "https://admin.rajbiosis.app";

export function getAdminApiBaseUrl() {
  return (
    process.env.ADMIN_API_BASE_URL ||
    process.env.ADMIN_API_URL ||
    DEFAULT_ADMIN_API_BASE_URL
  ).replace(/\/+$/, "");
}

export const ADMIN_API_BASE_URL = getAdminApiBaseUrl();
export const WEBSITE_ID = DEFAULT_WEBSITE_ID;
export const PRIMARY_COMPANY = DEFAULT_PRIMARY_COMPANY;

let catalogMemoryCache = {
  data: null,
  timestamp: 0,
};

/**
 * Fetch catalog data (products and categories) directly from SuperAdmin MongoDB API
 */
export async function fetchCatalogFromAdmin(websiteId = WEBSITE_ID) {
  const now = Date.now();
  if (catalogMemoryCache.data && now - catalogMemoryCache.timestamp < 60000) {
    return catalogMemoryCache.data;
  }

  try {
    const baseUrl = getAdminApiBaseUrl();
    const url = `${baseUrl}/api/${PRIMARY_COMPANY}/catalog?websiteId=${encodeURIComponent(websiteId)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[admin-api] fetchCatalog failed with status ${res.status}`);
      return catalogMemoryCache.data || { success: false, products: [], categoryList: [], data: [] };
    }

    const data = await res.json();
    catalogMemoryCache = {
      data,
      timestamp: now,
    };
    return data;
  } catch (error) {
    console.error("[admin-api] Error fetching catalog from Admin API:", error);
    return catalogMemoryCache.data || { success: false, products: [], categoryList: [], data: [] };
  }
}

/**
 * Fetch site-data (home, contact, services, districts, etc.) from SuperAdmin MongoDB API
 */
export async function fetchSiteDataFromAdmin(websiteId = WEBSITE_ID, type = "all") {
  try {
    const baseUrl = getAdminApiBaseUrl();
    const url = `${baseUrl}/api/${PRIMARY_COMPANY}/site-data?websiteId=${encodeURIComponent(websiteId)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return { success: false, data: null };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error(`[admin-api] Error fetching site data (${type}) from Admin API:`, error);
    return { success: false, data: null };
  }
}

/**
 * Forward contact form queries to SuperAdmin API
 */
export async function submitContactQuery(queryData) {
  try {
    const baseUrl = getAdminApiBaseUrl();
    const url = `${baseUrl}/api/contact-query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        websiteId: WEBSITE_ID,
        companyId: PRIMARY_COMPANY,
        ...queryData,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const fallbackUrl = `${baseUrl}/api/queries/contact`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          companyId: PRIMARY_COMPANY,
          ...queryData,
          createdAt: new Date().toISOString(),
        }),
      });

      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
      throw new Error(`Admin API returned status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("[admin-api] Error submitting contact query:", error);
    throw error;
  }
}

/**
 * Forward product enquiry queries to SuperAdmin API
 */
export async function submitProductQuery(queryData) {
  try {
    const baseUrl = getAdminApiBaseUrl();
    const url = `${baseUrl}/api/product-query`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        websiteId: WEBSITE_ID,
        companyId: PRIMARY_COMPANY,
        ...queryData,
        createdAt: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      const fallbackUrl = `${baseUrl}/api/queries/product`;
      const fallbackRes = await fetch(fallbackUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          websiteId: WEBSITE_ID,
          companyId: PRIMARY_COMPANY,
          ...queryData,
          createdAt: new Date().toISOString(),
        }),
      });

      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
      throw new Error(`Admin API returned status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("[admin-api] Error submitting product query:", error);
    throw error;
  }
}
