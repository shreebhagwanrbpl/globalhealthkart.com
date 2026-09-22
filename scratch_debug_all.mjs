import { db } from "./src/lib/firebase.js";
import { collection, getDocs } from "firebase/firestore";
import { isItemVisible, CURRENT_WEBSITE_ID, normalizeDomainId } from "./src/lib/constants.js";

async function debugCatalog() {
  console.log("Current Website ID:", CURRENT_WEBSITE_ID);
  console.log("Normalized Website ID:", normalizeDomainId(CURRENT_WEBSITE_ID));

  for (const companyId of ["rajbiosis", "global", "human"]) {
    console.log(`\n================ COMPANY: ${companyId} ================`);
    const catsSnap = await getDocs(collection(db, "companies", companyId, "categories"));
    console.log(`Total categories in ${companyId}: ${catsSnap.docs.length}`);

    let visibleCats = 0;
    let visibleSubs = 0;
    let visibleProds = 0;

    for (const catDoc of catsSnap.docs) {
      const catData = catDoc.data();
      const catVis = isItemVisible(catData, CURRENT_WEBSITE_ID);
      if (catVis) visibleCats++;

      const subSnap = await getDocs(collection(db, "companies", companyId, "categories", catDoc.id, "subcategories"));
      for (const subDoc of subSnap.docs) {
        const subData = subDoc.data();
        const subVis = isItemVisible(subData, CURRENT_WEBSITE_ID);
        if (subVis && catVis) visibleSubs++;

        const prods = subData.products || [];
        for (const p of prods) {
          const pVis = isItemVisible(p, CURRENT_WEBSITE_ID);
          if (pVis && subVis && catVis) {
            visibleProds++;
          }
        }
      }
    }
    console.log(`[${companyId}] Summary for ${CURRENT_WEBSITE_ID}:`);
    console.log(`  Visible Categories: ${visibleCats} / ${catsSnap.docs.length}`);
    console.log(`  Visible Subcategories: ${visibleSubs}`);
    console.log(`  Visible Products: ${visibleProds}`);
  }
}

debugCatalog().then(() => process.exit(0)).catch(console.error);
