import { fetchFullCatalog as fetchFullCatalogRaw } from "./data-fetcher";

/**
 * Server Data Fetcher:
 * Ensures fresh catalog retrieval on server requests with no stale cache locks.
 */
export async function fetchFullCatalog(options = {}) {
  const start = performance.now();
  const products = await fetchFullCatalogRaw({ forceFresh: true, ...options });
  const end = performance.now();
  console.log(`[data-fetcher-server] fetchFullCatalog returned ${products.length} products in ${(end - start).toFixed(1)}ms`);
  return products;
}
