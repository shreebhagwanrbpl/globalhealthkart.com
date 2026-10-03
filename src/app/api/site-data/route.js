import { NextResponse } from "next/server";
import { WEBSITE_ID } from "@/lib/catalog-utils";
import { fetchSiteDataFromAdmin } from "@/lib/admin-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const websiteId = searchParams.get("websiteId") || WEBSITE_ID;
    const type = searchParams.get("type") || "all";

    const adminRes = await fetchSiteDataFromAdmin(websiteId, type);
    const data = adminRes?.data || adminRes || null;

    return NextResponse.json(
      {
        success: true,
        type,
        websiteId,
        data,
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
    console.error("[api/site-data] Error fetching site data:", error);
    return NextResponse.json(
      { success: false, data: null, error: "Failed to fetch site data" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        },
      }
    );
  }
}
