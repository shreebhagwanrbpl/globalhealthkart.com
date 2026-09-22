import { db } from "./src/lib/firebase.js";
import { collection, onSnapshot, getDocs } from "firebase/firestore";
import { isItemVisible, CURRENT_WEBSITE_ID } from "./src/lib/constants.js";

async function testSnapshot() {
  console.log("Setting up live real-time sync for rajbiosis...");
  const t0 = performance.now();
  
  // Listen to categories
  const unsubscribe = onSnapshot(collection(db, "companies", "rajbiosis", "categories"), async (catSnap) => {
    const t1 = performance.now();
    console.log(`[onSnapshot] Categories received: ${catSnap.docs.length} in ${(t1 - t0).toFixed(1)}ms`);
    
    // For each category, listen to subcategories
    let totalSubs = 0;
    let totalProds = 0;
    
    catSnap.docs.forEach(async (cDoc) => {
      const cData = cDoc.data();
      if (!isItemVisible(cData, CURRENT_WEBSITE_ID)) return;
      
      const subSnap = await getDocs(collection(db, "companies", "rajbiosis", "categories", cDoc.id, "subcategories"));
      totalSubs += subSnap.docs.length;
      subSnap.docs.forEach((sDoc) => {
        const sData = sDoc.data();
        if (!isItemVisible(sData, CURRENT_WEBSITE_ID)) return;
        const prods = sData.products || [];
        prods.forEach((p) => {
          if (isItemVisible(p, CURRENT_WEBSITE_ID)) totalProds++;
        });
      });
    });
  });

  setTimeout(() => {
    unsubscribe();
    process.exit(0);
  }, 5000);
}

testSnapshot().catch(console.error);
