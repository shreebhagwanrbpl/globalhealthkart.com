"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchFullCatalog } from "@/lib/data-fetcher";

import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";

import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Building2,
  ArrowRight,
  Wrench,
  Activity,
  Truck,
  Headphones,
} from "lucide-react";

/* ==========================================================
   HOME PRODUCT CARD

   IMPORTANT:
   This is only for Home page.
   ProductCard.jsx is NOT used here.
========================================================== */

function HomeProductCard({
  product,
  district = null,
}) {
  if (!product) return null;

  const slug =
    product.slug ||
    product.productSlug ||
    product.title
      ?.toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");

  const productLink = district
    ? `/${district}/items/${slug}`
    : `/items/${slug}`;

  /* ========================================================
     PRODUCT IMAGE
  ======================================================== */

  let imageUrl = "/placeholder.png";

  if (
    Array.isArray(product.images) &&
    product.images.length > 0
  ) {
    const firstImage = product.images[0];

    if (typeof firstImage === "string") {
      imageUrl = firstImage;
    } else if (firstImage?.url) {
      imageUrl = firstImage.url;
    } else if (firstImage?.src) {
      imageUrl = firstImage.src;
    }
  } else if (product.image) {
    imageUrl = product.image;
  } else if (product.imageUrl) {
    imageUrl = product.imageUrl;
  } else if (product.imageURL) {
    imageUrl = product.imageURL;
  }

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#E8C8B6] bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-[#A45F35]/10">

      {/* ====================================================
          IMAGE
      ==================================================== */}

      <Link href={productLink}>
        <div className="relative flex h-[250px] items-center justify-center overflow-hidden bg-[#F7F8F0] p-6">

          <Image
            src={imageUrl}
            alt={
              product.title ||
              "Biomedical Equipment"
            }
            width={500}
            height={400}
            unoptimized
            className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
          />

        </div>
      </Link>

      {/* ====================================================
          PRODUCT DETAILS
      ==================================================== */}

      <div className="flex flex-1 flex-col p-6">

        {/* PRODUCT NAME */}

        <Link href={productLink}>
          <h3 className="line-clamp-2 min-h-[56px] text-xl font-bold leading-7 text-slate-900 transition-colors duration-300 group-hover:text-[#A45F35]">
            {product.title ||
              "Biomedical Equipment"}
          </h3>
        </Link>


        {/* BRAND + MODEL */}
        <div className="mt-5 space-y-2">

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-semibold text-slate-500">
              Brand:
            </span>

            <span className="line-clamp-1 text-sm font-semibold text-[#A45F35]">
              {product.brand || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="shrink-0 text-sm font-semibold text-slate-500">
              Model:
            </span>

            <span className="line-clamp-1 text-sm font-medium text-slate-700">
              {product.model || "N/A"}
            </span>
          </div>

        </div>
        {/* BUTTON */}

        <div className="mt-auto pt-6">

          <Link
            href={productLink}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#A45F35] px-5 py-3 font-semibold !text-white transition-all duration-300 hover:bg-[#874723] hover:shadow-lg hover:shadow-[#A45F35]/20"
          >
            <span className="!text-white">
              View Details
            </span>

            <ArrowRight
              size={17}
              className="!text-white"
            />
          </Link>

        </div>

      </div>
    </div>
  );
}


/* ==========================================================
   HOME PAGE
========================================================== */

