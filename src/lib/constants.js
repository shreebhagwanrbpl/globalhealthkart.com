import {
  WEBSITE_ID,
  PRIMARY_COMPANY,
  normalizeDomainId,
  isItemVisibleOnWebsite,
} from "./catalog-utils.js";

export {
  WEBSITE_ID,
  PRIMARY_COMPANY,
  normalizeDomainId,
  isItemVisibleOnWebsite,
};

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

export const CURRENT_WEBSITE_ID = WEBSITE_ID;
export const CURRENT_COMPANY_ID = PRIMARY_COMPANY;

export function getWebsiteConfig() {
  const domain = "globalhealthkart.com";
  const baseUrl = `https://${domain}`;

  return {
    websiteId: WEBSITE_ID,
    normalizedWebsiteId: normalizeDomainId(WEBSITE_ID),
    companyId: CURRENT_COMPANY_ID,
    companyName: COMPANY_MAPPINGS[CURRENT_COMPANY_ID]?.displayName || "Raj Biosis",
    domain,
    baseUrl,
  };
}

export const WEBSITE_CONFIG = getWebsiteConfig();

// Compatibility alias
export const isItemVisible = isItemVisibleOnWebsite;
