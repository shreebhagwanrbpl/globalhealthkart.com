import Image from "next/image";
import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import { ShieldCheck, Award, Microscope, Users, Sparkles, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  const strengths = [
    {
      icon: "🔬",
      title: "Diagnostic Expertise",
      description:
        "We focus on biomedical and diagnostic equipment that supports accurate laboratory workflows and efficient healthcare operations.",
    },
    {
      icon: "⚙️",
      title: "Practical Solutions",
      description:
        "Our approach is centered on understanding application requirements and providing equipment solutions that fit real operational needs.",
    },
    {
      icon: "📋",
      title: "Professional Guidance",
      description:
        "We assist customers with product selection, technical information and solution planning for different healthcare environments.",
    },
    {
      icon: "🛠️",
      title: "Continued Assistance",
      description:
        "Our relationship continues beyond product supply through installation coordination, maintenance assistance and responsive support.",
    },
  ];

  const healthcareAreas = [
    {
      title: "Hospitals",
      description:
        "Biomedical and diagnostic solutions supporting hospital laboratories, clinical departments and healthcare operations.",
    },
    {
      title: "Diagnostic Centres",
      description:
        "Equipment solutions designed to support efficient testing, analysis and day-to-day diagnostic workflows.",
    },
    {
      title: "Pathology Laboratories",
      description:
        "Laboratory equipment for routine diagnostic applications, testing environments and professional laboratory requirements.",
    },
    {
      title: "Research & Institutions",
      description:
        "Biomedical solutions suitable for research environments, educational institutions and specialized laboratory applications.",
    },
  ];

  return (
    <>
      {/* Banner */}
      <PageBanner
        title="About Raj Biosis"
        subtitle="Delivering trusted diagnostic and biomedical technologies with innovation, quality, and healthcare precision."
      />

      {/* ======================================================
          ABOUT SECTION
      ====================================================== */}
      <section className="section-padding bg-gradient-to-b from-white to-[#F8EEE8]">
        <div className="container-custom grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left Visual Highlight Showcase */}
          <div className="relative">
            <div className="overflow-hidden rounded-[32px] border border-[#E8C8B6] bg-white p-8 shadow-xl shadow-[#A45F35]/10">
              <div className="relative h-[280px] w-full overflow-hidden rounded-2xl bg-[#F8EEE8] sm:h-[340px]">
                <Image
                  src="/home.png"
                  alt="Raj Biosis Biomedical Solutions"
                  fill
                  priority
                  className="object-contain p-4"
                />
              </div>

              {/* Badges Grid */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#F1DDD1] bg-[#F8EEE8] p-4 text-center">
                  <p className="text-2xl font-black text-[#A45F35]">10+</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Years Excellence</p>
                </div>
                <div className="rounded-2xl border border-[#F1DDD1] bg-[#F8EEE8] p-4 text-center">
                  <p className="text-2xl font-black text-[#A45F35]">100%</p>
                  <p className="mt-1 text-xs font-semibold text-slate-600">Quality Assured</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content */}
          <div>
            <SectionTitle
              badge="WHO WE ARE"
              title="Dedicated To Biomedical & Diagnostics"
              description="Delivering innovative biomedical equipment and laboratory solutions with quality, precision and trusted healthcare support."
            />

            <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
              At Raj Biosis, we specialize in providing premium biomedical and diagnostic equipment that enhances laboratory performance, healthcare accuracy and clinical efficiency across hospitals, laboratories and healthcare institutions.
            </p>

            <p className="mt-4 text-base leading-relaxed text-slate-600 sm:text-lg">
              Our mission is to empower healthcare professionals through advanced technology, reliable products and dedicated after-sales support while maintaining the highest standards of quality and innovation.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 rounded-xl border border-[#E8C8B6] bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EEE8] text-[#A45F35]">
                  <Microscope size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Premium Equipment</h4>
                  <p className="text-xs text-slate-500">High precision diagnostic tools</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-[#E8C8B6] bg-white p-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F8EEE8] text-[#A45F35]">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Expert Support</h4>
                  <p className="text-xs text-slate-500">Professional technical guidance</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          OUR STRENGTHS
      ====================================================== */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <SectionTitle
            badge="OUR COMMITMENT"
            title="Why Healthcare Facilities Trust Us"
            description="Our focus is on practical, dependable solutions tailored to modern healthcare requirements."
            center
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {strengths.map((item, index) => (
              <div
                key={index}
                className="group rounded-[24px] border border-[#E8C8B6] bg-[#F8EEE8] p-7 transition-all duration-300 hover:-translate-y-1.5 hover:bg-[#A45F35] hover:text-white hover:shadow-xl hover:shadow-[#A45F35]/15"
              >
                <div className="text-4xl">{item.icon}</div>
                <h3 className="mt-5 text-xl font-bold text-slate-900 group-hover:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600 group-hover:text-white/90">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================
          HEALTHCARE AREAS
      ====================================================== */}
      <section className="section-padding bg-[#F8EEE8]">
        <div className="container-custom">
          <SectionTitle
            badge="DOMAINS WE SERVE"
            title="Supporting Modern Healthcare Environments"
            description="Delivering biomedical solutions across various specialized medical and diagnostic sectors."
            center
          />

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {healthcareAreas.map((area, index) => (
              <div
                key={index}
                className="rounded-[24px] border border-[#E8C8B6] bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-xl font-bold text-slate-900">
                  {area.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
