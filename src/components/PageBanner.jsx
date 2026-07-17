"use client";

import { motion } from "framer-motion";

export default function PageBanner({
  title,
  subtitle,
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-100 py-28 lg:py-36">

      {/* Background Blur */}
      <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-green-300/20 blur-[120px]" />

      <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-300/20 blur-[140px]" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(#636b2f10_1px,transparent_1px),linear-gradient(90deg,#636b2f10_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="container-custom relative z-10">

        <motion.div
          initial={{
            opacity: 0,
            y: 50,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="mx-auto max-w-4xl text-center"
        >

          {/* Badge */}

          <span className="inline-flex rounded-full bg-green-100 px-5 py-2 text-sm font-semibold text-green-700">

            Welcome to Our Company

          </span>

          {/* Title */}

          <h1 className="mt-8 text-5xl font-black leading-tight text-slate-900 lg:text-7xl">

            {title}

          </h1>

          {/* Subtitle */}

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">

            {subtitle}

          </p>

        </motion.div>

      </div>

    </section>
  );
}