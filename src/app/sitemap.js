import { fetchFullCatalogData, getDistrictsList } from "@/lib/db-server";
import { WEBSITE_CONFIG } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap() {
  const baseUrl = WEBSITE_CONFIG.baseUrl || "https://globalhealthkart.com";
  const urls = [];

  // 1. Static Pages
  urls.push(
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/services`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/items`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    }
  );

  try {
    const [catalogData, districtsList] = await Promise.all([
      fetchFullCatalogData().catch(() => ({ categoryProducts: [] })),
      getDistrictsList().catch(() => []),
    ]);

    const districts = Array.isArray(districtsList) ? districtsList : [];
    const products = Array.isArray(catalogData?.categoryProducts) ? catalogData.categoryProducts : [];

    // 2. District Pages
    districts.forEach((districtSlug) => {
      if (!districtSlug) return;

      urls.push(
        {
          url: `${baseUrl}/${districtSlug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/${districtSlug}/about`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${districtSlug}/services`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${districtSlug}/contact`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${districtSlug}/items`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }
      );
    });

    // 3. Products Pages
    products.forEach((product) => {
      if (!product.slug) return;

      // Main Product URL
      urls.push({
        url: `${baseUrl}/items/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      });

      // District Product URLs
      districts.forEach((districtSlug) => {
        if (!districtSlug) return;

        urls.push({
          url: `${baseUrl}/${districtSlug}/items/${product.slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        });
      });
    });
  } catch (error) {
    console.error("[sitemap] Sitemap generation error:", error);
  }

  return urls;
}