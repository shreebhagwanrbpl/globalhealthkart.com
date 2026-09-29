import {
  WEBSITE_ID as DEFAULT_WEBSITE_ID,
  PRIMARY_COMPANY as DEFAULT_PRIMARY_COMPANY,
} from "./catalog-utils.js";

export const ADMIN_API_BASE_URL = (
  process.env.ADMIN_API_BASE_URL ||
  process.env.ADMIN_API_URL ||
  process.env.SQLITE_ADMIN_API_URL ||
  (process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://admin.rajbiosis.app")
).replace(/\/$/, "");

export const WEBSITE_ID = DEFAULT_WEBSITE_ID;
export const PRIMARY_COMPANY = DEFAULT_PRIMARY_COMPANY;

/**
 * Fetch catalog data (products and categories) from SQLite Admin API
 */
export async function fetchCatalogFromAdmin(websiteId = WEBSITE_ID) {
  try {
    const url = `${ADMIN_API_BASE_URL}/api/catalog?websiteId=${encodeURIComponent(websiteId)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[admin-api] fetchCatalog failed with status ${res.status}`);
      return { success: false, products: [], categoryList: [], data: [] };
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("[admin-api] Error fetching catalog from Admin API:", error);
    return { success: false, products: [], categoryList: [], data: [] };
  }
}

/**
 * Fetch site-data (home, contact, services, districts, etc.) from SQLite Admin API
 */
export async function fetchSiteDataFromAdmin(websiteId = WEBSITE_ID, type = "all") {
  try {
    const url = `${ADMIN_API_BASE_URL}/api/site-data?websiteId=${encodeURIComponent(websiteId)}&type=${encodeURIComponent(type)}`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      console.warn(`[admin-api] fetchSiteData failed with status ${res.status} for type=${type}`);
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
 * Forward contact form queries to SQLite Admin API
 */
export async function submitContactQuery(queryData) {
  try {
    const url = `${ADMIN_API_BASE_URL}/api/contact-query`;
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
      // Try fallback route if main is 404
      const fallbackUrl = `${ADMIN_API_BASE_URL}/api/queries/contact`;
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

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("[admin-api] Error submitting contact query:", error);
    throw error;
  }
}

/**
 * Forward product enquiry queries to SQLite Admin API
 */
export async function submitProductQuery(queryData) {
  try {
    const url = `${ADMIN_API_BASE_URL}/api/product-query`;
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
      const fallbackUrl = `${ADMIN_API_BASE_URL}/api/queries/product`;
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

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("[admin-api] Error submitting product query:", error);
    throw error;
  }
}