export default function HomePage() {
  const pathname = usePathname();

  const [services, setServices] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] =
    useState(true);

  const [heroData, setHeroData] = useState({
    title: "",
    description: "",
    button1Text: "",
    button2Text: "",
  });

  /* ========================================================
     CITY / DISTRICT
  ======================================================== */

  const pathParts =
    pathname?.split("/").filter(Boolean) || [];

  const staticRoutes = [
    "about",
    "services",
    "items",
    "contact",
  ];

  const currentDistrict =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const currentCity = currentDistrict
    ? currentDistrict
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) =>
        char.toUpperCase()
      )
    : "";

  /* ========================================================
     LINK HANDLER
  ======================================================== */

  const makeLink = (path) => {
    if (!currentDistrict) {
      return path;
    }

    if (path === "/") {
      return `/${currentDistrict}`;
    }

    return `/${currentDistrict}${path}`;
  };

  /* ========================================================
     LOAD HERO DATA
  ======================================================== */

  useEffect(() => {
    const loadHero = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "globalhealthkartcom",
            "pages",
            "home"
          )
        );

        if (snap.exists()) {
          setHeroData(snap.data());
        }
      } catch (error) {
        console.error(
          "Hero data error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadHero();
  }, []);

  /* ========================================================
     LOAD SERVICES + FULL PRODUCT CATALOG (WITH LIVE SYNC)
  ======================================================== */

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        /* ------------------------------------------------
           SERVICES
        ------------------------------------------------ */

        const serviceSnap = await getDoc(
          doc(
            db,
            "websites",
            "globalhealthkartcom",
            "pages",
            "services"
          )
        );

        if (serviceSnap.exists()) {
          const serviceData =
            serviceSnap.data();

          setServices(
            Array.isArray(
              serviceData.services
            )
              ? serviceData.services
              : []
          );
        }

        /* ------------------------------------------------
           PRODUCTS: Live sync from /api/catalog or master catalog
        ------------------------------------------------ */
        let allProducts = [];
        try {
          const res = await fetch(`/api/catalog?t=${Date.now()}`, {
            cache: "no-store",
            headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
          });
          if (res.ok) {
            const json = await res.json();
            if (json && Array.isArray(json.products)) {
              allProducts = json.products;
            }
          }
        } catch (_) {}

        if (!allProducts || allProducts.length === 0) {
          allProducts = await fetchFullCatalog({ forceFresh: true });
        }

        const normalizedProducts =
          Array.isArray(allProducts)
            ? allProducts.map((product) => ({
              ...product,

              slug:
                product.slug ||
                product.productSlug ||
                product.title
                  ?.toLowerCase()
                  .trim()
                  .replace(
                    /[^a-z0-9\s-]/g,
                    ""
                  )
                  .replace(
                    /\s+/g,
                    "-"
                  ),
            }))
            : [];

        setProducts(
          normalizedProducts
        );
      } catch (error) {
        console.error(
          "Home data error:",
          error
        );
      } finally {
        setProductsLoading(false);
      }
    };

    loadHomeData();

    // Auto-refresh when tab is focused
    const handleFocus = () => loadHomeData();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") loadHomeData();
    });

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  /* ========================================================
     ONLY 3 PRODUCTS
  ======================================================== */

  const featuredProducts = products
    .filter(
      (product) =>
        product &&
        product.title
    )
    .slice(0, 3);

  /* ========================================================
     ONLY 3 SERVICES
  ======================================================== */

  const featuredServices = services
    .filter(Boolean)
    .slice(0, 3);

  /* ========================================================
     SERVICE ICONS
  ======================================================== */

  const serviceIcons = [
    <Microscope
      key="microscope"
      size={30}
    />,
    <FlaskConical
      key="flask"
      size={30}
    />,
    <ShieldCheck
      key="shield"
      size={30}
    />,
    <Stethoscope
      key="stethoscope"
      size={30}
    />,
    <Wrench
      key="wrench"
      size={30}
    />,
    <Activity
      key="activity"
      size={30}
    />,
  ];

  return (
    <>
      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="relative overflow-hidden bg-white">

        <div className="container-custom py-10 md:py-14 lg:py-16">

          {/* TOP INTRO */}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">

            <div className="mx-auto mb-5 flex w-fit items-center gap-3 text-sm font-bold uppercase tracking-[0.2em] text-[#A45F35]">

              <span className="h-2 w-2 rounded-full bg-[#A45F35]" />

              Biomedical & Diagnostic Solutions

              <span className="h-2 w-2 rounded-full bg-[#A45F35]" />

            </div>


          </motion.div>


          {/* ====================================================
              MINIMAL CAROUSEL
              IMAGE TOP + TEXT BOTTOM
          ==================================================== */}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="relative mx-auto mt-10 max-w-6xl"
          >
            <div className="overflow-hidden rounded-[28px] border border-[#E8C8B6] bg-white shadow-[0_20px_60px_rgba(164,95,53,0.10)]">

              {/* IMAGE — TOP */}
              <div className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-[#F8EEE8] sm:min-h-[390px] lg:min-h-[500px]">
                <Image
                  src="/home.png"
                  alt="Biomedical Equipment and Healthcare Solutions"
                  width={1400}
                  height={900}
                  priority
                  className="h-[280px] w-full object-contain px-5 transition-transform duration-700 hover:scale-[1.03] sm:h-[360px] sm:px-8 lg:h-[460px] lg:px-12"
                />

                {/* Minimal carousel controls */}
                <button
                  type="button"
                  aria-label="Previous slide"
                  className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8C8B6] bg-white/90 text-[#A45F35] shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-[#A45F35] hover:text-white"
                >
                  <span className="text-xl leading-none">‹</span>
                </button>

                <button
                  type="button"
                  aria-label="Next slide"
                  className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#E8C8B6] bg-white/90 text-[#A45F35] shadow-sm backdrop-blur-sm transition-all duration-300 hover:bg-[#A45F35] hover:text-white"
                >
                  <span className="text-xl leading-none">›</span>
                </button>

                <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow-sm">
                  <span className="h-2 w-6 rounded-full bg-[#A45F35]" />
                  <span className="h-2 w-2 rounded-full bg-[#E8C8B6]" />
                  <span className="h-2 w-2 rounded-full bg-[#E8C8B6]" />
                </div>
              </div>

              {/* TEXT — BOTTOM */}
              <div className="border-t border-[#E8C8B6] bg-white px-6 py-7 text-center sm:px-10 sm:py-8 lg:px-14">
                <div className="mb-3 flex items-center justify-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-[#A45F35]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A45F35]" />
                  Healthcare Technology
                  <span className="h-1.5 w-1.5 rounded-full bg-[#A45F35]" />
                </div>

                <h2 className="mx-auto max-w-4xl text-2xl font-black leading-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  {heroData.title || "Advanced Biomedical Solutions For Modern Healthcare"}
                </h2>

                <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  {heroData.description || "Reliable biomedical equipment, laboratory solutions and professional support for hospitals, laboratories and healthcare institutions."}
                </p>

                <div className="mt-5 flex flex-wrap justify-center gap-3">
                  <Link
                    href={makeLink("/items")}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#A45F35] px-6 py-3 font-semibold !text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#874723] hover:shadow-lg"
                  >
                    <span className="!text-white">
                      {heroData.button1Text || "Explore Products"}
                    </span>
                    <ArrowRight
                      size={17}
                      className="!text-white transition-transform duration-300 group-hover:translate-x-0.5"
                    />
                  </Link>

                  <Link
                    href={makeLink("/contact")}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-[#A45F35] bg-white px-6 py-3 font-semibold !text-[#A45F35] transition-all duration-300 hover:bg-[#A45F35] hover:!text-white"
                  >
                    <span className="!text-[#A45F35] group-hover:!text-white">
                      {heroData.button2Text || "Contact Us"}
                    </span>
                  </Link>
                </div>
              </div>

              {/* STATS */}
              <div className="grid border-t border-[#E8C8B6] bg-[#F8EEE8] sm:grid-cols-4">
                <div className="border-b border-[#E8C8B6] px-5 py-4 text-center sm:border-b-0 sm:border-r">
                  <p className="text-2xl font-black text-[#A45F35]">5000+</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Happy Clients</p>
                </div>
                <div className="border-b border-[#E8C8B6] px-5 py-4 text-center sm:border-b-0 sm:border-r">
                  <p className="text-2xl font-black text-[#A45F35]">3500+</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Products</p>
                </div>
                <div className="border-b border-[#E8C8B6] px-5 py-4 text-center sm:border-b-0 sm:border-r">
                  <p className="text-2xl font-black text-[#A45F35]">10+</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Years Experience</p>
                </div>
                <div className="px-5 py-4 text-center">
                  <p className="text-2xl font-black text-[#A45F35]">24/7</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">Customer Support</p>
                </div>
              </div>

            </div>
          </motion.div>

        </div>

      </section>


      {/* ====================================================
          TRUST
      ==================================================== */}

      <section className="bg-white py-20">

        <div className="container-custom">

          <div className="text-center">

            <span className="rounded-full bg-[#F8EEE8] px-5 py-2 text-sm font-semibold text-[#A45F35]">
              TRUSTED ACROSS INDIA
            </span>

            <h2 className="mt-5 text-4xl font-black text-slate-900">
              Trusted By Hospitals, Laboratories & Healthcare Professionals
            </h2>

            <p className="mx-auto mt-5 max-w-3xl leading-8 text-slate-600">
              Delivering reliable biomedical equipment with quality,
              innovation and professional service support.
            </p>

          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-4">

            {[
              {
                number: "5000+",
                title: "Happy Clients",
                icon: Building2,
              },
              {
                number: "3500+",
                title: "Products",
                icon: Microscope,
              },
              {
                number: "10+",
                title: "Years Experience",
                icon: ShieldCheck,
              },
              {
                number: "24/7",
                title: "Support",
                icon: Truck,
              },
            ].map((item, index) => {

              const Icon = item.icon;

              return (
                <motion.div
                  key={index}
                  initial={{
                    opacity: 0,
                    y: 40,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.15,
                  }}
                  viewport={{
                    once: true,
                  }}
                  className="group rounded-3xl border border-[#E8C8B6] bg-[#F8EEE8] p-8 transition duration-300 hover:-translate-y-2 hover:bg-[#A45F35] hover:text-white"
                >

                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow">

                    <Icon
                      size={30}
                      className="text-[#A45F35]"
                    />

                  </div>

                  <h3 className="mt-8 text-5xl font-black">
                    {item.number}
                  </h3>

                  <p className="mt-3 text-slate-600 group-hover:text-white">
                    {item.title}
                  </p>

                </motion.div>
              );
            })}

          </div>

        </div>

      </section>



      {/* ====================================================
          FEATURED PRODUCTS
          EXACTLY 3 PRODUCTS
          HOME HAS ITS OWN CARD DESIGN
      ==================================================== */}

      <section className="section-padding bg-white">

        <div className="container-custom">

          <SectionTitle
            badge="Featured Products"
            title="Popular Biomedical Equipment"
            description="Explore selected biomedical and diagnostic equipment from our complete product catalog."
            center
          />

          {/* LOADING */}

          {productsLoading ? (

            <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

              {Array.from({
                length: 3,
              }).map((_, index) => (

                <div
                  key={index}
                  className="animate-pulse overflow-hidden rounded-[24px] border border-[#E8C8B6] bg-white shadow-md"
                >

                  <div className="h-[250px] bg-[#F8EEE8]" />

                  <div className="p-6">

                    <div className="h-7 w-4/5 rounded bg-[#F8EEE8]" />

                    <div className="mt-5 h-4 w-3/5 rounded bg-[#F8EEE8]" />

                    <div className="mt-3 h-4 w-2/3 rounded bg-[#F8EEE8]" />

                    <div className="mt-6 h-12 w-full rounded-xl bg-[#F8EEE8]" />

                  </div>

                </div>

              ))}

            </div>

          ) : featuredProducts.length > 0 ? (

            /* PRODUCTS */

            <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">

              {featuredProducts.map(
                (product) => (

                  <HomeProductCard
                    key={
                      product.uid ||
                      product.slug ||
                      product.id ||
                      product.title
                    }
                    product={product}
                    district={
                      currentDistrict ||
                      null
                    }
                  />

                )
              )}

            </div>

          ) : (

            /* EMPTY */

            <div className="mt-16 rounded-[30px] border border-[#E8C8B6] bg-[#F8EEE8] p-12 text-center">

              <p className="text-lg font-semibold text-slate-600">
                No products found in the catalog.
              </p>

            </div>

          )}

          {/* VIEW ALL */}

          <div className="mt-14 text-center">

            <Link
              href={makeLink("/items")}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#A45F35] px-8 py-4 font-semibold !text-white transition hover:bg-[#874723]"
            >

              <span className="!text-white">
                View All Products
              </span>

              <ArrowRight
                size={18}
                className="!text-white"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* ====================================================
          WHY CHOOSE US
      ==================================================== */}

      <section className="section-padding bg-[#F8EEE8]">

        <div className="container-custom">

          <SectionTitle
            badge="Why Choose Us"
            title="Reliable Solutions For Modern Healthcare"
            description="We combine quality biomedical equipment with professional guidance and dependable customer support."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {[
              {
                icon: (
                  <ShieldCheck
                    size={30}
                  />
                ),
                title:
                  "Quality Equipment",
                description:
                  "Reliable biomedical products selected for healthcare and laboratory applications.",
              },
              {
                icon: (
                  <Truck
                    size={30}
                  />
                ),
                title:
                  "Delivery Support",
                description:
                  "Professional coordination for smooth and dependable product delivery.",
              },
              {
                icon: (
                  <Wrench
                    size={30}
                  />
                ),
                title:
                  "Technical Assistance",
                description:
                  "Practical guidance and support for equipment-related requirements.",
              },
              {
                icon: (
                  <Activity
                    size={30}
                  />
                ),
                title:
                  "Healthcare Focus",
                description:
                  "Solutions designed around real laboratory and diagnostic workflows.",
              },
            ].map(
              (item, index) => (

                <div
                  key={index}
                  className="rounded-[30px] border border-[#E8C8B6] bg-white p-8 text-center shadow-lg shadow-[#A45F35]/5 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                >

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEE8] text-[#A45F35]">
                    {item.icon}
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ====================================================
          WORKING PROCESS
      ==================================================== */}

      <section className="section-padding bg-white">

        <div className="container-custom">

          <SectionTitle
            badge="How We Work"
            title="Simple & Professional Process"
            description="We follow a streamlined process to deliver reliable biomedical and healthcare solutions with precision and excellence."
            center
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-3">

            {[
              {
                step: "01",
                title:
                  "Consultation",
                desc:
                  "Understanding healthcare requirements, laboratory needs and recommending the most suitable biomedical solutions.",
              },
              {
                step: "02",
                title:
                  "Implementation",
                desc:
                  "Supplying, installing and configuring biomedical equipment with complete technical guidance.",
              },
              {
                step: "03",
                title:
                  "Support",
                desc:
                  "Providing ongoing maintenance, expert assistance and after-sales support for long-term reliability.",
              },
            ].map(
              (item, index) => (

                <div
                  key={index}
                  className="group relative overflow-hidden rounded-[30px] border border-[#F1DDD1] bg-white p-8 shadow-lg shadow-[#F1DDD1] transition-all duration-300 hover:-translate-y-2 hover:border-[#D7A384] hover:shadow-2xl hover:shadow-[#E8C8B6]"
                >

                  <span className="text-6xl font-black text-[#F1DDD1] transition group-hover:text-[#E8C8B6]">
                    {item.step}
                  </span>

                  <h3 className="mt-5 text-2xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600">
                    {item.desc}
                  </p>

                  <div className="mt-8 h-1 w-16 rounded-full bg-[#F8EEE8]0 transition-all duration-300 group-hover:w-24" />

                </div>

              )
            )}

          </div>

        </div>

      </section>


      {/* ====================================================
          AFTER SALES SUPPORT
      ==================================================== */}

      <section className="section-padding bg-gradient-to-b from-white to-[#F8EEE8]">

        <div className="container-custom">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            <div>

              <span className="inline-block rounded-full border border-[#F1DDD1] bg-[#F8EEE8] px-5 py-2 font-semibold text-[#874723]">
                After-Sales Support
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Support That Continues After Installation
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Biomedical equipment requires proper coordination, maintenance and technical attention throughout its working life. Our support approach is designed to help healthcare facilities maintain dependable equipment performance.
              </p>

              <div className="mt-8 space-y-5">

                {[
                  "Installation and setup coordination",
                  "Equipment usage and application guidance",
                  "Maintenance assistance and technical coordination",
                  "Product-related troubleshooting support",
                  "Ongoing communication with healthcare teams",
                ].map(
                  (item, index) => (

                    <div
                      key={index}
                      className="flex items-start gap-4"
                    >

                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A45F35] text-white">

                        <ShieldCheck
                          size={15}
                        />

                      </div>

                      <p className="leading-7 text-slate-700">
                        {item}
                      </p>

                    </div>

                  )
                )}

              </div>

            </div>


            <div className="rounded-[35px] border border-[#F1DDD1] bg-white p-8 shadow-xl shadow-[#F1DDD1] md:p-10">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A45F35] text-white shadow-lg shadow-[#E8C8B6]">

                <Headphones
                  size={30}
                />

              </div>

              <h3 className="mt-7 text-2xl font-bold text-slate-900">
                Need Help With Your Biomedical Equipment?
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Whether you are planning a new laboratory setup, replacing existing equipment or looking for technical assistance, our team can help you understand the available options.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">

                <div className="rounded-2xl bg-[#F8EEE8] p-5">

                  <p className="text-sm font-semibold text-[#874723]">
                    Equipment
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    Product Guidance
                  </p>

                </div>

                <div className="rounded-2xl bg-[#F8EEE8] p-5">

                  <p className="text-sm font-semibold text-[#874723]">
                    Support
                  </p>

                  <p className="mt-2 font-bold text-slate-900">
                    Technical Assistance
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================================
          FINAL CONTENT
      ==================================================== */}

      <section className="section-padding bg-white">

        <div className="container-custom max-w-5xl">

          <div className="rounded-[35px] border border-[#F1DDD1] bg-gradient-to-br from-[#F8EEE8] via-white to-[#F8EEE8] p-8 text-center shadow-lg shadow-[#F1DDD1] md:p-12">

            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              A Reliable Partner For Biomedical Solutions
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              From laboratory requirements and diagnostic equipment to installation coordination and ongoing assistance, we focus on delivering practical solutions that support efficient healthcare operations.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Biomedical Equipment
              </span>

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Laboratory Solutions
              </span>

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Technical Support
              </span>

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Healthcare Solutions
              </span>

            </div>

          </div>

        </div>

      </section>

    </>
  );
}