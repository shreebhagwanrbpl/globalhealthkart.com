/**
 * Single Source of Truth for Website Configuration & Dynamic Visibility
 */

export const WEBSITE_ID = "globalhealthkartcom";
export const SQLITE_DB_PATH = "../SuperAdminRBPL/data/catalog.db";
export const PRIMARY_COMPANY = "rajbiosis";
export const ALL_COMPANIES = ["rajbiosis", "human", "global"];

/**
 * Normalizes any domain or website ID string by stripping protocol, www,
 * slashes, dots, hyphens, underscores, and spaces.
 * 
 * Examples:
 *  "globalhealthkart.com" -> "globalhealthkartcom"
 *  "https://www.globalhealthkart.com/" -> "globalhealthkartcom"
 *  "global-health-kart.com" -> "globalhealthkartcom"
 */
export function normalizeDomainId(str = "") {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[\/\?#].*$/, "")
    .replace(/[^a-z0-9]/g, "");
}

export const TARGET_WEBSITE_NORM = normalizeDomainId(WEBSITE_ID);

/**
 * Strict Exact Domain Matching & Cascading Visibility Check (NO ALIAS LEAKS)
 * 
 * Rules:
 * 1. isPublished === false -> HIDE (false)
 * 2. status === "inactive" || status === "draft" -> HIDE (false)
 * 3. websiteIds === [] (empty array, 0 access) -> HIDE (false)
 * 4. websiteIds includes "all" || exact normalized match -> SHOW (true)
 * 5. websiteIds === undefined || null -> SHOW (true)
 * 6. Otherwise -> HIDE (false)
 */
export function isItemVisibleOnWebsite(item, websiteId = WEBSITE_ID) {
  if (!item) return false;
  if (item.isPublished === false) return false;
  if (item.status === "inactive" || item.status === "draft") return false;

  const targetNorm = normalizeDomainId(websiteId) || TARGET_WEBSITE_NORM;

  // If websiteIds is missing/null/undefined -> default to visible
  if (item.websiteIds === undefined || item.websiteIds === null) {
    return true;
  }

  if (Array.isArray(item.websiteIds)) {
    // If explicitly empty array [] -> 0 websites selected -> HIDDEN
    if (item.websiteIds.length === 0) {
      return false;
    }
    // Strict exact match: targetNorm === sNorm or "all"
    return item.websiteIds.some((site) => {
      const sNorm = normalizeDomainId(site);
      return sNorm === targetNorm || sNorm === "all";
    });
  }

  return true;
}

export const makeSlug = (text = "") =>
  String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

function safeDecode(str = "") {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

export const normalizeSlug = (s = "") =>
  safeDecode(String(s || ""))
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * Normalizes a single product object into standard frontend shape
 */
export function normalizeProduct(prod, categoryName = "", subCategoryName = "", uniqueId = "") {
  if (!prod || typeof prod !== "object") return null;

  const title = (prod.title || prod.name || prod.productName || prod.itemName || "Untitled Product").trim();
  if (!title) return null;

  const slug = prod.slug || makeSlug(title);
  const desc = prod.desc || prod.description || prod.detail || prod.summary || "";

  let rawImages = [];
  if (Array.isArray(prod.images) && prod.images.length > 0) {
    rawImages = prod.images.filter(Boolean);
  } else if (prod.image) {
    rawImages = [prod.image];
  } else if (prod.imageUrl) {
    rawImages = [prod.imageUrl];
  } else if (prod.imgUrl) {
    rawImages = [prod.imgUrl];
  }

  const primaryImage = rawImages[0] || "/placeholder.png";

  return {
    ...prod,
    id: prod.id || prod.categoryProductId || uniqueId || slug,
    uid: uniqueId || prod.id || slug,
    categoryProductId: prod.categoryProductId || prod.id || uniqueId || slug,
    title,
    name: title,
    slug,
    price: prod.price || "",
    desc,
    description: desc,
    capacity: prod.capacity || "",
    throughput: prod.throughput || "",
    instrument: prod.instrument || "",
    model: prod.model || "",
    usage: prod.usage || "",
    brand: prod.brand || "Raj Biosis",
    parameters: prod.parameters || "",
    automation: prod.automation || "",
    availability: prod.availability || "",
    size: prod.size || "",
    category: categoryName || prod.category || "General Category",
    subCategory: subCategoryName || prod.subCategory || prod.subcategory || "General",
    images: rawImages,
    originalImages: prod.originalImages || rawImages,
    image: primaryImage,
    video: prod.video || "",
    pdf: prod.pdf || "",
    isPublished: prod.isPublished !== false,
    websiteIds: Array.isArray(prod.websiteIds) ? prod.websiteIds : ["all"],
    companyId: prod.companyId || PRIMARY_COMPANY,
  };
}
