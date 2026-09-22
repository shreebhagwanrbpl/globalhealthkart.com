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
    addDoc,
    collection,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import { fetchFullCatalog } from "@/lib/data-fetcher";
import { Download } from "lucide-react";


// ============================================================
// SLUG
// ============================================================

const makeSlug = (text = "") =>
    text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-");


// ============================================================
// COMPONENT
// ============================================================

export default function ProductDetails({ slug }) {

    const [product, setProduct] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedMedia, setSelectedMedia] = useState("image");
    const [showShare, setShowShare] = useState(false);

    const shareRef = useRef();
    const brochureRef = useRef();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [brochureImage, setBrochureImage] = useState("");

    const [contactData, setContactData] = useState({
        phone: "+91 9983123469\n+91 9983333489",
        email: "rajbiosis@yahoo.in",
        address:
            "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, on Ajmer-Delhi, 200 Feet Bypass Rd, Jaipur, Rajasthan 302021",
    });

    const pathname = usePathname();


    // ==========================================================
    // CITY
    // ==========================================================

    const pathParts =
        pathname?.split("/").filter(Boolean) || [];

    const city =
        pathParts.length > 1 &&
            ![
                "about",
                "services",
                "items",
                "contact",
            ].includes(pathParts[0])
            ? pathParts[0]
            : "India";

    const cityName =
        city.charAt(0).toUpperCase() +
        city.slice(1);


    // ==========================================================
    // LOAD PRODUCT + CONTACT
    // ==========================================================

    useEffect(() => {

        const loadProduct = async () => {

            try {

                // Try live API route first
                let allProducts = [];
                try {
                    const res = await fetch(`/api/catalog?t=${Date.now()}`, {
                        cache: "no-store",
                        headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" }
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

                const found =
                    allProducts.find(
                        (p) => p.slug === slug || p.id === slug || p.categoryProductId === slug
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

                console.error(
                    "Error loading product catalog:",
                    error
                );

            }

        };


        const loadContact = async () => {

            try {

                const snap = await getDoc(
                    doc(
                        db,
                        "websites",
                        "globalhealthkartcom",
                        "pages",
                        "contact"
                    )
                );

                if (snap.exists()) {

                    const info =
                        snap.data().contactInfo ||
                        [];

                    const phoneVal =
                        info.find(
                            (x) =>
                                x.label ===
                                "Phone Number"
                        )?.value || "";

                    const emailVal =
                        info.find(
                            (x) =>
                                x.label ===
                                "Email Address"
                        )?.value || "";

                    const addressVal =
                        info.find(
                            (x) =>
                                x.label ===
                                "Office Address"
                        )?.value || "";

                    setContactData({
                        phone:
                            phoneVal ||
                            "+91 9983123469\n+91 9983333489",

                        email:
                            emailVal ||
                            "rajbiosis@yahoo.in",

                        address:
                            addressVal ||
                            "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, on Ajmer-Delhi, 200 Feet Bypass Rd, Jaipur, Rajasthan 302021",
                    });

                }

            } catch (err) {

                console.error(
                    "Error loading contact details:",
                    err
                );

            }

        };


        loadProduct();
        loadContact();

        const handleFocus = () => loadProduct();
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);

    }, [slug]);


    // ==========================================================
    // DOWNLOAD BROCHURE
    // ==========================================================

    const handleDownloadBrochure =
        async () => {

            if (
                downloading ||
                !product
            ) {
                return;
            }

            setDownloading(true);

            const toastId =
                toast.loading(
                    "Generating brochure PDF..."
                );

            try {

                const html2canvas =
                    (
                        await import(
                            "html2canvas"
                        )
                    ).default;

                const { jsPDF } =
                    await import("jspdf");


                let base64Img = "";

                const imageUrl =
                    selectedImage ||
                    product.image;


                if (imageUrl) {

                    try {

                        const proxyUrl =
                            `/_next/image?url=${encodeURIComponent(
                                imageUrl
                            )}&w=640&q=75`;

                        const res =
                            await fetch(
                                proxyUrl
                            );

                        if (res.ok) {

                            const blob =
                                await res.blob();

                            base64Img =
                                await new Promise(
                                    (resolve) => {

                                        const reader =
                                            new FileReader();

                                        reader.onloadend =
                                            () =>
                                                resolve(
                                                    reader.result
                                                );

                                        reader.readAsDataURL(
                                            blob
                                        );

                                    }
                                );

                        }

                    } catch (imgErr) {

                        console.error(
                            "Error proxying image for brochure:",
                            imgErr
                        );

                    }

                }


                setBrochureImage(
                    base64Img ||
                    imageUrl ||
                    "/placeholder.svg"
                );


                const input =
                    brochureRef.current;


                if (!input) {
                    throw new Error(
                        "Brochure template not found"
                    );
                }


                input.style.display =
                    "block";

                input.style.position =
                    "absolute";

                input.style.left =
                    "-9999px";

                input.style.top = "0px";


                await new Promise(
                    (resolve) =>
                        setTimeout(
                            resolve,
                            200
                        )
                );


                const canvas =
                    await html2canvas(
                        input,
                        {
                            useCORS: true,
                            allowTaint: true,
                            scale: 2,
                            logging: false,
                            backgroundColor:
                                "#FFFFFF",
                        }
                    );


                input.style.display =
                    "none";


                const imgData =
                    canvas.toDataURL(
                        "image/png"
                    );


                const pdf =
                    new jsPDF({
                        orientation:
                            "portrait",
                        unit: "mm",
                        format: "a4",
                    });


                const imgWidth = 210;
                const pageHeight = 297;

                const imgHeight =
                    (canvas.height *
                        imgWidth) /
                    canvas.width;

                const height =
                    Math.min(
                        imgHeight,
                        pageHeight
                    );


                pdf.addImage(
                    imgData,
                    "PNG",
                    0,
                    0,
                    imgWidth,
                    height,
                    undefined,
                    "FAST"
                );


                pdf.save(
                    `Raj_Biosis_${product.title.replace(
                        /\s+/g,
                        "_"
                    )}_Brochure.pdf`
                );


                toast.success(
                    "Brochure downloaded successfully!",
                    {
                        id: toastId,
                    }
                );

            } catch (error) {

                console.error(
                    "Error generating PDF brochure:",
                    error
                );

                toast.error(
                    "Failed to generate PDF. Please try again.",
                    {
                        id: toastId,
                    }
                );

            } finally {

                setDownloading(false);

            }

        };


    // ==========================================================
    // FORM SUBMIT
    // ==========================================================

    const handleSubmit =
        async (e) => {

            e.preventDefault();

            const phoneRegex =
                /^[6-9]\d{9}$/;

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!form.name.trim()) {

                return toast.error(
                    "Name is required"
                );

            }


            if (
                !emailRegex.test(
                    form.email
                )
            ) {

                return toast.error(
                    "Enter valid email"
                );

            }


            if (
                !phoneRegex.test(
                    form.phone
                )
            ) {

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
                        "globalhealthkartcom",
                        "productQueries"
                    ),
                    {
                        ...form,

                        productName:
                            product.title,

                        productSlug:
                            product.slug,

                        brand:
                            product.brand ||
                            "",

                        model:
                            product.model ||
                            "",

                        createdAt:
                            new Date(),
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


    // ==========================================================
    // PRODUCT SCHEMA
    // ==========================================================

    const productSchema =
        product
            ? {
                "@context":
                    "https://schema.org",

                "@type":
                    "Product",

                name:
                    product.title,

                image:
                    product.image
                        ? [product.image]
                        : [],

                description:
                    product.desc ||
                    product.description ||
                    product.title,

                brand: {
                    "@type": "Brand",
                    name:
                        product.brand ||
                        "Raj Biosis",
                },
            }
            : null;


    // ==========================================================
    // FAQ SCHEMA
    // ==========================================================

    const faqSchema =
        product
            ? {
                "@context":
                    "https://schema.org",

                "@type":
                    "FAQPage",

                mainEntity: [
                    {
                        "@type":
                            "Question",

                        name:
                            `What is ${product.title} used for?`,

                        acceptedAnswer: {
                            "@type":
                                "Answer",

                            text:
                                `${product.title} is used in hospitals, pathology labs and diagnostic centres.`,
                        },
                    },

                    {
                        "@type":
                            "Question",

                        name:
                            "Do you provide installation support?",

                        acceptedAnswer: {
                            "@type":
                                "Answer",

                            text:
                                "Yes, installation and technical support are available.",
                        },
                    },
                ],
            }
            : null;


    // ==========================================================
    // SHARE
    // ==========================================================

    const handleCopy =
        async () => {

            await navigator.clipboard.writeText(
                window.location.href
            );

            toast.success(
                "Link Copied"
            );

            setShowShare(false);

        };


    const handleWhatsapp =
        () => {

            const shareText =
                `🔬 ${product?.title}

${product?.desc}

🌐 ${window.location.href}`;

            window.open(
                `https://wa.me/?text=${encodeURIComponent(
                    shareText
                )}`,
                "_blank"
            );

        };


    const handleFacebook =
        () => {

            window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                    window.location.href
                )}`,
                "_blank"
            );

        };


    const handleInstagram =
        async () => {

            await navigator.clipboard.writeText(
                window.location.href
            );

            toast.success(
                "Instagram direct sharing available nahi hai. Link copied."
            );

        };


    const handleNativeShare =
        async () => {

            if (navigator.share) {

                await navigator.share({
                    title:
                        product.title,

                    text:
                        product.desc,

                    url:
                        window.location.href,
                });

            } else {

                setShowShare(
                    !showShare
                );

            }

        };


    // ==========================================================
    // CLOSE SHARE
    // ==========================================================

    useEffect(() => {

        const close = (e) => {

            if (
                shareRef.current &&
                !shareRef.current.contains(
                    e.target
                )
            ) {

                setShowShare(false);

            }

        };


        document.addEventListener(
            "mousedown",
            close
        );


        return () =>
            document.removeEventListener(
                "mousedown",
                close
            );

    }, []);


    // ==========================================================
    // LOADING
    // ==========================================================

    if (!product) {

        return (
            <section className="
                py-10
                md:py-20
                bg-[#F8EEE8]
            ">

                <div className="container-custom">

                    <div className="
                        grid
                        lg:grid-cols-2
                        gap-12
                    ">

                        <div className="
                            h-[420px]
                            md:h-[520px]
                            rounded-[36px]
                            bg-[#F1DDD1]
                            animate-pulse
                        " />

                        <div>

                            <div className="
                                h-12
                                w-3/4
                                bg-[#F1DDD1]
                                rounded-xl
                                animate-pulse
                                mb-8
                            " />

                            {[...Array(8)].map(
                                (_, i) => (
                                    <div
                                        key={i}
                                        className="
                                            h-6
                                            bg-[#F1DDD1]
                                            rounded-lg
                                            animate-pulse
                                            mb-4
                                        "
                                    />
                                )
                            )}

                        </div>

                    </div>


                    <div className="
                        mt-16
                        grid
                        lg:grid-cols-[600px_1fr]
                        gap-8
                    ">

                        <div className="
                            bg-white
                            rounded-[24px]
                            md:rounded-[32px]
                            p-5
                            sm:p-6
                            md:p-8
                            shadow-sm
                            border
                            border-[#E8C8B6]
                        ">

                            <div className="
                                h-10
                                w-48
                                bg-[#F1DDD1]
                                rounded-lg
                                animate-pulse
                                mb-6
                            " />

                            {[...Array(4)].map(
                                (_, i) => (
                                    <div
                                        key={i}
                                        className="
                                            h-14
                                            bg-[#F1DDD1]
                                            rounded-2xl
                                            animate-pulse
                                            mb-4
                                        "
                                    />
                                )
                            )}

                        </div>


                        <div className="
                            bg-white
                            rounded-[24px]
                            md:rounded-[32px]
                            p-5
                            sm:p-6
                            md:p-8
                            shadow-sm
                            border
                            border-[#E8C8B6]
                        ">

                            <div className="
                                h-10
                                w-60
                                bg-[#F1DDD1]
                                rounded-lg
                                animate-pulse
                                mb-6
                            " />

                            {[...Array(6)].map(
                                (_, i) => (
                                    <div
                                        key={i}
                                        className="
                                            h-5
                                            bg-[#F1DDD1]
                                            rounded
                                            animate-pulse
                                            mb-4
                                        "
                                    />
                                )
                            )}

                        </div>

                    </div>

                </div>

            </section>
        );
    }


    // ==========================================================
    // MAIN
    // ==========================================================

    return (

        <section className="
            py-10
            md:py-20
            bg-[#F8EEE8]
        ">

            {/* ==================================================
                SCHEMA
            ================================================== */}

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            productSchema
                        ),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html:
                        JSON.stringify(
                            faqSchema
                        ),
                }}
            />


            <div className="container-custom">


                {/* ==================================================
                    BREADCRUMB
                ================================================== */}

                <div className="
                    mb-6
                    text-sm
                    text-[#8A6B5A]
                ">

                    <span className="hover:text-[#A45F35]">
                        Home
                    </span>

                    {" / "}

                    <span className="hover:text-[#A45F35]">
                        Products
                    </span>

                    {" / "}

                    <span className="text-[#874723] font-medium">
                        {product.title}
                    </span>

                </div>


                {/* ==================================================
                    TOP SECTION
                ================================================== */}

                <div className="
                    grid
                    lg:grid-cols-2
                    gap-8
                ">


                    {/* ==================================================
                        PRODUCT IMAGE
                    ================================================== */}

                    <div>

                        <div className="
                            relative
                            h-[300px]
                            sm:h-[360px]
                            md:h-[420px]
                            lg:h-[460px]
                            rounded-[24px]
                            md:rounded-[36px]
                            overflow-hidden
                            bg-gradient-to-br
                            from-[#F8EEE8]
                            via-white
                            to-[#F8EEE8]
                            border
                            border-[#E8C8B6]
                            shadow-[0_25px_80px_rgba(82,88,39,0.12)]
                        ">


                            {selectedMedia ===
                                "video" &&
                                product.video ? (

                                <video
                                    controls
                                    autoPlay
                                    className="
                                        w-full
                                        h-full
                                        object-contain
                                        p-6
                                    "
                                >

                                    <source
                                        src={
                                            product.video
                                        }
                                        type="video/mp4"
                                    />

                                </video>

                            ) : (

                                <>

                                    {!imageLoaded && (
                                        <div className="
                                            absolute
                                            inset-0
                                            bg-[#F1DDD1]
                                            animate-pulse
                                        " />
                                    )}


                                    <Image
                                        src={
                                            selectedImage ||
                                            product.image
                                        }
                                        alt={
                                            product.title
                                        }
                                        fill
                                        priority
                                        onLoad={() =>
                                            setImageLoaded(
                                                true
                                            )
                                        }
                                        className={`
                                            object-contain
                                            p-4
                                            transition
                                            duration-500
                                            ${imageLoaded
                                                ? "opacity-100"
                                                : "opacity-0"
                                            }
                                        `}
                                    />

                                </>

                            )}

                        </div>


                        {/* ==================================================
                            THUMBNAILS
                        ================================================== */}

                        <div className="
                            flex
                            flex-wrap
                            gap-3
                            mt-5
                        ">

                            {(
                                product.images?.length
                                    ? product.images
                                    : [product.image]
                            ).map(
                                (img, index) => (

                                    <button
                                        key={index}
                                        onClick={() => {
                                            setSelectedImage(
                                                img
                                            );

                                            setSelectedMedia(
                                                "image"
                                            );

                                            setImageLoaded(
                                                false
                                            );
                                        }}
                                        className={`
                                            w-20
                                            h-20
                                            rounded-xl
                                            overflow-hidden
                                            border-2
                                            transition-all
                                            duration-300

                                            ${selectedMedia ===
                                                "image" &&
                                                selectedImage ===
                                                img
                                                ? "border-[#A45F35] shadow-[0_5px_15px_rgba(225,29,72,0.25)]"
                                                : "border-[#E8C8B6] hover:border-[#A45F35]"
                                            }
                                        `}
                                    >

                                        <Image
                                            src={img}
                                            alt=""
                                            width={80}
                                            height={80}
                                            className="
                                                w-full
                                                h-full
                                                object-cover
                                            "
                                        />

                                    </button>

                                )
                            )}


                            {/* Video */}

                            {product.video && (

                                <button
                                    onClick={() =>
                                        setSelectedMedia(
                                            "video"
                                        )
                                    }
                                    className={`
                                        w-20
                                        h-20
                                        rounded-xl
                                        border-2
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        transition-all
                                        duration-300

                                        ${selectedMedia ===
                                            "video"
                                            ? "border-[#A45F35] bg-[#F8EEE8] text-[#874723]"
                                            : "border-[#E8C8B6] text-[#874723] hover:bg-[#F8EEE8] hover:border-[#A45F35]"
                                        }
                                    `}
                                >

                                    <FaPlay size={20} />

                                    <span className="
                                        text-xs
                                        mt-1
                                    ">
                                        Video
                                    </span>

                                </button>

                            )}


                            {/* PDF */}

                            {product.pdf && (

                                <a
                                    href={
                                        product.pdf
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="
                                        w-20
                                        h-20
                                        rounded-xl
                                        border
                                        border-[#E8C8B6]
                                        flex
                                        flex-col
                                        items-center
                                        justify-center
                                        text-[#874723]
                                        hover:bg-[#F8EEE8]
                                        hover:border-[#A45F35]
                                        transition-all
                                    "
                                >

                                    <span className="
                                        text-xl
                                    ">
                                        📄
                                    </span>

                                    <span className="
                                        text-xs
                                        text-[#874723]
                                    ">
                                        PDF
                                    </span>

                                </a>

                            )}

                        </div>

                    </div>


                    {/* ==================================================
                        PRODUCT DETAILS
                    ================================================== */}

                    <div>

                        <div className="
                            flex
                            justify-between
                            items-start
                            gap-4
                            relative
                        ">


                            {/* Product Title */}

                            <h1 className="
                                text-2xl
                                sm:text-3xl
                                md:text-4xl
                                lg:text-5xl
                                font-bold
                                leading-tight
                                text-[#3B2118]
                            ">
                                {product.title}
                            </h1>


                            {/* Share */}

                            <div
                                ref={shareRef}
                                className="relative"
                            >

                                <button
                                    onClick={
                                        handleNativeShare
                                    }
                                    className="
                                        w-12
                                        h-12
                                        rounded-full
                                        border
                                        border-[#E8C8B6]
                                        bg-white
                                        text-[#A45F35]
                                        shadow-md
                                        flex
                                        items-center
                                        justify-center
                                        hover:bg-[#F8EEE8]
                                        hover:text-[#874723]
                                        hover:scale-105
                                        transition-all
                                    "
                                >

                                    <FaShareAlt
                                        size={18}
                                    />

                                </button>


                                {showShare && (

                                    <div className="
                                        absolute
                                        right-0
                                        top-14
                                        w-56
                                        bg-white
                                        rounded-xl
                                        shadow-[0_20px_50px_rgba(82,88,39,0.15)]
                                        border
                                        border-[#E8C8B6]
                                        p-2
                                        z-50
                                    ">

                                        {/* Copy */}

                                        <button
                                            onClick={
                                                handleCopy
                                            }
                                            className="
                                                w-full
                                                text-left
                                                px-3
                                                py-2
                                                rounded
                                                flex
                                                items-center
                                                gap-2
                                                text-[#765A4C]
                                                hover:bg-[#F8EEE8]
                                                hover:text-[#874723]
                                                transition
                                            "
                                        >

                                            <FaLink />

                                            Copy Link

                                        </button>


                                        {/* WhatsApp */}

                                        <button
                                            onClick={
                                                handleWhatsapp
                                            }
                                            className="
                                                w-full
                                                text-left
                                                px-3
                                                py-2
                                                rounded
                                                flex
                                                items-center
                                                gap-2
                                                text-[#765A4C]
                                                hover:bg-[#F8EEE8]
                                                hover:text-[#874723]
                                                transition
                                            "
                                        >

                                            <FaWhatsapp className="text-[#A45F35]" />

                                            WhatsApp

                                        </button>


                                        {/* Facebook */}

                                        <button
                                            onClick={
                                                handleFacebook
                                            }
                                            className="
                                                w-full
                                                text-left
                                                px-3
                                                py-2
                                                rounded
                                                flex
                                                items-center
                                                gap-2
                                                text-[#765A4C]
                                                hover:bg-[#F8EEE8]
                                                hover:text-[#874723]
                                                transition
                                            "
                                        >

                                            <FaFacebook className="text-[#A45F35]" />

                                            Facebook

                                        </button>


                                        {/* Instagram */}

                                        <button
                                            onClick={
                                                handleInstagram
                                            }
                                            className="
                                                w-full
                                                text-left
                                                px-3
                                                py-2
                                                rounded
                                                flex
                                                items-center
                                                gap-2
                                                text-[#765A4C]
                                                hover:bg-[#F8EEE8]
                                                hover:text-[#874723]
                                                transition
                                            "
                                        >

                                            <FaInstagram className="text-pink-600" />

                                            Instagram

                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>




                    </div>

                </div>


                {/* ==================================================
                    DESCRIPTION + FORM
                ================================================== */}

                <div className="mt-8">

                    <div className="
                        grid
                        grid-cols-1
                        lg:grid-cols-[460px_1fr]
                        xl:grid-cols-[520px_1fr]
                        gap-5
                        md:gap-6
                    ">


                        {/* ==================================================
                            QUOTE FORM
                        ================================================== */}

                        <div className="
                            bg-white
                            rounded-[24px]
                            md:rounded-[32px]
                            p-5
                            sm:p-6
                            md:p-8
                            border
                            border-[#E8C8B6]
                            shadow-[0_20px_60px_rgba(82,88,39,0.10)]
                            h-fit
                            lg:sticky
                            lg:top-24
                        ">

                            <h2 className="
                                text-2xl
                                md:text-3xl
                                font-bold
                                mb-2
                                text-[#3B2118]
                            ">
                                Request A Quote
                            </h2>



                            <form
                                onSubmit={
                                    handleSubmit
                                }
                                className="
                                    space-y-4
                                "
                            >

                                {/* Name */}

                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    value={
                                        form.name
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            name:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="
                                        w-full
                                        bg-[#F8EEE8]
                                        border
                                        border-[#E8C8B6]
                                        rounded-xl
                                        md:rounded-2xl
                                        px-4
                                        md:px-5
                                        py-3
                                        md:py-4
                                        text-[#3B2118]
                                        placeholder:text-[#8A6B5A]
                                        outline-none
                                        focus:border-[#A45F35]
                                        focus:ring-2
                                        focus:ring-[#A45F35]/20
                                        transition
                                    "
                                />


                                {/* Email */}

                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={
                                        form.email
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            email:
                                                e.target
                                                    .value,
                                        })
                                    }
                                    className="
                                        w-full
                                        bg-[#F8EEE8]
                                        border
                                        border-[#E8C8B6]
                                        rounded-xl
                                        md:rounded-2xl
                                        px-4
                                        md:px-5
                                        py-3
                                        md:py-4
                                        text-[#3B2118]
                                        placeholder:text-[#8A6B5A]
                                        outline-none
                                        focus:border-[#A45F35]
                                        focus:ring-2
                                        focus:ring-[#A45F35]/20
                                        transition
                                    "
                                />


                                {/* Phone */}

                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    maxLength={10}
                                    value={
                                        form.phone
                                    }
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            phone:
                                                e.target.value.replace(
                                                    /\D/g,
                                                    ""
                                                ),
                                        })
                                    }
                                    className="
                                        w-full
                                        bg-[#F8EEE8]
                                        border
                                        border-[#E8C8B6]
                                        rounded-2xl
                                        px-5
                                        py-4
                                        text-[#3B2118]
                                        placeholder:text-[#8A6B5A]
                                        outline-none
                                        focus:border-[#A45F35]
                                        focus:ring-2
                                        focus:ring-[#A45F35]/20
                                        transition
                                    "
                                />


                                {/* Submit */}

                                <button
                                    type="submit"
                                    disabled={
                                        submitting
                                    }
                                    className="
                                        w-full
                                        bg-[#A45F35]
                                        text-white
                                        py-4
                                        rounded-2xl
                                        font-semibold
                                        shadow-lg
                                        shadow-[#A45F35]/20
                                        hover:-translate-y-0.5
                                        hover:shadow-xl
                                        hover:shadow-[#A45F35]/25
                                        transition-all
                                        duration-300
                                        disabled:opacity-70
                                    "
                                >

                                    {submitting
                                        ? "Submitting..."
                                        : "Get Quote"}

                                </button>

                            </form>

                        </div>


                        {/* ==================================================
                            DESCRIPTION
                        ================================================== */}

                        <div className="
                            bg-white
                            rounded-[24px]
                            md:rounded-[32px]
                            p-5
                            sm:p-6
                            md:p-10
                            border
                            border-[#E8C8B6]
                            shadow-[0_20px_60px_rgba(82,88,39,0.10)]
                        ">


                            <h3 className="
                                text-2xl
                                md:text-3xl
                                font-bold
                                mb-4
                                md:mb-6
                                text-[#3B2118]
                            ">
                                Product Description
                            </h3>


                            <p className="
                                text-[#765A4C]
                                leading-7
                                md:leading-9
                                text-base
                                md:text-lg
                            ">
                                {product.desc ||
                                    product.description ||
                                    "No description available."}
                            </p>


                            {/* Specifications */}

                            <div className="
                                mt-10
                                overflow-x-auto
                            ">

                                <table className="
                                    w-full
                                    border
                                    border-[#E8C8B6]
                                ">

                                    <tbody>

                                        {[
                                            [
                                                "Brand",
                                                product.brand,
                                            ],
                                            [
                                                "Model",
                                                product.model,
                                            ],
                                            [
                                                "Usage",
                                                product.usage,
                                            ],
                                            [
                                                "Automation",
                                                product.automation,
                                            ],
                                            [
                                                "Capacity",
                                                product.capacity,
                                            ],
                                            [
                                                "Throughput",
                                                product.throughput,
                                            ],
                                        ].map(
                                            (
                                                [
                                                    label,
                                                    value,
                                                ],
                                                index
                                            ) => (

                                                <tr
                                                    key={
                                                        index
                                                    }
                                                >

                                                    <td className="
                                                        border
                                                        border-[#E8C8B6]
                                                        p-3
                                                        font-semibold
                                                        text-[#3B2118]
                                                        bg-[#F8EEE8]
                                                    ">
                                                        {
                                                            label
                                                        }
                                                    </td>

                                                    <td className="
                                                        border
                                                        border-[#E8C8B6]
                                                        p-3
                                                        text-[#765A4C]
                                                    ">
                                                        {
                                                            value ||
                                                            "N/A"
                                                        }
                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>


                            {/* ==================================================
                                SEO CONTENT
                            ================================================== */}

                            <div className="
                                mt-12
                            ">

                                <h3 className="
                                    text-2xl
                                    font-bold
                                    mb-4
                                    text-[#3B2118]
                                ">
                                    Why Choose Raj Biosis in{" "}
                                    {cityName}?
                                </h3>

                                <p className="
                                    text-[#765A4C]
                                    leading-8
                                ">
                                    Raj Biosis is a trusted supplier and
                                    distributor of{" "}
                                    {product.title} in{" "}
                                    {cityName}. We provide high-quality
                                    biomedical and laboratory equipment
                                    for hospitals, pathology laboratories,
                                    diagnostic centres and healthcare
                                    facilities.
                                </p>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        Features of{" "}
                                        {product.title}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        {product.title} offers reliable
                                        performance, accurate results,
                                        easy operation, long service
                                        life and efficient workflow for
                                        laboratories and hospitals.
                                    </p>

                                </div>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        Applications of{" "}
                                        {product.title}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        Widely used in hospitals,
                                        pathology labs, diagnostic
                                        centres, blood banks, research
                                        institutes and healthcare
                                        facilities.
                                    </p>

                                </div>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        {product.title} Supplier in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        Raj Biosis supplies{" "}
                                        {product.title} in{" "}
                                        {cityName} with technical
                                        support, installation assistance
                                        and customer service for
                                        hospitals and laboratories.
                                    </p>

                                </div>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        {product.title} Dealer in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        Raj Biosis is a trusted dealer
                                        of {product.title} in{" "}
                                        {cityName}. We supply biomedical
                                        equipment, laboratory instruments,
                                        diagnostic analyzers and healthcare
                                        devices to hospitals, pathology
                                        labs and research centres.
                                    </p>

                                </div>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        {product.title} Distributor in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        Looking for a reliable distributor
                                        of {product.title} in{" "}
                                        {cityName}? We provide installation
                                        support, product guidance,
                                        maintenance assistance and fast
                                        delivery.
                                    </p>

                                </div>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        Buy {product.title} in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        Buy high quality{" "}
                                        {product.title} in{" "}
                                        {cityName} at competitive prices.
                                        Contact Raj Biosis for the latest
                                        quotation and product availability.
                                    </p>

                                </div>


                                <div className="mt-8">

                                    <h3 className="
                                        text-2xl
                                        font-bold
                                        mb-4
                                        text-[#3B2118]
                                    ">
                                        {product.title} Price in{" "}
                                        {cityName}
                                    </h3>

                                    <p className="
                                        text-[#765A4C]
                                        leading-8
                                    ">
                                        The price of{" "}
                                        {product.title} depends on brand,
                                        model, specifications and features.
                                        Contact our team for the latest
                                        pricing, availability and delivery
                                        details.
                                    </p>

                                </div>

                            </div>


                            {/* ==================================================
                                FAQ
                            ================================================== */}

                            <div className="mt-12">

                                <h3 className="
                                    text-2xl
                                    font-bold
                                    mb-6
                                    text-[#3B2118]
                                ">
                                    Frequently Asked Questions
                                </h3>


                                <div className="
                                    space-y-8
                                ">

                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            What is{" "}
                                            {product.title} used for in{" "}
                                            {cityName}?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            {product.title} is commonly
                                            used in hospitals, pathology
                                            laboratories and diagnostic
                                            centres.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            What is the price of{" "}
                                            {product.title} in{" "}
                                            {cityName}?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            Pricing depends on
                                            specifications, brand and
                                            model. Contact us for a quote.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            Are you an authorized supplier
                                            of {product.title}?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            We supply genuine biomedical
                                            and laboratory equipment from
                                            trusted brands.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            Can hospitals in{" "}
                                            {cityName} order this product?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            Yes, hospitals, pathology
                                            laboratories, diagnostic
                                            centres and healthcare
                                            facilities can order this
                                            product.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            Do you provide installation
                                            support?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            Yes, installation and technical
                                            support are available depending
                                            on the product.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            Can I request a quotation?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            Yes, you can submit the enquiry
                                            form on this page to receive
                                            pricing and product information.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            Do you provide warranty?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            Warranty depends on the
                                            manufacturer and product model.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            Do you deliver across India?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            Yes, we supply products across
                                            India with safe packaging and
                                            logistics support.
                                        </p>

                                    </div>


                                    <div>

                                        <h4 className="
                                            font-semibold
                                            text-lg
                                            text-[#A45F35]
                                        ">
                                            How can I contact Raj Biosis?
                                        </h4>

                                        <p className="
                                            text-[#765A4C]
                                            mt-2
                                        ">
                                            You can fill out the enquiry
                                            form or contact our team
                                            directly for product details
                                            and quotations.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ==========================================================
                HIDDEN BROCHURE TEMPLATE
            ========================================================== */}

            <div
                ref={brochureRef}
                style={{
                    display: "none",
                    width: "800px",
                    padding: "40px",
                    fontFamily:
                        "system-ui, -apple-system, sans-serif",
                    color: "#3B2118",
                    background: "#FFFFFF",
                    boxSizing: "border-box",
                }}
            >

                {/* Header */}

                <div
                    style={{
                        display: "flex",
                        justifyContent:
                            "space-between",
                        alignItems:
                            "center",

                        borderBottom:
                            "3px solid #A45F35",

                        paddingBottom:
                            "20px",

                        marginBottom:
                            "30px",
                    }}
                >

                    {/* Logo */}

                    <div
                        style={{
                            display: "flex",
                            alignItems:
                                "center",
                            gap: "15px",
                        }}
                    >

                        <img
                            src="/logo.png"
                            style={{
                                height:
                                    "65px",
                                width:
                                    "auto",
                                objectFit:
                                    "contain",
                            }}
                        />

                        <div>

                            <h1
                                style={{
                                    margin: "0",
                                    fontSize:
                                        "28px",
                                    color:
                                        "#874723",
                                    fontWeight:
                                        "800",
                                    letterSpacing:
                                        "-0.5px",
                                }}
                            >
                                Raj Biosis
                            </h1>

                            <p
                                style={{
                                    margin:
                                        "2px 0 0 0",
                                    fontSize:
                                        "12px",
                                    color:
                                        "#A45F35",
                                    fontWeight:
                                        "600",
                                    textTransform:
                                        "uppercase",
                                    letterSpacing:
                                        "1px",
                                }}
                            >
                                Trusted Biomedical Systems
                            </p>

                        </div>

                    </div>


                    {/* Contact */}

                    <div
                        style={{
                            textAlign:
                                "right",
                            fontSize:
                                "12px",
                            lineHeight:
                                "1.6",
                            color:
                                "#765A4C",
                        }}
                    >

                        <p
                            style={{
                                margin:
                                    "0",
                                fontWeight:
                                    "700",
                                color:
                                    "#A45F35",
                                fontSize:
                                    "14px",
                            }}
                        >
                            www.globalhealthkart.com
                        </p>

                        <p
                            style={{
                                margin:
                                    "0",
                            }}
                        >
                            Email:{" "}
                            {
                                contactData.email
                            }
                        </p>

                        <div
                            style={{
                                margin:
                                    "0",
                            }}
                        >

                            {contactData.phone
                                .split(
                                    /[\n,]+/
                                )
                                .map(
                                    (
                                        num,
                                        i
                                    ) => (

                                        <span
                                            key={
                                                i
                                            }
                                            style={{
                                                display:
                                                    "block",
                                            }}
                                        >
                                            Mob:{" "}
                                            {num.trim()}
                                        </span>

                                    )
                                )}

                        </div>

                    </div>

                </div>


                {/* Product Title */}

                <h2
                    style={{
                        fontSize:
                            "26px",
                        color:
                            "#3B2118",
                        margin:
                            "0 0 25px 0",
                        textAlign:
                            "center",
                        fontWeight:
                            "800",
                        textTransform:
                            "uppercase",
                    }}
                >
                    {product.title}
                </h2>


                {/* Main Grid */}

                <div
                    style={{
                        display:
                            "flex",
                        gap:
                            "30px",
                        marginBottom:
                            "35px",
                    }}
                >

                    {/* Image */}

                    <div
                        style={{
                            flex:
                                "1.2",

                            border:
                                "1px solid #E8C8B6",

                            borderRadius:
                                "16px",

                            padding:
                                "20px",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            justifyContent:
                                "center",

                            height:
                                "320px",

                            backgroundColor:
                                "#F8EEE8",
                        }}
                    >

                        <img
                            src={
                                brochureImage ||
                                "/placeholder.jpg"
                            }
                            style={{
                                maxWidth:
                                    "100%",
                                maxHeight:
                                    "100%",
                                objectFit:
                                    "contain",
                            }}
                        />

                    </div>


                    {/* Specs */}

                    <div
                        style={{
                            flex: "1",
                            display:
                                "flex",
                            flexDirection:
                                "column",
                            justifyContent:
                                "space-between",
                        }}
                    >

                        <div
                            style={{
                                backgroundColor:
                                    "#F8EEE8",

                                border:
                                    "1px solid #E8C8B6",

                                borderRadius:
                                    "16px",

                                padding:
                                    "20px",

                                height:
                                    "100%",

                                boxSizing:
                                    "border-box",
                            }}
                        >

                            <h3
                                style={{
                                    margin:
                                        "0 0 15px 0",

                                    color:
                                        "#A45F35",

                                    fontSize:
                                        "18px",

                                    fontWeight:
                                        "700",

                                    borderBottom:
                                        "1px solid #E8C8B6",

                                    paddingBottom:
                                        "8px",
                                }}
                            >
                                Specifications
                            </h3>


                            <div
                                style={{
                                    display:
                                        "flex",
                                    flexDirection:
                                        "column",
                                    gap:
                                        "10px",
                                }}
                            >

                                <p
                                    style={{
                                        margin:
                                            "0",
                                        fontSize:
                                            "14px",
                                        color:
                                            "#765A4C",
                                    }}
                                >
                                    <strong
                                        style={{
                                            color:
                                                "#3B2118",
                                        }}
                                    >
                                        Brand:
                                    </strong>{" "}
                                    {
                                        product.brand ||
                                        "Raj Biosis"
                                    }
                                </p>


                                <p
                                    style={{
                                        margin:
                                            "0",
                                        fontSize:
                                            "14px",
                                        color:
                                            "#765A4C",
                                    }}
                                >
                                    <strong
                                        style={{
                                            color:
                                                "#3B2118",
                                        }}
                                    >
                                        Model:
                                    </strong>{" "}
                                    {
                                        product.model ||
                                        "N/A"
                                    }
                                </p>


                                {product.instrument && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Instrument:
                                        </strong>{" "}
                                        {
                                            product.instrument
                                        }
                                    </p>
                                )}


                                {product.category && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Category:
                                        </strong>{" "}
                                        {
                                            product.category
                                        }
                                    </p>
                                )}


                                {product.subCategory && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Subcategory:
                                        </strong>{" "}
                                        {
                                            product.subCategory
                                        }
                                    </p>
                                )}


                                {product.capacity && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Capacity:
                                        </strong>{" "}
                                        {
                                            product.capacity
                                        }
                                    </p>
                                )}


                                {product.throughput && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Throughput:
                                        </strong>{" "}
                                        {
                                            product.throughput
                                        }
                                    </p>
                                )}


                                {product.usage && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Usage:
                                        </strong>{" "}
                                        {
                                            product.usage
                                        }
                                    </p>
                                )}


                                {product.automation && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Automation:
                                        </strong>{" "}
                                        {
                                            product.automation
                                        }
                                    </p>
                                )}


                                {product.availability && (
                                    <p
                                        style={{
                                            margin:
                                                "0",
                                            fontSize:
                                                "14px",
                                            color:
                                                "#765A4C",
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color:
                                                    "#3B2118",
                                            }}
                                        >
                                            Availability:
                                        </strong>{" "}
                                        {
                                            product.availability
                                        }
                                    </p>
                                )}

                            </div>

                        </div>

                    </div>

                </div>


                {/* Product Overview */}

                <div
                    style={{
                        marginBottom:
                            "35px",
                    }}
                >

                    <h3
                        style={{
                            color:
                                "#A45F35",

                            fontSize:
                                "18px",

                            fontWeight:
                                "700",

                            borderLeft:
                                "4px solid #A45F35",

                            paddingLeft:
                                "10px",

                            margin:
                                "0 0 12px 0",
                        }}
                    >
                        Product Overview
                    </h3>


                    <p
                        style={{
                            fontSize:
                                "14px",

                            lineHeight:
                                "1.6",

                            color:
                                "#765A4C",

                            margin:
                                "0",

                            textAlign:
                                "justify",
                        }}
                    >
                        {product.description ||
                            product.desc ||
                            "Premium biomedical equipment designed for laboratories, hospitals, and diagnostic centers."}
                    </p>

                </div>


                {/* Footer */}

                <div
                    style={{
                        marginTop:
                            "auto",

                        borderTop:
                            "1px solid #E8C8B6",

                        paddingTop:
                            "20px",

                        textAlign:
                            "center",

                        fontSize:
                            "11px",

                        color:
                            "#8A6B5A",

                        lineHeight:
                            "1.5",
                    }}
                >

                    <p
                        style={{
                            margin:
                                "0",
                            fontWeight:
                                "600",
                        }}
                    >
                        Office Address:{" "}
                        {
                            contactData.address
                        }
                    </p>

                    <p
                        style={{
                            margin:
                                "5px 0 0 0",
                        }}
                    >
                        © 2026 Raj Biosis. All rights reserved. Premium diagnostics and biomedical solutions.
                    </p>

                </div>

            </div>


            {/* ==========================================================
                DOWNLOAD BROCHURE
            ========================================================== */}

            <button
                onClick={
                    handleDownloadBrochure
                }
                disabled={
                    downloading
                }
                title="Download Brochure"
                className="
                    fixed
                    bottom-24
                    right-8
                    z-40
                    flex
                    h-14
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-gradient-to-r
                    from-[#874723]
                    via-[#A45F35]
                    to-[#9A5632]
                    px-6
                    text-white
                    shadow-lg
                    shadow-[#A45F35]/25
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:shadow-xl
                    hover:shadow-[#A45F35]/30
                    active:scale-95
                    disabled:opacity-75
                    font-semibold
                "
            >

                {downloading ? (

                    <div className="
                        h-5
                        w-5
                        animate-spin
                        rounded-full
                        border-2
                        border-white
                        border-t-transparent
                    " />

                ) : (

                    <Download
                        size={20}
                    />

                )}

                <span>
                    Download Brochure
                </span>

            </button>

        </section>
    );
}