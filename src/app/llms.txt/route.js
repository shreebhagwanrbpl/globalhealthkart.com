import { fetchFullCatalog, fetchContactData } from "@/lib/data-fetcher";
import { WEBSITE_CONFIG } from "@/lib/constants";
import { parseContactInfo } from "@/lib/contact-parser";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const products = await fetchFullCatalog({ forceFresh: true });
    let contactInfo = [];
    try {
      contactInfo = await fetchContactData();
    } catch (_) { }

    const { phones, emails, address } = parseContactInfo(contactInfo);
    const baseUrl = WEBSITE_CONFIG.baseUrl || "https://globalhealthkart.com";
    const companyName = WEBSITE_CONFIG.companyName || "Raj Biosis";

    // Group products by category and subcategory
    const grouped = {};
    products.forEach((p) => {
      const cat = p.category || "General";
      const sub = p.subCategory || "Products";
      if (!grouped[cat]) grouped[cat] = {};
      if (!grouped[cat][sub]) grouped[cat][sub] = [];
      grouped[cat][sub].push(p);
    });

    let markdown = `# ${companyName} - Product Catalog (Raj Biosis)\n\n`;
    markdown += `> Website: ${baseUrl}\n`;
    markdown += `> Company: ${companyName}\n`;
    markdown += `> Updated: ${new Date().toUTCString()}\n`;
    markdown += `> Total Active Products: ${products.length}\n\n`;
    markdown += `## Overview\n`;
    markdown += `${companyName} is a premier supplier and distributor of high-quality diagnostic and biomedical equipment, medical instruments, reagents, and laboratory consumables across India.\n\n`;
    markdown += `## Main Navigation\n`;
    markdown += `- Home: ${baseUrl}\n`;
    markdown += `- Products Catalog: ${baseUrl}/items\n`;
    markdown += `- About Us: ${baseUrl}/about\n`;
    markdown += `- Services: ${baseUrl}/services\n`;
    markdown += `- Contact: ${baseUrl}/contact\n\n`;
    markdown += `## Master Catalog Products\n`;

    if (products.length === 0) {
      markdown += `\n*No products are currently visible or assigned for this website.*\n`;
    } else {
      for (const [category, subcategories] of Object.entries(grouped)) {
        markdown += `\n### Category: ${category}\n`;
        for (const [subCategory, prodList] of Object.entries(subcategories)) {
          markdown += `\n#### Subcategory: ${subCategory} (${prodList.length} items)\n`;
          for (const prod of prodList) {
            const prodUrl = `${baseUrl}/items/${prod.slug}`;
            markdown += `- **[${prod.title}](${prodUrl})**\n`;
            if (prod.brand || prod.model) {
              markdown += `  - Brand/Model: ${prod.brand || "N/A"} ${prod.model ? `(${prod.model})` : ""}\n`;
            }
            if (prod.price) {
              markdown += `  - Price: ₹${prod.price}\n`;
            }
            if (prod.capacity || prod.throughput || prod.instrument) {
              markdown += `  - Specs: ${[prod.capacity && `Capacity: ${prod.capacity}`, prod.throughput && `Throughput: ${prod.throughput}`, prod.instrument && `Instrument: ${prod.instrument}`].filter(Boolean).join(" | ")}\n`;
            }
            if (prod.desc || prod.description) {
              markdown += `  - Description: ${(prod.desc || prod.description).slice(0, 160)}...\n`;
            }
          }
        }
      }
    }

    if (phones.length > 0 || emails.length > 0 || address) {
      markdown += `\n## Contact Information\n`;
      if (phones.length > 0) markdown += `- **Phone Numbers:** ${phones.join(", ")}\n`;
      if (emails.length > 0) markdown += `- **Email Addresses:** ${emails.join(", ")}\n`;
      if (address) markdown += `- **Office Address:** ${address}\n`;
    }

    return new Response(markdown, {
      status: 200,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error) {
    console.error("[llms.txt] Error generating llms.txt:", error);
    return new Response(
      `# Raj Biosis\nError generating product catalog: ${error.message}`,
      {
        status: 500,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      }
    );
  }
}
