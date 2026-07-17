"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

import { usePathname } from "next/navigation";

import {
    FaPlay,
    FaShareAlt,
    FaWhatsapp,
    FaFacebook,
    FaInstagram,
    FaLink,
} from "react-icons/fa";

import {
    doc,
    getDoc,
    getDocs,
    addDoc,
    collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
const makeSlug = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");
export default function ProductDetails({ slug }) {
    const [product, setProduct] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedMedia, setSelectedMedia] = useState("image");
    const [showShare, setShowShare] = useState(false);

    const shareRef = useRef();
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [submitting, setSubmitting] =
        useState(false);
    const pathname = usePathname();

    const pathParts = pathname
        .split("/")
        .filter(Boolean);

    const city =
        pathParts.length > 1
            ? pathParts[0]
            : "India";

    const cityName =
        city.charAt(0).toUpperCase() +
        city.slice(1);

    useEffect(() => {
        const loadProduct = async () => {
            try {

                // NORMAL PRODUCTS
                const snap = await getDoc(
                    doc(
                        db,
                        "websites",
                        "centralbiomedicals",
                        "pages",
                        "products"
                    )
                );

                let allProducts = [];

                if (snap.exists()) {
                    allProducts = (snap.data().products || []).map((item) => ({
                        ...item,
                        slug:
                            item.slug ||
                            item.productSlug ||
                            makeSlug(item.title),
                    }));
                }

                // CATEGORY PRODUCTS
                const categorySnap = await getDocs(
                    collection(
                        db,
                        "websites",
                        "centralbiomedicals",
                        "pages",
                        "categoryproducts",
                        "categories"
                    )
                );

                categorySnap.forEach((docSnap) => {
                    const data = docSnap.data();

                    if (data.products?.length) {
                        allProducts.push(
                            ...(data.products || []).map((item) => ({
                                ...item,
                                slug:
                                    item.slug ||
                                    item.productSlug ||
                                    makeSlug(item.title),
                            }))
                        );
                    }
                });

                const found = allProducts.find(
                    (p) => p.slug === slug
                );
                console.log("URL SLUG:", slug);

                allProducts.forEach((p) => {
                    console.log("PRODUCT:", p.title);
                    console.log("PRODUCT SLUG:", p.slug);
                });
                console.log("SLUG FROM URL:", slug);
                console.log(
                    "TOTAL PRODUCTS:",
                    allProducts.length
                );
                console.log(
                    "FOUND PRODUCT:",
                    found
                );

                setProduct(found || null);

                if (found) {

                    if (
                        found.images?.length > 0
                    ) {
                        setSelectedImage(
                            found.images[0]
                        );
                    } else {
                        setSelectedImage(
                            found.image || ""
                        );
                    }

                    setSelectedMedia("image");
                }

            } catch (error) {
                console.error(error);
            }
        };

        loadProduct();
    }, [slug]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const phoneRegex = /^[6-9]\d{9}$/;
        const emailRegex =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!form.name.trim()) {
            return toast.error(
                "Name is required"
            );
        }

        if (!emailRegex.test(form.email)) {
            return toast.error(
                "Enter valid email"
            );
        }

        if (!phoneRegex.test(form.phone)) {
            return toast.error(
                "Enter valid mobile number"
            );
        }

        try {
            setSubmitting(true);

            await addDoc(
                collection(
                    db,
                    "websitesQueries",
                    "centralbiomedicals",
                    "productQueries"
                ),
                {
                    ...form,
                    productName: product.title,
                    productSlug: product.slug,
                    brand: product.brand || "",
                    model: product.model || "",
                    createdAt: new Date(),
                }
            );

            toast.success(
                "Your enquiry has been submitted successfully."
            );

            setForm({
                name: "",
                email: "",
                phone: "",
            });
        } catch (error) {
            console.error(error);
            toast.error(
                "Something went wrong"
            );
        } finally {
            setSubmitting(false);
        }
    };
    const productSchema = product
        ? {
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.title,
            image: product.image ? [product.image] : [],
            description:
                product.desc ||
                product.description ||
                product.title,
            brand: {
                "@type": "Brand",
                name: product.brand || "Central Biomedicals",
            },
        }
        : null;

    const faqSchema = product
        ? {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
                {
                    "@type": "Question",
                    name: `What is ${product.title} used for?`,
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: `${product.title} is used in hospitals, pathology labs and diagnostic centres.`,
                    },
                },
                {
                    "@type": "Question",
                    name: "Do you provide installation support?",
                    acceptedAnswer: {
                        "@type": "Answer",
                        text: "Yes, installation and technical support are available.",
                    },
                },
            ],
        }
        : null;

    const handleCopy = async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied");
        setShowShare(false);
    };

    const handleWhatsapp = () => {
        const shareText = `🔬 ${product?.title}

${product?.desc}

🌐 ${window.location.href}`;

        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText)}`,
            "_blank"
        );
    };

    const handleFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                window.location.href
            )}`,
            "_blank"
        );
    };

    const handleInstagram = async () => {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Instagram direct sharing available nahi hai. Link copied.");
    };

    const handleNativeShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: product.title,
                text: product.desc,
                url: window.location.href,
            });
        } else {
            setShowShare(!showShare);
        }
    };

    useEffect(() => {
        const close = (e) => {
            if (
                shareRef.current &&
                !shareRef.current.contains(e.target)
            ) {
                setShowShare(false);
            }
        };

        document.addEventListener("mousedown", close);

        return () =>
            document.removeEventListener("mousedown", close);
    }, []);

    if (!product) {
        return (
            <section className="py-10 md:py-20 bg-slate-50">
                <div className="container-custom">

                    <div className="grid lg:grid-cols-2 gap-12">

                        <div className="h-[420px] md:h-[520px] rounded-[36px] bg-slate-200 animate-pulse" />

                        <div>
                            <div className="h-12 w-3/4 bg-slate-200 rounded-xl animate-pulse mb-8" />

                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-6 bg-slate-200 rounded-lg animate-pulse mb-4"
                                />
                            ))}
                        </div>

                    </div>

                    <div className="mt-16 grid lg:grid-cols-[600px_1fr] gap-8">

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-sm">
                            <div className="h-10 w-48 bg-slate-200 rounded-lg animate-pulse mb-6" />

                            {[...Array(4)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-14 bg-slate-200 rounded-2xl animate-pulse mb-4"
                                />
                            ))}
                        </div>

                        <div className="bg-white rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 shadow-sm">
                            <div className="h-10 w-60 bg-slate-200 rounded-lg animate-pulse mb-6" />

                            {[...Array(6)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-5 bg-slate-200 rounded animate-pulse mb-4"
                                />
                            ))}
                        </div>

                    </div>

                </div>
            </section>
        );
    }
    return (
        <section className="py-10 md:py-20 bg-slate-50">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(productSchema),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
            />
            <div className="container-custom">
                <div className="mb-6 text-sm text-slate-500">
                    Home / Products / {product.title}
                </div>
                {/* Top Section */}

                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Product Image */}

                    <div>

                        <div className="relative h-[340px] overflow-hidden rounded-[24px] border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-[0_25px_80px_rgba(99,107,47,0.18)] sm:h-[420px] md:h-[500px] lg:h-[580px]">

                            {/* Premium Badge */}

                            <div className="absolute left-5 top-5 z-20 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white shadow-lg">

                                Premium Quality

                            </div>

                            {selectedMedia === "video" && product.video ? (

                                <video
                                    controls
                                    autoPlay
                                    className="h-full w-full object-contain p-6"
                                >
                                    <source
                                        src={product.video}
                                        type="video/mp4"
                                    />
                                </video>

                            ) : (

                                <>

                                    {/* Loading Skeleton */}

                                    {!imageLoaded && (

                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-50 animate-pulse">

                                            <div className="h-20 w-20 rounded-full border-4 border-green-300 border-t-green-600 animate-spin"></div>

                                        </div>

                                    )}

                                    {/* Product Image */}

                                    <Image
                                        src={selectedImage || product.image}
                                        alt={product.title}
                                        fill
                                        priority
                                        onLoad={() => setImageLoaded(true)}
                                        className={`object-contain p-6 transition-all duration-500 group-hover:scale-105 ${imageLoaded ? "opacity-100" : "opacity-0"
                                            }`}
                                    />

                                </>

                            )}

                        </div>

                        <div className="mt-6 flex flex-wrap gap-4">

                            {(product.images?.length
                                ? product.images
                                : [product.image]
                            ).map((img, index) => (

                                <button
                                    key={index}
                                    onClick={() => {
                                        setSelectedImage(img);
                                        setSelectedMedia("image");
                                    }}
                                    className={`group relative h-20 w-20 overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg

      ${selectedMedia === "image" &&
                                            selectedImage === img
                                            ? "border-green-600 shadow-lg shadow-green-200"
                                            : "border-green-100 hover:border-green-400"
                                        }`}
                                >

                                    <Image
                                        src={img}
                                        alt={`Thumbnail ${index + 1}`}
                                        width={80}
                                        height={80}
                                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />

                                </button>

                            ))}

                            {/* Video */}

                            {product.video && (

                                <button
                                    onClick={() => setSelectedMedia("video")}
                                    className={`group flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg

      ${selectedMedia === "video"
                                            ? "border-green-600 bg-green-50 shadow-lg shadow-green-200"
                                            : "border-green-100 hover:border-green-400 hover:bg-green-50"
                                        }`}
                                >

                                    <FaPlay
                                        size={20}
                                        className="text-green-600"
                                    />

                                    <span className="mt-2 text-xs font-medium text-slate-700">

                                        Video

                                    </span>

                                </button>

                            )}

                            {/* PDF */}

                            {product.pdf && (

                                <a
                                    href={product.pdf}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group flex h-20 w-20 flex-col items-center justify-center rounded-2xl border-2 border-green-100 transition-all duration-300 hover:-translate-y-1 hover:border-green-400 hover:bg-green-50 hover:shadow-lg"
                                >

                                    <span className="text-2xl">

                                        📄

                                    </span>

                                    <span className="mt-2 text-xs font-medium text-slate-700">

                                        PDF

                                    </span>

                                </a>

                            )}

                        </div>

                    </div>

                    {/* Product Details */}

                    <div>

                        <div className="relative flex items-start justify-between gap-4">

                            {/* Product Title */}

                            <div>

                                <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

                                    Premium Biomedical Equipment

                                </span>

                                <h1 className="mt-4 text-2xl font-black leading-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-5xl">

                                    {product.title}

                                </h1>

                            </div>

                            {/* Share */}

                            <div
                                ref={shareRef}
                                className="relative flex-shrink-0"
                            >

                                <button
                                    onClick={handleNativeShare}
                                    className="group flex h-12 w-12 items-center justify-center rounded-full border border-green-100 bg-white text-green-600 shadow-lg shadow-green-100 transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:bg-green-50 hover:shadow-xl hover:shadow-green-200"
                                    aria-label="Share Product"
                                >

                                    <FaShareAlt
                                        size={18}
                                        className="transition-transform duration-300 group-hover:rotate-12"
                                    />

                                </button>

                                {showShare && (

                                    <div className="absolute right-0 top-14 z-50 w-60 overflow-hidden rounded-2xl border border-green-100 bg-white p-2 shadow-2xl shadow-green-100">

                                        <button
                                            onClick={handleCopy}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-700 transition hover:bg-green-50 hover:text-green-700"
                                        >
                                            <FaLink className="text-green-600" />
                                            Copy Link
                                        </button>

                                        <button
                                            onClick={handleWhatsapp}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-700 transition hover:bg-green-50 hover:text-green-700"
                                        >
                                            <FaWhatsapp className="text-green-600" />
                                            WhatsApp
                                        </button>

                                        <button
                                            onClick={handleFacebook}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-700 transition hover:bg-green-50 hover:text-green-700"
                                        >
                                            <FaFacebook className="text-blue-600" />
                                            Facebook
                                        </button>

                                        <button
                                            onClick={handleInstagram}
                                            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-slate-700 transition hover:bg-green-50 hover:text-green-700"
                                        >
                                            <FaInstagram className="text-pink-600" />
                                            Instagram
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>

                        <div className="mt-6 rounded-[30px] border border-green-100 bg-white p-6 shadow-xl shadow-green-100 md:mt-8 md:p-8">

                            <h3 className="mb-6 text-2xl font-bold text-slate-900">

                                Product Specifications

                            </h3>

                            <div className="grid gap-4 sm:grid-cols-2">

                                {[
                                    {
                                        label: "Brand",
                                        value: product.brand || "N/A",
                                    },
                                    {
                                        label: "Model",
                                        value: product.model || "N/A",
                                    },
                                    {
                                        label: "Instrument",
                                        value: product.instrument || "N/A",
                                    },
                                    {
                                        label: "Capacity",
                                        value: product.capacity || "N/A",
                                    },
                                    {
                                        label: "Throughput",
                                        value: product.throughput || "N/A",
                                    },
                                    {
                                        label: "Usage",
                                        value: product.usage || "N/A",
                                    },
                                    {
                                        label: "Automation",
                                        value: product.automation || "N/A",
                                    },
                                    {
                                        label: "Availability",
                                        value: product.availability || "N/A",
                                    },
                                ].map((item, index) => (

                                    <div
                                        key={index}
                                        className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-4 transition-all duration-300 hover:border-green-300 hover:shadow-lg hover:shadow-green-100"
                                    >

                                        <p className="text-xs font-semibold uppercase tracking-wider text-green-600">

                                            {item.label}

                                        </p>

                                        <p className="mt-2 text-lg font-bold text-slate-900">

                                            {item.value}

                                        </p>

                                    </div>

                                ))}

                            </div>

                        </div>

                    </div>

                </div>

                {/* Description + Form */}

                <div className="mt-16">
                    <div className="grid grid-cols-1 lg:grid-cols-[500px_1fr] xl:grid-cols-[600px_1fr] gap-6 md:gap-8">

                        {/* Quote Form */}

                        <div className="h-fit rounded-[32px] border border-green-100 bg-white p-5 shadow-xl shadow-green-100 lg:sticky lg:top-24 sm:p-6 md:p-8">

                            {/* Header */}

                            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

                                Quick Enquiry

                            </span>

                            <h2 className="mt-5 text-2xl font-black text-slate-900 md:text-3xl">

                                Request A Quote

                            </h2>

                            <p className="mt-3 leading-7 text-slate-600">

                                Product:

                                <span className="ml-2 font-semibold text-green-700">

                                    {product.title}

                                </span>

                            </p>

                            {/* Form */}

                            <form
                                onSubmit={handleSubmit}
                                className="mt-8 space-y-5"
                            >

                                {/* Name */}

                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={form.name}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                                />

                                {/* Email */}

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={form.email}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                                />

                                {/* Phone */}

                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    maxLength={10}
                                    value={form.phone}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone: e.target.value.replace(/\D/g, ""),
                                        })
                                    }
                                    className="w-full rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-slate-700 outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100"
                                />

                                {/* Button */}

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 py-4 font-semibold text-white shadow-lg shadow-green-200 transition-all duration-300 hover:-translate-y-1 hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:shadow-green-300 disabled:cursor-not-allowed disabled:opacity-70"
                                >

                                    {submitting ? "Submitting..." : "Get Quote"}

                                </button>

                            </form>

                        </div>
                        {/* Description */}

                        <div className="rounded-[32px] border border-green-100 bg-white p-5 shadow-xl shadow-green-100 sm:p-6 md:p-10">

                            {/* Header */}

                            <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">

                                Product Details

                            </span>

                            <h3 className="mt-5 text-2xl font-black text-slate-900 md:text-3xl">

                                Product Description

                            </h3>

                            <p className="mt-6 text-base leading-8 text-slate-600 md:text-lg md:leading-9">

                                {product.desc ||
                                    product.description ||
                                    "No description available."}

                            </p>

                            {/* Specifications */}

                            <div className="mt-10 overflow-x-auto rounded-2xl border border-green-100">

                                <table className="w-full border-collapse">

                                    <tbody>

                                        {[
                                            {
                                                label: "Brand",
                                                value: product.brand || "N/A",
                                            },
                                            {
                                                label: "Model",
                                                value: product.model || "N/A",
                                            },
                                            {
                                                label: "Usage",
                                                value: product.usage || "N/A",
                                            },
                                            {
                                                label: "Automation",
                                                value: product.automation || "N/A",
                                            },
                                            {
                                                label: "Capacity",
                                                value: product.capacity || "N/A",
                                            },
                                            {
                                                label: "Throughput",
                                                value: product.throughput || "N/A",
                                            },
                                        ].map((item, index) => (

                                            <tr
                                                key={index}
                                                className="border-b border-green-100 last:border-b-0 hover:bg-green-50 transition"
                                            >

                                                <td className="w-1/3 bg-green-50 px-5 py-4 font-semibold text-green-700">

                                                    {item.label}

                                                </td>

                                                <td className="px-5 py-4 text-slate-700">

                                                    {item.value}

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>


                            {/* SEO Content */}

                            <div className="mt-12 rounded-[32px] border border-green-100 bg-white p-6 shadow-xl shadow-green-100 md:p-10">

                                <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                                    Product Information
                                </span>

                                <div className="mt-8 space-y-8">

                                    {[
                                        {
                                            title: `Why Choose Central Biomedicals in ${cityName}?`,
                                            content: `Central Biomedicals is a trusted supplier and distributor of ${product.title} in ${cityName}. We provide high-quality biomedical and laboratory equipment for hospitals, pathology laboratories, diagnostic centres and healthcare facilities.`,
                                        },
                                        {
                                            title: `Features of ${product.title}`,
                                            content: `${product.title} offers reliable performance, accurate results, user-friendly operation, long service life and efficient workflow for laboratories, hospitals and healthcare professionals.`,
                                        },
                                        {
                                            title: `Applications of ${product.title}`,
                                            content: `Widely used in hospitals, pathology laboratories, diagnostic centres, blood banks, research institutes and healthcare facilities for accurate and efficient diagnostics.`,
                                        },
                                        {
                                            title: `${product.title} Supplier in ${cityName}`,
                                            content: `Central Biomedicals supplies ${product.title} in ${cityName} with expert consultation, installation support, technical guidance and dependable after-sales service.`,
                                        },
                                        {
                                            title: `${product.title} Dealer in ${cityName}`,
                                            content: `We are a trusted dealer of ${product.title} in ${cityName}, offering premium biomedical equipment, laboratory instruments and diagnostic systems at competitive prices.`,
                                        },
                                        {
                                            title: `${product.title} Distributor in ${cityName}`,
                                            content: `Looking for a reliable distributor of ${product.title} in ${cityName}? We provide fast delivery, installation support, maintenance assistance and professional customer service.`,
                                        },
                                        {
                                            title: `Buy ${product.title} in ${cityName}`,
                                            content: `Purchase high-quality ${product.title} in ${cityName} from Central Biomedicals with genuine products, competitive pricing and reliable nationwide support.`,
                                        },
                                        {
                                            title: `${product.title} Price in ${cityName}`,
                                            content: `The price of ${product.title} depends on the selected model, specifications and configuration. Contact our team for the latest quotation, availability and delivery information.`,
                                        },
                                    ].map((item, index) => (

                                        <div
                                            key={index}
                                            className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-6 transition-all duration-300 hover:border-green-300 hover:shadow-lg hover:shadow-green-100"
                                        >

                                            <h3 className="text-2xl font-bold text-slate-900">

                                                {item.title}

                                            </h3>

                                            <p className="mt-4 leading-8 text-slate-600">

                                                {item.content}

                                            </p>

                                        </div>

                                    ))}

                                </div>

                            </div>

                            {/* FAQ Section */}

                            <div className="mt-12 rounded-[32px] border border-green-100 bg-white p-6 shadow-xl shadow-green-100 md:p-10">

                                <span className="inline-flex rounded-full bg-green-100 px-4 py-2 text-sm font-semibold text-green-700">
                                    Help Center
                                </span>

                                <h3 className="mt-5 text-2xl md:text-3xl font-black text-slate-900">
                                    Frequently Asked Questions
                                </h3>

                                <div className="mt-8 space-y-5">

                                    {[
                                        {
                                            question: `What is ${product.title} used for in ${cityName}?`,
                                            answer: `${product.title} is commonly used in hospitals, pathology laboratories, diagnostic centres and healthcare facilities for accurate diagnostic and laboratory applications.`,
                                        },
                                        {
                                            question: `What is the price of ${product.title} in ${cityName}?`,
                                            answer: `The price depends on the model, configuration and specifications. Contact our team for the latest quotation and availability.`,
                                        },
                                        {
                                            question: `Are you an authorized supplier of ${product.title}?`,
                                            answer: `Yes. We supply genuine biomedical and laboratory equipment sourced from trusted manufacturers and brands.`,
                                        },
                                        {
                                            question: `Can hospitals in ${cityName} order this product?`,
                                            answer: `Yes. Hospitals, pathology laboratories, diagnostic centres, research institutes and healthcare facilities can purchase this product.`,
                                        },
                                        {
                                            question: "Do you provide installation support?",
                                            answer: `Yes. Installation guidance, technical assistance and after-sales support are available for eligible products.`,
                                        },
                                        {
                                            question: "Can I request a quotation?",
                                            answer: `Absolutely. Simply submit the enquiry form on this page and our team will provide pricing, availability and product details.`,
                                        },
                                        {
                                            question: "Do you provide warranty?",
                                            answer: `Warranty coverage depends on the manufacturer and selected product model. Our team will share complete warranty information.`,
                                        },
                                        {
                                            question: "Do you deliver across India?",
                                            answer: `Yes. We provide safe packaging and reliable delivery services across India.`,
                                        },
                                        {
                                            question: "How can I contact Central Biomedicals?",
                                            answer: `You can submit the enquiry form on this page or contact our sales team directly for quotations, product information and technical assistance.`,
                                        },
                                    ].map((item, index) => (

                                        <div
                                            key={index}
                                            className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-green-300 hover:shadow-lg hover:shadow-green-100"
                                        >

                                            <h4 className="text-lg font-bold text-slate-900">

                                                {item.question}

                                            </h4>

                                            <p className="mt-3 leading-8 text-slate-600">

                                                {item.answer}

                                            </p>

                                        </div>

                                    ))}

                                </div>

                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}