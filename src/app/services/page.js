"use client";

import {
  Microscope,
  FlaskConical,
  ShieldCheck,
  Stethoscope,
  Wrench,
  Activity,
  Settings,
  Truck,
  Headphones,
  GraduationCap,
  ClipboardCheck,
  RefreshCw,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import ServiceCard from "@/components/ServiceCard";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const icons = [
    Microscope,
    FlaskConical,
    ShieldCheck,
    Stethoscope,
    Wrench,
    Activity,
  ];

  const whyChooseUs = [
    {
      icon: ShieldCheck,
      title: "Quality-Focused Solutions",
      description:
        "We help healthcare facilities identify suitable biomedical equipment according to their operational requirements, laboratory workflow and application needs.",
    },
    {
      icon: ClipboardCheck,
      title: "Requirement-Based Guidance",
      description:
        "Our team focuses on understanding the actual requirement before recommending equipment, helping customers make informed purchasing decisions.",
    },
    {
      icon: Settings,
      title: "Professional Coordination",
      description:
        "From product selection to installation coordination, we maintain a structured approach so every stage of the equipment process remains organized.",
    },
    {
      icon: Truck,
      title: "Reliable Delivery Support",
      description:
        "We coordinate product dispatch and delivery requirements with attention to safe handling and timely movement of biomedical equipment.",
    },
    {
      icon: GraduationCap,
      title: "Application Assistance",
      description:
        "We provide practical guidance related to equipment applications, helping laboratories and healthcare teams understand how a solution fits their workflow.",
    },
    {
      icon: RefreshCw,
      title: "Long-Term Partnership",
      description:
        "Our objective is not limited to a single transaction. We aim to build lasting relationships through responsive communication and continued assistance.",
    },
  ];

  const serviceCoverage = [
    {
      icon: Stethoscope,
      title: "Hospitals",
      description:
        "Biomedical equipment solutions for hospital laboratories, diagnostic departments and clinical environments.",
    },
    {
      icon: Microscope,
      title: "Pathology Laboratories",
      description:
        "Equipment support for routine testing, laboratory workflows and diagnostic operations.",
    },
    {
      icon: Activity,
      title: "Diagnostic Centres",
      description:
        "Reliable solutions designed to support efficient diagnostic processes and day-to-day operations.",
    },
    {
      icon: FlaskConical,
      title: "Research Facilities",
      description:
        "Specialized laboratory equipment solutions for research, testing and scientific applications.",
    },
  ];

  const workingProcess = [
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
  ];

  const supportPoints = [
    "Installation and setup coordination",
    "Equipment usage and application guidance",
    "Maintenance assistance and technical coordination",
    "Product-related troubleshooting support",
    "Ongoing communication with healthcare teams",
  ];

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "globalhealthkartcom",
            "pages",
            "services"
          )
        );

        if (snap.exists()) {
          const data = snap.data();

          setServices(
            Array.isArray(data.services)
              ? data.services
              : []
          );
        }
      } catch (error) {
        console.error("Services fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <>


      {/* ======================================================
          SERVICES
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-white to-[#F8EEE8]">
        <div className="container-custom">

          <SectionTitle
            badge="What We Offer"
            title="Premium Biomedical Services"
            description="We provide innovative healthcare and biomedical solutions tailored to modern diagnostics and laboratory excellence."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {loading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse rounded-[30px] border border-[#F1DDD1] bg-white p-10 shadow-lg shadow-[#F1DDD1]"
                >
                  <div className="mb-8 h-20 w-20 rounded-3xl bg-[#F1DDD1]" />

                  <div className="mb-6 h-8 w-2/3 rounded bg-[#F1DDD1]" />

                  <div className="space-y-3">
                    <div className="h-4 rounded bg-[#F1DDD1]" />
                    <div className="h-4 w-11/12 rounded bg-[#F1DDD1]" />
                    <div className="h-4 w-8/12 rounded bg-[#F1DDD1]" />
                  </div>
                </div>
              ))
            ) : services.length > 0 ? (
              services.map((service, index) => {
                const Icon = icons[index % icons.length];

                return (
                  <ServiceCard
                    key={service.id || index}
                    icon={<Icon size={30} />}
                    title={service.title || "Biomedical Service"}
                    description={service.desc || service.description || ""}
                  />
                );
              })
            ) : (
              <div className="col-span-full rounded-[30px] border border-[#F1DDD1] bg-white p-10 text-center shadow-lg">
                <p className="text-lg font-medium text-slate-600">
                  Services information is currently unavailable.
                </p>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* ======================================================
          WHY CHOOSE US
      ====================================================== */}

      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="Why Choose Us"
            title="Built Around Quality & Reliability"
            description="Our approach focuses on dependable equipment solutions, professional coordination and long-term value for healthcare organizations."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {whyChooseUs.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="group rounded-[30px] border border-[#F1DDD1] bg-white p-8 shadow-lg shadow-[#F1DDD1] transition-all duration-300 hover:-translate-y-2 hover:border-[#D7A384] hover:shadow-2xl hover:shadow-[#E8C8B6]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEE8] text-[#A45F35] transition-all duration-300 group-hover:bg-[#A45F35] group-hover:text-white">
                    <Icon size={30} />
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-4 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ======================================================
          SERVICE COVERAGE
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-[#F8EEE8] to-white">
        <div className="container-custom">

          <SectionTitle
            badge="Service Coverage"
            title="Solutions For Different Healthcare Environments"
            description="Our biomedical services can support a wide range of healthcare and laboratory environments with application-focused solutions."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {serviceCoverage.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="rounded-[28px] border border-[#F1DDD1] bg-white p-7 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D7A384] hover:shadow-xl"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#F1DDD1] text-[#874723]">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>
                </div>
              );
            })}

          </div>
        </div>
      </section>

      {/* ======================================================
          WORKING PROCESS
      ====================================================== */}

      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="How We Work"
            title="Simple & Professional Process"
            description="We follow a streamlined process to deliver reliable biomedical and healthcare solutions with precision and excellence."
            center
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-3">

            {workingProcess.map((item, index) => (
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
            ))}

          </div>
        </div>
      </section>

      {/* ======================================================
          AFTER SALES SUPPORT
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-white to-[#F8EEE8]">
        <div className="container-custom">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* LEFT */}

            <div>
              <span className="inline-block rounded-full border border-[#F1DDD1] bg-[#F8EEE8] px-5 py-2 font-semibold text-[#874723]">
                After-Sales Support
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Support That Continues After Installation
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                Biomedical equipment requires proper coordination, maintenance
                and technical attention throughout its working life. Our
                support approach is designed to help healthcare facilities
                maintain dependable equipment performance.
              </p>

              <div className="mt-8 space-y-5">

                {supportPoints.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4"
                  >
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#A45F35] text-white">
                      <ShieldCheck size={15} />
                    </div>

                    <p className="leading-7 text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}

              </div>
            </div>

            {/* RIGHT */}

            <div className="rounded-[35px] border border-[#F1DDD1] bg-white p-8 shadow-xl shadow-[#F1DDD1] md:p-10">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A45F35] text-white shadow-lg shadow-[#E8C8B6]">
                <Headphones size={30} />
              </div>

              <h3 className="mt-7 text-2xl font-bold text-slate-900">
                Need Help With Your Biomedical Equipment?
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                Whether you are planning a new laboratory setup, replacing
                existing equipment or looking for technical assistance,
                our team can help you understand the available options.
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

      {/* ======================================================
          FINAL CONTENT
      ====================================================== */}

      <section className="section-padding bg-white">
        <div className="container-custom max-w-5xl">

          <div className="rounded-[35px] border border-[#F1DDD1] bg-gradient-to-br from-[#F8EEE8] via-white to-[#F8EEE8] p-8 text-center shadow-lg shadow-[#F1DDD1] md:p-12">

            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              A Reliable Partner For Biomedical Solutions
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              From laboratory requirements and diagnostic equipment to
              installation coordination and ongoing assistance, we focus
              on delivering practical solutions that support efficient
              healthcare operations.
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

      {/* CTA */}
      {/* <CTASection /> */}
    </>
  );
}