/**
 * Dynamic Website Configuration, Domain Normalization & Master Catalog Visibility System
 */

// Known Company Definitions and Websites
export const COMPANY_MAPPINGS = {
  human: {
    id: "human",
    displayName: "Human Biomedical",
    websites: [
      "humanbiomedicalin",
      "humanbiomedicalorg",
      "humanbiomedicalsnet",
      "humanbiomedicalsin",
      "humanbiomedicalcom",
      "humanbiomedicalsorg",
      "humanbiomedicalscoin",
    ],
  },
  global: {
    id: "global",
    displayName: "Global Biomedical",
    websites: [
      "globalbiomedicalorg",

      "globalbiomedicalcoin",
      "globalbiomedicalin",
      "globalbiomedicalsin",
      "globalbiomedicalsnet",
    ],
  },
  rajbiosis: {
    id: "rajbiosis",
    displayName: "Raj Biosis",
    websites: [
      "rajbiosisinfo",
      "rajbiosiscoin",
      "rajbiosisltd",
      "rajvedcom",
      "globalhealthkartcom",
      "indiandiagnosticscom",
      "centralbiomedicalsin",
      "globalhealthcartcom",
      "globalhealthdirectorycom",
    ],
  },
};

/**
 * Normalizes any domain or website ID string by stripping protocol, www,
 * slashes, dots, hyphens, underscores, and spaces.
 * 
 * Examples:
 *  "globalhealthkart.com" -> "globalhealthkartcom"
 *  "https://www.globalhealthkart.com/" -> "globalhealthkartcom"
 *  "global-health-kart.com" -> "globalhealthkartcom"
 *  "globalhealthkart.co.in" -> "globalhealthkartcoin"
 */
export function normalizeDomainId(str = "") {
  if (!str) return "";
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/[\/\?#].*$/, "") // Remove paths/query
    .replace(/[^a-z0-9]/g, ""); // Strip dots, dashes, underscores, spaces
}

/**
 * Returns canonical variations of a website identifier (e.g. 'globalhealthkartcom', 'globalhealthkart')
 */
export function getWebsiteVariants(siteId = CURRENT_WEBSITE_ID) {
  const norm = normalizeDomainId(siteId);
  const variants = new Set([norm]);
  // Also add version without common tlds if applicable
  const withoutTld = norm.replace(/(com|coin|in|org|net|info|ltd)$/i, "");
  if (withoutTld.length >= 4) {
    variants.add(withoutTld);
  }
  return variants;
}

/**
 * Dynamic Company & Website ID Detection:
 * Identifies current website and company based on environment, package name, or domain.
 */
export function getWebsiteConfig() {
  const rawWebsiteId =
    process.env.NEXT_PUBLIC_WEBSITE_ID ||
    process.env.WEBSITE_ID ||
    "globalhealthkartcom";

  const rawCompanyId =
    process.env.NEXT_PUBLIC_COMPANY_ID ||
    process.env.COMPANY_ID ||
    "";

  const normalizedWebsiteId = normalizeDomainId(rawWebsiteId);
  const domain = "globalhealthkart.com";
  const baseUrl = `https://${domain}`;

  // Auto-detect company: Check which company in COMPANY_MAPPINGS includes this website
  let detectedCompanyId = rawCompanyId;
  if (!detectedCompanyId) {
    for (const [compId, compData] of Object.entries(COMPANY_MAPPINGS)) {
      if (
        Array.isArray(compData.websites) &&
        compData.websites.some((w) => normalizeDomainId(w) === normalizedWebsiteId)
      ) {
        detectedCompanyId = compId;
        break;
      }
    }
  }

  if (!detectedCompanyId) {
    if (normalizedWebsiteId.includes("human")) {
      detectedCompanyId = "human";
    } else if (normalizedWebsiteId.includes("global") && COMPANY_MAPPINGS.global.websites.includes(normalizedWebsiteId)) {
      detectedCompanyId = "global";
    } else {
      detectedCompanyId = "rajbiosis";
    }
  }

  const companyConfig =
    COMPANY_MAPPINGS[detectedCompanyId] || COMPANY_MAPPINGS.rajbiosis;

  return {
    websiteId: rawWebsiteId,
    normalizedWebsiteId,
    companyId: detectedCompanyId,
    companyName: companyConfig.displayName,
    domain,
    baseUrl,
  };
}

// Pre-evaluated config singleton
export const WEBSITE_CONFIG = getWebsiteConfig();
export const CURRENT_WEBSITE_ID = WEBSITE_CONFIG.normalizedWebsiteId;
export const CURRENT_COMPANY_ID = WEBSITE_CONFIG.companyId;

/**
 * Bulletproof Visibility & Instant Hide Logic:
 * 
 * Rules:
 * 1. item.isPublished === false -> Hide (false)
 * 2. item.websiteIds is [] (empty array, 0 websites selected) -> Hide (false)
 * 3. item.websiteIds.includes("all") -> Show (true)
 * 4. Domain Normalization: match normalized websiteIds with normalized current website ID or variants
 */
export function isItemVisible(item, targetWebsiteId = CURRENT_WEBSITE_ID) {
  if (!item) return false;

  // 1. Explicit unpublished check
  if (item.isPublished === false) {
    return false;
  }

  // 2. Empty websiteIds array (0 websites selected -> Hide)
  const rawWebsites = item.websiteIds;
  if (!rawWebsites || !Array.isArray(rawWebsites) || rawWebsites.length === 0) {
    return false;
  }

  // 3. "all" keyword
  if (rawWebsites.includes("all")) {
    return true;
  }

  // 4. Strict Domain Normalization match
  const targetVariants = getWebsiteVariants(targetWebsiteId);
  const normalizedSites = rawWebsites.map((site) => normalizeDomainId(site));

  if (normalizedSites.includes("all")) {
    return true;
  }

  for (const site of normalizedSites) {
    if (!site) continue;
    if (targetVariants.has(site)) {
      return true;
    }
  }

  return false;
}
