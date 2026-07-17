"use client";
import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Activity,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";
// import CTASection from "@/components/CTASection";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const icons = [
    <Microscope size={30} />,
    <FlaskConical size={30} />,
    <ShieldCheck size={30} />,
    <Stethoscope size={30} />,
    <Wrench size={30} />,
    <Activity size={30} />,
  ];
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicals",
            "pages",
            "services"
          )
        );

        if (snap.exists()) {
          setServices(snap.data().services || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);
  return (
    <>
      {/* Banner */}
      <PageBanner
        title="Our Services"
        subtitle="Delivering trusted biomedical and diagnostic services with innovation, precision, and healthcare excellence."
      />

      {/* Services Grid */}
      <section className="section-padding bg-gradient-to-b from-white to-green-50">

        <div className="container-custom">

          <SectionTitle
            badge="What We Offer"
            title="Premium Biomedical Services"
            description="We provide innovative healthcare and biomedical solutions tailored to modern diagnostics and laboratory excellence."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[30px] border border-green-100 bg-white p-10 shadow-lg shadow-green-100"
                >

                  {/* Icon */}

                  <div className="mb-8 h-20 w-20 rounded-3xl bg-green-100"></div>

                  {/* Title */}

                  <div className="mb-6 h-8 w-2/3 rounded bg-green-100"></div>

                  {/* Description */}

                  <div className="space-y-3">

                    <div className="h-4 rounded bg-green-100"></div>

                    <div className="h-4 w-11/12 rounded bg-green-100"></div>

                    <div className="h-4 w-8/12 rounded bg-green-100"></div>

                  </div>

                </div>
              ))
              : services.map((service, index) => (
                <ServiceCard
                  key={index}
                  icon={icons[index]}
                  title={service.title}
                  description={service.desc}
                />
              ))}

          </div>

        </div>

      </section>

      {/* Working Process */}
      <section className="section-padding bg-gradient-to-b from-green-50 to-white">

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
                title: "Consultation",
                desc:
                  "Understanding healthcare requirements, laboratory needs and recommending the most suitable biomedical solutions.",
              },
              {
                step: "02",
                title: "Implementation",
                desc:
                  "Supplying, installing and configuring biomedical equipment with complete technical guidance.",
              },
              {
                step: "03",
                title: "Support",
                desc:
                  "Providing ongoing maintenance, expert assistance and after-sales support for long-term reliability.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="group relative overflow-hidden rounded-[30px] border border-green-100 bg-white p-8 shadow-lg shadow-green-100 transition-all duration-300 hover:-translate-y-2 hover:border-green-300 hover:shadow-2xl hover:shadow-green-200"
              >

                {/* Step Number */}

                <span className="text-6xl font-black text-green-100 transition group-hover:text-green-200">

                  {item.step}

                </span>

                {/* Title */}

                <h3 className="mt-5 text-2xl font-bold text-slate-900">

                  {item.title}

                </h3>

                {/* Description */}

                <p className="mt-4 leading-7 text-slate-600">

                  {item.desc}

                </p>

                {/* Bottom Line */}

                <div className="mt-8 h-1 w-16 rounded-full bg-green-500 transition-all duration-300 group-hover:w-24"></div>

              </div>
            ))}

          </div>

        </div>

      </section>

      {/* CTA */}
      {/* <CTASection /> */}
    </>
  );
}