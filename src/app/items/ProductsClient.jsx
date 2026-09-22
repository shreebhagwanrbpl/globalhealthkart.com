"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
  Profiler,
} from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Truck,
  BadgeCheck,
  PackageCheck,
  Search,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { Toaster } from "react-hot-toast";

import SectionTitle from "@/components/SectionTitle";
import ProductCard from "@/components/ProductCard";

/* =========================================================
   PRODUCT LINK
========================================================= */

const ProductLink = memo(function ProductLink({
  item,
  category,
  scrollToProduct,
}) {
  return (
    <button
      onClick={() => scrollToProduct(item.slug, category)}
      className="
        block
        w-full
        text-left
        py-1
        text-sm
        text-[#A45F35]
        hover:text-[#874723]
        hover:translate-x-1
        transition-all
        duration-200
        font-medium
      "
    >
      • {item.title}
    </button>
  );
});

/* =========================================================
   SUB CATEGORY
========================================================= */

const SubCategoryItem = memo(function SubCategoryItem({
  category,
  subCategory,
  subList,
  isSubOpened,
  toggleSubCategory,
  scrollToProduct,
}) {
  return (
    <div className="space-y-2 pl-2">

      {/* Subcategory Header */}
      <button
        onClick={() => toggleSubCategory(category, subCategory)}
        className="
          w-full
          text-left
          py-1.5
          flex
          justify-between
          items-center
          text-xs
          font-bold
          text-[#A45F35]
          hover:text-[#874723]
          transition-colors
          uppercase
          tracking-wider
          border-b
          border-slate-200
          pb-1
        "
      >
        <span className="flex items-center gap-1.5">

          <span
            className={`transition-transform duration-200 ${isSubOpened ? "rotate-90" : ""
              }`}
          >
            <ChevronRight
              size={12}
              className="text-[#A45F35]"
            />
          </span>

          {subCategory}

        </span>

        <span
          className="
            text-[10px]
            font-semibold
            bg-[#F1DDD1]
            text-[#A45F35]
            px-1.5
            py-0.5
            rounded-full
          "
        >
          {subList.length}
        </span>

      </button>

      {/* Product List */}
      <div
        className={`transition-all duration-300 ease-in-out pl-3 overflow-hidden ${isSubOpened
          ? "max-h-48 opacity-100 mt-1 mb-2"
          : "max-h-0 opacity-0"
          }`}
      >
        {isSubOpened && (
          <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1.5 pr-1">

            {subList.map((item) => (
              <ProductLink
                key={item.uid}
                item={item}
                category={category}
                scrollToProduct={scrollToProduct}
              />
            ))}

          </div>
        )}
      </div>

    </div>
  );
});

/* =========================================================
   CATEGORY
========================================================= */

const CategoryItem = memo(function CategoryItem({
  category,
  isOpened,
  isActive,
  subcategories,
  categoryProductCount,
  toggleCategory,
  toggleSubCategory,
  openedSubCategories,
  scrollToProduct,
}) {
  return (
    <div className="group">

      {/* Category Button */}
      <button
        onClick={() => toggleCategory(category)}
        className={`
          sticky
          top-[116px]
          z-10
          w-full
          px-4
          py-3
          flex
          justify-between
          items-center
          rounded-2xl
          transition-all
          duration-200
          text-left

          ${isActive
            ? "bg-[#F1DDD1] text-[#A45F35] font-bold"
            : "bg-white text-slate-700 hover:bg-[#F8EEE8] hover:text-[#A45F35]"
          }
        `}
      >

        <span className="flex items-center gap-3 text-sm font-semibold leading-none">

          <span
            className={`transition-transform duration-200 ${isOpened ? "rotate-90" : ""
              }`}
          >
            <ChevronRight
              size={16}
              className={
                isActive
                  ? "text-[#A45F35]"
                  : "text-[#F8EEE8]0 group-hover:text-[#A45F35]"
              }
            />
          </span>

          {category}

        </span>

        <span
          className="
            text-xs
            font-semibold
            px-2
            py-0.5
            rounded-full
            bg-[#F1DDD1]
            text-[#A45F35]
          "
        >
          {categoryProductCount}
        </span>

      </button>

      {/* Subcategories */}
      <div
        className={`transition-all duration-300 ease-in-out pl-4 overflow-hidden ${isOpened
          ? "max-h-[1000px] opacity-100 mt-2 mb-4"
          : "max-h-0 opacity-0"
          }`}
      >
        {isOpened && (
          <div className="space-y-3 pt-1">

            {Object.entries(subcategories || {}).map(
              ([subCategory, subList]) => {

                const subKey = `${category}-${subCategory}`;

                const isSubOpened =
                  !!openedSubCategories[subKey];

                return (
                  <SubCategoryItem
                    key={subKey}
                    category={category}
                    subCategory={subCategory}
                    subList={subList}
                    isSubOpened={isSubOpened}
                    toggleSubCategory={toggleSubCategory}
                    scrollToProduct={scrollToProduct}
                  />
                );
              }
            )}

          </div>
        )}
      </div>

    </div>
  );
});

/* =========================================================
   PRODUCTS CLIENT
========================================================= */

export default function ProductsClient({
  initialProducts = [],
  district = null,
  city = null,
}) {
  const [products, setProducts] = useState(initialProducts || []);
  const [categorySearch, setCategorySearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [productSearch, setProductSearch] = useState("");

  const [openedCategory, setOpenedCategory] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  const [openedSubCategories, setOpenedSubCategories] =
    useState({});

  const [pendingScroll, setPendingScroll] =
    useState(null);

  const [showTopButton, setShowTopButton] =
    useState(false);

  /* =========================================================
     SYNC WITH PROPS (SERVER REVALIDATION / NAVIGATION)
  ========================================================= */

  useEffect(() => {
    if (Array.isArray(initialProducts)) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  /* =========================================================
     ZERO-DELAY REAL-TIME SYNC (3s Live Polling + Window Focus)
  ========================================================= */

  const fetchLiveCatalog = useCallback(async () => {
    try {
      const res = await fetch(`/api/catalog?t=${Date.now()}`, {
        cache: "no-store",
        headers: {
          "Pragma": "no-cache",
          "Cache-Control": "no-cache",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.warn("[ProductsClient] Live sync poll warning:", err);
    }
  }, []);

  useEffect(() => {
    // 1. Initial live check
    fetchLiveCatalog();

    // 2. 3-Second Live Polling Interval
    const pollInterval = setInterval(fetchLiveCatalog, 3000);

    // 3. Window Focus Listener
    const handleWindowFocus = () => {
      fetchLiveCatalog();
    };
    window.addEventListener("focus", handleWindowFocus);

    // 4. Tab Visibility Change Listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchLiveCatalog();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // 5. Network Online Event
    window.addEventListener("online", handleWindowFocus);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener("focus", handleWindowFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleWindowFocus);
    };
  }, [fetchLiveCatalog]);

  /* =========================================================
     PRODUCT SEARCH DEBOUNCE
  ========================================================= */

  useEffect(() => {
    const timer = setTimeout(() => {
      setProductSearch(searchInput);
    }, 200);

    return () => clearTimeout(timer);
  }, [searchInput]);

  /* =========================================================
     FILTER + GROUP
  ========================================================= */

  const {
    filteredProducts,
    sortedGroupedProducts,
    categoryCounts,
  } = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    const filtered = query
      ? products.filter((item) => {
        const title =
          (item.title || "").toLowerCase();

        const brand =
          (item.brand || "").toLowerCase();

        const model =
          (item.model || "").toLowerCase();

        const category =
          (item.category || "").toLowerCase();

        const subCategory =
          (item.subCategory || "").toLowerCase();

        return (
          title.includes(query) ||
          brand.includes(query) ||
          model.includes(query) ||
          category.includes(query) ||
          subCategory.includes(query)
        );
      })
      : products;

    const grouped = {};
    const counts = {};

    filtered.forEach((item) => {
      const cat =
        item.category || "Other Products";

      const sub =
        item.subCategory || cat;

      if (!grouped[cat]) {
        grouped[cat] = {};
        counts[cat] = 0;
      }

      if (!grouped[cat][sub]) {
        grouped[cat][sub] = [];
      }

      grouped[cat][sub].push(item);
      counts[cat]++;
    });

    const entries = Object.entries(grouped);

    entries.sort(([a], [b]) => {
      if (a === "Other Products") return 1;
      if (b === "Other Products") return -1;

      return a.localeCompare(b);
    });

    const sortedObj = {};

    for (const [cat, subObj] of entries) {
      const subEntries =
        Object.entries(subObj);

      subEntries.sort(([a], [b]) => {
        if (a === cat) return -1;
        if (b === cat) return 1;

        return a.localeCompare(b);
      });

      sortedObj[cat] =
        Object.fromEntries(subEntries);
    }

    return {
      filteredProducts: filtered,
      sortedGroupedProducts: sortedObj,
      categoryCounts: counts,
    };
  }, [products, productSearch]);

  /* =========================================================
     CATEGORY COUNT
  ========================================================= */

  const getCategoryProductCount =
    useCallback(
      (categoryName) => {
        return categoryCounts[categoryName] || 0;
      },
      [categoryCounts]
    );

  /* =========================================================
     CATEGORY TOGGLE
  ========================================================= */

  const toggleCategory =
    useCallback((category) => {
      setOpenedCategory((prev) =>
        prev === category ? "" : category
      );

      setActiveCategory(category);
    }, []);

  /* =========================================================
     SUBCATEGORY TOGGLE
  ========================================================= */

  const toggleSubCategory =
    useCallback(
      (category, subCategory) => {
        const key =
          `${category}-${subCategory}`;

        setOpenedSubCategories((prev) => ({
          ...prev,
          [key]: !prev[key],
        }));
      },
      []
    );

  /* =========================================================
     SCROLL TO PRODUCT
  ========================================================= */

  const scrollToProduct =
    useCallback(
      (slug, category) => {
        setOpenedCategory(category);
        setActiveCategory(category);
        setPendingScroll(slug);

        const prod =
          initialProducts.find(
            (p) => p.slug === slug
          );

        if (prod && prod.subCategory) {
          const subKey =
            `${category}-${prod.subCategory}`;

          setOpenedSubCategories((prev) => ({
            ...prev,
            [subKey]: true,
          }));
        }
      },
      [initialProducts]
    );

  /* =========================================================
     PRODUCT SCROLL
  ========================================================= */

  useEffect(() => {
    if (!pendingScroll) return;

    const timer = setTimeout(() => {
      const el =
        document.getElementById(
          pendingScroll
        );

      if (el) {
        el.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }

      setPendingScroll(null);
    }, 300);

    return () => clearTimeout(timer);
  }, [openedCategory, pendingScroll]);

  /* =========================================================
     BACK TO TOP
  ========================================================= */

  useEffect(() => {
    const handleScroll = () => {
      setShowTopButton(
        window.scrollY > 500
      );
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <Profiler
      id="ProductsLayout"
      onRender={() => { }}
    >




      {/* =====================================================
          SEO
      ===================================================== */}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type":
              "MedicalEquipmentSupplier",
            name: "Raj Biosis",
            url: "https://globalhealthkart.com",
            areaServed: city,
            description:
              `Medical laboratory and hospital equipment in ${city}`,
            address: {
              "@type": "PostalAddress",
              addressLocality: city,
              addressCountry: "India",
            },
          }),
        }}
      />

      {/* =====================================================
          TOASTER
      ===================================================== */}

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            borderRadius: "14px",
            padding: "14px 18px",
            fontSize: "15px",
            fontWeight: "600",
          },
        }}
      />

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <section className="section-padding bg-white">

        <div className="container-custom">

          <SectionTitle
            badge="Featured Products"
            title="Premium Biomedical Equipment"
            description="Discover high-quality diagnostic and biomedical technologies tailored for laboratories, healthcare institutions, and modern diagnostics."
            center
          />

        </div>

        {/* ===================================================
            PRODUCT SEARCH
        =================================================== */}

        <div
          className="
            max-w-2xl
            mx-auto
            mt-6
            lg:mt-10
            px-4
            lg:px-0
            relative
          "
        >

          <Search
            size={22}
            className="
              absolute
              left-5
              top-1/2
              -translate-y-1/2
              text-[#F8EEE8]0
            "
          />

          <input
            type="text"
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) =>
              setSearchInput(e.target.value)
            }
            className="
              w-full
              h-16
              pl-14
              pr-5
              rounded-2xl
              border
              border-slate-200
              bg-white
              shadow-sm
              focus:outline-none
              focus:ring-2
              focus:ring-[#A45F35]
              focus:border-[#A45F35]
              transition-all
            "
          />

        </div>

        {/* ===================================================
            LAYOUT
        =================================================== */}

        <div
          className="
            grid
            grid-cols-1
            lg:grid-cols-[320px_minmax(0,1fr)]
            gap-6
            lg:gap-10
            mt-8
            lg:mt-16
            items-start
            px-4
            lg:px-0
          "
        >

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside
            className="
              lg:sticky
              lg:top-24
              self-start
              rounded-[32px]
              border
              border-slate-200
              bg-white
              shadow-lg
              shadow-[#F1DDD1]/40
              px-6
              pb-6
              pt-0
              max-h-[calc(100vh-120px)]
              overflow-y-auto
              custom-scrollbar
              relative
            "
          >

            {/* Sidebar Header */}

            <div
              className="
                sticky
                top-0
                -mx-6
                pt-6
                px-6
                pb-3
                bg-white
                z-20
                border-b
                border-slate-200
                mb-4
                h-[116px]
              "
            >

              <h3
                className="
                  text-xl
                  font-bold
                  text-slate-900
                  mb-3
                  flex
                  items-center
                  justify-between
                "
              >

                <span>
                  Categories
                </span>

                <span
                  className="
                    text-xs
                    bg-[#F1DDD1]
                    text-[#A45F35]
                    font-semibold
                    px-2
                    py-0.5
                    rounded-full
                  "
                >
                  {
                    Object.keys(
                      sortedGroupedProducts
                    ).length
                  }
                </span>

              </h3>

              {/* Category Search */}

              <div className="relative">

                <Search
                  size={16}
                  className="
                    absolute
                    left-3.5
                    top-1/2
                    -translate-y-1/2
                    text-[#F8EEE8]0
                  "
                />

                <input
                  type="text"
                  placeholder="Search categories..."
                  value={categorySearch}
                  onChange={(e) =>
                    setCategorySearch(
                      e.target.value
                    )
                  }
                  className="
                    w-full
                    h-10
                    pl-10
                    pr-4
                    rounded-xl
                    border
                    border-[#F1DDD1]
                    bg-[#F8EEE8]
                    text-sm
                    text-slate-700
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#A45F35]
                    focus:bg-white
                    focus:border-[#E8C8B6]
                    transition-all
                  "
                />

              </div>

            </div>

            {/* Categories */}

            <div className="space-y-1.5">

              {Object.keys(
                sortedGroupedProducts
              )
                .filter((category) =>
                  category
                    .toLowerCase()
                    .includes(
                      categorySearch.toLowerCase()
                    )
                )
                .map((category) => {

                  const isOpened =
                    openedCategory === category;

                  const isActive =
                    activeCategory === category;

                  const subcategories =
                    sortedGroupedProducts[
                    category
                    ] || {};

                  const count =
                    getCategoryProductCount(
                      category
                    );

                  return (
                    <CategoryItem
                      key={category}
                      category={category}
                      isOpened={isOpened}
                      isActive={isActive}
                      subcategories={
                        subcategories
                      }
                      categoryProductCount={
                        count
                      }
                      toggleCategory={
                        toggleCategory
                      }
                      toggleSubCategory={
                        toggleSubCategory
                      }
                      openedSubCategories={
                        openedSubCategories
                      }
                      scrollToProduct={
                        scrollToProduct
                      }
                    />
                  );
                })}

            </div>

          </aside>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div className="space-y-16">

            {/* Empty State / Product Not Found */}

            {products.length === 0 ? (
              <div
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-[32px]
                  p-10
                  lg:p-16
                  text-center
                  shadow-lg
                  shadow-[#F1DDD1]/40
                "
              >
                <div
                  className="
                    w-24
                    h-24
                    mx-auto
                    rounded-full
                    bg-[#F1DDD1]
                    flex
                    items-center
                    justify-center
                    text-5xl
                    mb-6
                  "
                >
                  📦
                </div>

                <h2
                  className="
                    text-2xl
                    lg:text-4xl
                    font-bold
                    text-slate-900
                  "
                >
                  No Products Available
                </h2>

                <p
                  className="
                    mt-4
                    text-slate-600
                    max-w-xl
                    mx-auto
                    leading-7
                  "
                >
                  Our catalog is currently being updated. Please check back shortly or reach out to our team for custom inquiries.
                </p>

                <button
                  onClick={fetchLiveCatalog}
                  className="
                    mt-8
                    inline-flex
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#A45F35]
                    px-8
                    py-3.5
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-[#E8C8B6]/40
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#874723]
                    hover:shadow-xl
                    active:scale-95
                  "
                >
                  Refresh Catalog
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (

              <div
                className="
                  bg-white
                  border
                  border-slate-200
                  rounded-[32px]
                  p-10
                  lg:p-16
                  text-center
                  shadow-lg
                  shadow-[#F1DDD1]/40
                "
              >

                <div
                  className="
                    w-24
                    h-24
                    mx-auto
                    rounded-full
                    bg-[#F1DDD1]
                    flex
                    items-center
                    justify-center
                    text-5xl
                    mb-6
                  "
                >
                  🔍
                </div>

                <h2
                  className="
                    text-2xl
                    lg:text-4xl
                    font-bold
                    text-slate-900
                  "
                >
                  Product Not Found
                </h2>

                <p
                  className="
                    mt-4
                    text-slate-600
                    max-w-xl
                    mx-auto
                    leading-7
                  "
                >
                  We couldn't find any products
                  matching{" "}

                  <span
                    className="
                      font-semibold
                      text-[#A45F35]
                    "
                  >
                    {` "${productSearch}" `}
                  </span>

                  . Please try another keyword
                  or browse categories.
                </p>

                <button
                  onClick={() => {
                    setSearchInput("");
                    setProductSearch("");
                  }}
                  className="
                    mt-8
                    inline-flex
                    items-center
                    justify-center
                    rounded-2xl
                    bg-[#A45F35]
                    px-8
                    py-3.5
                    text-white
                    font-semibold
                    shadow-lg
                    shadow-[#E8C8B6]/40
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-[#874723]
                    hover:shadow-xl
                    active:scale-95
                  "
                >
                  View All Products
                </button>

              </div>

            ) : (

              Object.entries(
                sortedGroupedProducts
              ).map(
                ([category, subcategoriesObj]) => (

                  <section
                    key={category}
                    id={category
                      .replace(/\s+/g, "-")
                      .toLowerCase()}
                  >

                    {/* Category Header */}

                    <div
                      className="
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-2
                        border-b
                        border-slate-200
                        pb-4
                        lg:pb-5
                        mb-8
                      "
                    >

                      <h2
                        className="
                          text-3xl
                          font-bold
                          text-slate-900
                        "
                      >
                        {category}
                      </h2>

                      <span
                        className="
                          text-[#A45F35]
                          font-semibold
                        "
                      >
                        {
                          Object.values(
                            subcategoriesObj
                          ).reduce(
                            (sum, list) =>
                              sum + list.length,
                            0
                          )
                        }{" "}
                        Products
                      </span>

                    </div>

                    {/* Subcategories */}

                    <div className="space-y-12">

                      {Object.entries(
                        subcategoriesObj
                      ).map(
                        ([subCategory, list]) => (

                          <div
                            key={subCategory}
                            className="space-y-6"
                          >

                            {/* Subcategory Heading */}

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                              "
                            >

                              <h3
                                className="
                                  text-xl
                                  font-bold
                                  text-[#A45F35]
                                  uppercase
                                  tracking-wide
                                "
                              >
                                {subCategory}
                              </h3>

                              <span
                                className="
                                  text-xs
                                  font-semibold
                                  px-2.5
                                  py-0.5
                                  rounded-full
                                  bg-[#F1DDD1]
                                  text-[#A45F35]
                                "
                              >
                                {list.length}{" "}
                                {list.length === 1
                                  ? "Product"
                                  : "Products"}
                              </span>

                            </div>

                            {/* Product List */}

                            <div className="space-y-8">

                              {list
                                .slice(0, 12)
                                .map((product) => (

                                  <ProductCard
                                    key={product.uid}
                                    product={product}
                                    district={district}
                                  />

                                ))}

                            </div>

                          </div>

                        )
                      )}

                    </div>

                  </section>

                )
              )

            )}

          </div>

        </div>

      </section>

      {/* =====================================================
          WHY CHOOSE PRODUCTS
      ===================================================== */}

      <section
        className="
          section-padding
          bg-[#F1DDD1]
        "
      >

        <div className="container-custom">

          <SectionTitle
            badge="Why Our Products"
            title="Trusted Quality & Innovation"
            description="We provide biomedical products designed for performance, reliability, and healthcare excellence."
            center
          />

          <div
            className="
              grid
              lg:grid-cols-4
              md:grid-cols-2
              gap-8
              mt-16
            "
          >

            {[
              {
                icon: <ShieldCheck size={30} />,
                title: "Certified Quality",
              },
              {
                icon: <Truck size={30} />,
                title: "Fast Delivery",
              },
              {
                icon: <BadgeCheck size={30} />,
                title: "Trusted Support",
              },
              {
                icon: <PackageCheck size={30} />,
                title: "Premium Equipment",
              },
            ].map((item, index) => (

              <div
                key={index}
                className="
                  bg-white
                  rounded-[30px]
                  border
                  border-slate-200
                  shadow-lg
                  shadow-[#F1DDD1]/40
                  text-center
                  p-8
                  transition-all
                  duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  hover:shadow-[#F1DDD1]/60
                "
              >

                <div
                  className="
                    w-16
                    h-16
                    mx-auto
                    rounded-[22px]
                    bg-[#F1DDD1]
                    text-[#A45F35]
                    flex
                    items-center
                    justify-center
                    mb-6
                  "
                >
                  {item.icon}
                </div>

                <h3
                  className="
                    text-xl
                    font-semibold
                    text-slate-900
                  "
                >
                  {item.title}
                </h3>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          BACK TO TOP
      ===================================================== */}

      {showTopButton && (

        <button
          onClick={scrollToTop}
          aria-label="Back to top"
          className="
            fixed
            bottom-8
            right-8
            z-50
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-[#A45F35]
            text-white
            shadow-lg
            shadow-[#E8C8B6]/40
            transition-all
            duration-300
            hover:-translate-y-1
            hover:bg-[#874723]
            hover:shadow-xl
            active:scale-95
          "
        >
          <ChevronUp size={24} />
        </button>

      )}

    </Profiler>
  );
}