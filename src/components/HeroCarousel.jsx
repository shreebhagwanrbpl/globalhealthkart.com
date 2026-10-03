"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, CheckCircle2 } from "lucide-react";

export default function HeroCarousel({ heroData, makeLink }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const slides = [
    {
      id: 1,
      badge: "BIOMEDICAL & PATHOLOGY SOLUTIONS",
      title: heroData?.title || "End-to-End Biomedical Technology & Diagnostic Analyzers",
      description: heroData?.description || "Experience unparalleled diagnostic accuracy with Raj Biosis's portfolio of fully automated clinical analyzers, high-grade laboratory consumables, and proactive maintenance contracts.",
      image: "/home.png",
      button1Text: heroData?.button1Text || "Explore Diagnostic Range",
      button1Link: "/items",
      button2Text: heroData?.button2Text || "Inquire About Equipment",
      button2Link: "/contact",
      tag: "5000+ Happy Healthcare Partners Across India",
    },
    {
      id: 2,
      badge: "HIGH-PRECISION TESTING CONSUMABLES",
      title: "Premium Blood Glucose & Rapid Diagnostic Test Strips",
      description: "Certified clinical test strips, GlucoSpark consumables, and hemoglobin testing supplies delivering rapid 5-second results with maximum clinical sensitivity.",
      image: "https://5.imimg.com/data5/SELLER/Default/2026/7/623275033/YF/CN/HG/232173594/glucospark-blood-glucose-strips-50t-500x500.jpeg",
      button1Text: "View Test Strips Catalog",
      button1Link: "/items",
      button2Text: "Request Bulk Quote",
      button2Link: "/contact",
      tag: "3500+ Diagnostic Consumables In Stock",
    },
    {
      id: 3,
      badge: "FULL TECHNICAL ASSISTANCE & AMC",
      title: "Turnkey Laboratory Setup & 24/7 Preventive Maintenance",
      description: "From turnkey lab architecture and clinical equipment commissioning to sensor calibration and bidirectional LIS interfacing, we ensure zero laboratory downtime.",
      image: "/about.png",
      button1Text: "Our Specialized Services",
      button1Link: "/services",
      button2Text: "Speak With An Engineer",
      button2Link: "/contact",
      tag: "24/7 Dedicated Emergency Field Support",
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Autoplay
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide]);

  const slide = slides[currentSlide];

  return (
    <section 
      className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-4 pb-8"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Main Container */}
      <div className="relative min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] w-full overflow-hidden rounded-[28px] sm:rounded-[36px] border border-[#E8C8B6] bg-slate-950 shadow-2xl shadow-[#A45F35]/15">
        
        {/* Background Image with Dynamic Animation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              priority
              unoptimized
              className="h-full w-full object-cover object-center"
            />

            {/* Premium Rich Dual Gradients for Perfect Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/40" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
            <div className="absolute inset-0 bg-[#A45F35]/10 mix-blend-overlay" />
          </motion.div>
        </AnimatePresence>

        {/* Content Box Over Image */}
        <div className="relative z-10 flex h-full min-h-[480px] sm:min-h-[540px] lg:min-h-[580px] flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 max-w-3xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="flex flex-col items-start"
            >
              {/* Badge */}
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E8C8B6]/40 bg-black/40 px-4 py-1.5 backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#E8C8B6] animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#E8C8B6]">
                  {slide.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black leading-[1.15] text-white drop-shadow-md">
                {slide.title}
              </h1>

              {/* Description */}
              <p className="mt-4 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-200/90 drop-shadow-sm line-clamp-3 sm:line-clamp-none">
                {slide.description}
              </p>

              {/* Action Buttons */}
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href={makeLink(slide.button1Link)}
                  className="group inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#A45F35] px-6 sm:px-8 py-3.5 font-bold text-white shadow-lg shadow-[#A45F35]/30 transition-all duration-300 hover:bg-[#874723] hover:shadow-xl hover:shadow-[#A45F35]/40 hover:-translate-y-0.5"
                >
                  <span>{slide.button1Text}</span>
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </Link>

                <Link
                  href={makeLink(slide.button2Link)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 sm:px-7 py-3.5 font-semibold text-white backdrop-blur-md transition-all duration-300 hover:bg-white hover:text-slate-900 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <span>{slide.button2Text}</span>
                </Link>
              </div>

              {/* Mini Feature Tag */}
              <div className="mt-8 flex items-center gap-2 text-xs font-medium text-slate-300/80">
                <CheckCircle2 size={15} className="text-[#E8C8B6]" />
                <span>{slide.tag}</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Carousel Navigation Arrows */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-[#A45F35] hover:border-[#A45F35] hover:scale-110 shadow-lg cursor-pointer"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-md transition-all duration-200 hover:bg-[#A45F35] hover:border-[#A45F35] hover:scale-110 shadow-lg cursor-pointer"
        >
          <ChevronRight size={22} />
        </button>

        {/* Carousel Pagination Dots */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 rounded-full border border-white/15 bg-black/50 px-3.5 py-1.5 backdrop-blur-md">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                currentSlide === index ? "w-7 bg-[#E8C8B6]" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
