import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { CURRENT_WEBSITE_ID, WEBSITE_CONFIG } from "@/lib/constants";

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
    // 2. Districts
    let districts = [];
    try {
      const districtSnap = await getDocs(
        collection(db, "websites", CURRENT_WEBSITE_ID, "districts")
      );
      districts = districtSnap.docs.map((doc) => doc.data());
    } catch (dErr) {
      console.error("[sitemap] District fetch error:", dErr);
    }

    districts.forEach((district) => {
      const slug = district.slug;
      if (!slug) return;

      urls.push(
        {
          url: `${baseUrl}/${slug}`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        },
        {
          url: `${baseUrl}/${slug}/about`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${slug}/services`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${slug}/contact`,
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.6,
        },
        {
          url: `${baseUrl}/${slug}/items`,
          lastModified: new Date(),
          changeFrequency: "weekly",
          priority: 0.7,
        }
      );
    });

    // 3. Products from Master Catalog (strictly filtered by visibility)
    const products = await fetchFullCatalog({ forceFresh: true });

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
      districts.forEach((district) => {
        if (!district.slug) return;

        urls.push({
          url: `${baseUrl}/${district.slug}/items/${product.slug}`,
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