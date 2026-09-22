import { NextResponse } from "next/server";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { CURRENT_COMPANY_ID, CURRENT_WEBSITE_ID } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET() {
  try {
    const products = await fetchFullCatalog({ forceFresh: true });

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products: products || [],
        companyId: CURRENT_COMPANY_ID,
        websiteId: CURRENT_WEBSITE_ID,
        timestamp: Date.now(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          "Pragma": "no-cache",
          "Expires": "0",
          "Surrogate-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("[api/catalog] Error fetching catalog:", error);
    return NextResponse.json(
      {
        success: false,
        count: 0,
        products: [],
        error: error.message || "Failed to fetch catalog",
        timestamp: Date.now(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  }
}
