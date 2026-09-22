"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const makeSlug = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");

const ProductCard = React.memo(function ProductCard({
    product,
    district,
}) {
    const pathname = usePathname();

    const pathParts =
        pathname?.split("/").filter(Boolean) || [];

    const staticRoutes = [
        "about",
        "services",
        "items",
        "contact",
    ];

    const currentDistrict =
        district ||
        (pathParts.length > 0 &&
            !staticRoutes.includes(pathParts[0])
            ? pathParts[0]
            : "");

    const productSlug =
        product.slug ||
        product.productSlug ||
        makeSlug(product.title);

    return (
        <div
            id={product.slug || productSlug}
            className="
                group
                bg-white
                rounded-[30px]
                border
                border-[#F1DDD1]
                shadow-lg
                shadow-[#A45F35]/10
                hover:shadow-2xl
                hover:shadow-[#A45F35]/15
                hover:border-[#F8EEE8]0
                transition-all
                duration-300
                p-5
                sm:p-7
                lg:p-8
            "
        >

            <div
                className="
                    grid
                    grid-cols-1
                    lg:grid-cols-[240px_1fr_180px]
                    gap-5
                    lg:gap-8
                    items-center
                "
            >

                {/* IMAGE */}

                <div
                    className="
                        relative
                        h-[180px]
                        sm:h-[220px]
                        rounded-2xl
                        lg:rounded-3xl
                        overflow-hidden
                        bg-gradient-to-br
                        from-[#F8EEE8]
                        via-white
                        to-[#F8EEE8]
                        border
                        border-[#F1DDD1]
                    "
                >

                    {/* Small Gradient Accent */}

                    <div
                        className="
                            absolute
                            top-3
                            left-3
                            z-10
                            w-2.5
                            h-2.5
                            rounded-full
                            bg-gradient-to-r
                            from-[#874723]
                            via-[#A45F35]
                            to-[#F8EEE8]0
                        "
                    />

                    <img
                        src={
                            product.images?.[0] ||
                            product.image ||
                            "/placeholder.svg"
                        }
                        alt={product.title}
                        loading="lazy"
                        decoding="async"
                        className="
                            relative
                            z-0
                            w-full
                            h-full
                            object-contain
                            p-5
                            transition-transform
                            duration-500
                            group-hover:scale-105
                        "
                        onError={(e) => {
                            e.currentTarget.src =
                                "/placeholder.svg";
                        }}
                    />

                </div>


                {/* CONTENT */}

                <div>

                    {/* Product Title */}

                    <h3
                        className="
                            text-xl
                            sm:text-2xl
                            font-bold
                            text-slate-800
                            group-hover:text-[#A45F35]
                            transition-colors
                            duration-300
                        "
                    >
                        {product.title}
                    </h3>


                    {/* Description */}

                    <p
                        className="
                            mt-3
                            sm:mt-4
                            text-slate-600
                            leading-7
                            text-sm
                            sm:text-base
                        "
                    >
                        {product.description ||
                            product.desc ||
                            "Premium biomedical equipment designed for laboratories, hospitals and diagnostic centres."}
                    </p>


                    {/* PRODUCT INFORMATION */}

                    <div
                        className="
                            grid
                            md:grid-cols-2
                            gap-3
                            sm:gap-4
                            mt-5
                            sm:mt-6
                        "
                    >

                        {/* Brand */}

                        <div
                            className="
                                bg-[#F8EEE8]
                                rounded-xl
                                p-4
                                border
                                border-[#F1DDD1]
                                hover:bg-[#F8EEE8]
                                hover:border-[#F8EEE8]0
                                transition-all
                                duration-300
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-wider
                                    font-semibold
                                    text-[#A45F35]
                                "
                            >
                                Brand
                            </p>

                            <p
                                className="
                                    font-semibold
                                    mt-1
                                    text-slate-800
                                    break-words
                                "
                            >
                                {product.brand || "N/A"}
                            </p>

                        </div>


                        {/* Model */}

                        <div
                            className="
                                bg-[#F8EEE8]
                                rounded-xl
                                p-4
                                border
                                border-[#F1DDD1]
                                hover:bg-[#F8EEE8]
                                hover:border-[#F8EEE8]0
                                transition-all
                                duration-300
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-wider
                                    font-semibold
                                    text-[#A45F35]
                                "
                            >
                                Model
                            </p>

                            <p
                                className="
                                    font-semibold
                                    mt-1
                                    text-slate-800
                                    break-words
                                "
                            >
                                {product.model || "N/A"}
                            </p>

                        </div>


                        {/* Instrument */}

                        <div
                            className="
                                bg-[#F8EEE8]
                                rounded-xl
                                p-4
                                border
                                border-[#F1DDD1]
                                hover:bg-[#F8EEE8]
                                hover:border-[#F8EEE8]0
                                transition-all
                                duration-300
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-wider
                                    font-semibold
                                    text-[#A45F35]
                                "
                            >
                                Instrument
                            </p>

                            <p
                                className="
                                    font-semibold
                                    mt-1
                                    text-slate-800
                                    break-words
                                "
                            >
                                {product.instrument || "N/A"}
                            </p>

                        </div>


                        {/* Category */}

                        <div
                            className="
                                bg-[#F8EEE8]
                                rounded-xl
                                p-4
                                border
                                border-[#F1DDD1]
                                hover:bg-[#F8EEE8]
                                hover:border-[#F8EEE8]0
                                transition-all
                                duration-300
                            "
                        >

                            <p
                                className="
                                    text-[10px]
                                    uppercase
                                    tracking-wider
                                    font-semibold
                                    text-[#A45F35]
                                "
                            >
                                Category
                            </p>

                            <p
                                className="
                                    font-semibold
                                    mt-1
                                    text-slate-800
                                    break-words
                                "
                            >
                                {product.category || "N/A"}
                            </p>

                        </div>

                    </div>

                </div>


                {/* GET QUOTE */}

                <div
                    className="
                        flex
                        justify-center
                        lg:justify-end
                    "
                >

                    <Link
                        href={
                            currentDistrict
                                ? `/${currentDistrict}/items/${productSlug}`
                                : `/items/${productSlug}`
                        }
                        className="
                            group/btn
                            w-full
                            lg:w-auto
                            min-w-[145px]
                            inline-flex
                            items-center
                            justify-center
                            rounded-xl
                            bg-[#A45F35]
                            px-7
                            py-3.5
                            font-semibold
                            !text-white
                            hover:!text-white
                            hover:bg-[#874723]
                            shadow-md
                            shadow-[#E8C8B6]
                            transition-all
                            duration-300
                            hover:-translate-y-1
                            hover:shadow-xl
                            hover:shadow-[#E8C8B6]
                            active:translate-y-0
                            active:scale-[0.98]
                        "
                    >

                        <span className="!text-white">
                            Get Quote
                        </span>

                        <span
                            className="
                                ml-2
                                text-[#F1DDD1]
                                group-hover/btn:translate-x-1
                                transition-transform
                                duration-300
                            "
                        >
                            →
                        </span>

                    </Link>

                </div>

            </div>

        </div>
    );
});

export default ProductCard;