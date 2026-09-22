import Image from "next/image";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import DDS from "@/components/img/Dds.png";

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
        <div className="container-custom grid items-center gap-20 lg:grid-cols-2">

          {/* Left Image */}

          <div className="relative">
            <div className="flex h-[600px] items-center justify-center overflow-hidden rounded-[40px] border border-[#F1DDD1] bg-gradient-to-br from-[#F8EEE8] via-white to-[#F8EEE8] p-10 shadow-xl shadow-[#F1DDD1]">

              <Image
                src={DDS}
                alt="Raj Biosis Biomedical Equipment"
                width={1200}
                height={900}
                className="max-h-full max-w-full object-contain transition duration-500 hover:scale-105"
              />

            </div>

            {/* Experience Card */}

            <div className="absolute bottom-8 left-8 hidden rounded-[28px] border border-[#F1DDD1] bg-white px-8 py-6 shadow-2xl lg:block">

              <h3 className="text-4xl font-black text-[#A45F35]">
                10+
              </h3>

              <p className="mt-2 text-slate-500">
                Years of Excellence
              </p>

            </div>
          </div>


          {/* Right Content */}

          <div>

            <SectionTitle
              badge="Who We Are"
              title="Trusted Partner in Biomedical & Diagnostics"
              description="Delivering innovative biomedical equipment and laboratory solutions with quality, precision and trusted healthcare support."
            />

            <p className="mt-8 leading-8 text-slate-600">
              At Raj Biosis, we specialize in providing premium biomedical
              and diagnostic equipment that enhances laboratory performance,
              healthcare accuracy and clinical efficiency across hospitals,
              laboratories and healthcare institutions.
            </p>

            <p className="mt-6 leading-8 text-slate-600">
              Our mission is to empower healthcare professionals through
              advanced technology, reliable products and dedicated
              after-sales support while maintaining the highest standards
              of quality and innovation.
            </p>


            {/* Features */}

            <div className="mt-10 grid gap-6 sm:grid-cols-2">

              <div className="rounded-3xl border border-[#F1DDD1] bg-[#F8EEE8] p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-[#F1DDD1]">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1DDD1] text-2xl">
                  🏥
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  Premium Equipment
                </h4>

                <p className="mt-3 leading-7 text-slate-600">
                  High-quality laboratory and diagnostic instruments
                  designed for maximum precision and long-term reliability.
                </p>

              </div>


              <div className="rounded-3xl border border-[#F1DDD1] bg-[#F8EEE8] p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-[#F1DDD1]">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F1DDD1] text-2xl">
                  🤝
                </div>

                <h4 className="text-xl font-bold text-slate-900">
                  Expert Support
                </h4>

                <p className="mt-3 leading-7 text-slate-600">
                  Professional consultation, installation, maintenance
                  and dedicated customer support across India.
                </p>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ======================================================
          MISSION & VISION
      ====================================================== */}

      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="Our Purpose"
            title="Driven By Better Healthcare Solutions"
            description="Our work is guided by a clear purpose to make dependable biomedical technology more accessible to healthcare professionals and institutions."
            center
          />

          <div className="mt-16 grid gap-8 lg:grid-cols-2">

            {/* Mission */}

            <div className="group rounded-[35px] border border-[#F1DDD1] bg-[#F8EEE8] p-8 shadow-lg shadow-[#F1DDD1] transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-2xl hover:shadow-[#E8C8B6] md:p-10">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A45F35] text-2xl text-white shadow-lg shadow-[#E8C8B6]">
                🎯
              </div>

              <h3 className="mt-7 text-2xl font-bold text-slate-900">
                Our Mission
              </h3>

              <p className="mt-5 leading-8 text-slate-600">
                To provide dependable biomedical and diagnostic solutions
                that help healthcare professionals improve laboratory
                efficiency, operational reliability and patient-focused
                healthcare delivery.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                We aim to combine quality products, professional guidance
                and responsive support to create meaningful value for
                hospitals, laboratories and healthcare institutions.
              </p>

            </div>


            {/* Vision */}

            <div className="group rounded-[35px] border border-[#F1DDD1] bg-white p-8 shadow-lg shadow-[#F1DDD1] transition-all duration-300 hover:-translate-y-2 hover:bg-[#F8EEE8] hover:shadow-2xl hover:shadow-[#E8C8B6] md:p-10">

              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#A45F35] text-2xl text-white shadow-lg shadow-[#E8C8B6]">
                🌍
              </div>

              <h3 className="mt-7 text-2xl font-bold text-slate-900">
                Our Vision
              </h3>

              <p className="mt-5 leading-8 text-slate-600">
                To become a trusted name in biomedical and diagnostic
                solutions by consistently delivering quality, innovation
                and professional service to healthcare organizations.
              </p>

              <p className="mt-4 leading-8 text-slate-600">
                We envision a healthcare ecosystem where modern technology
                and dependable equipment contribute to better laboratory
                performance and more efficient diagnostic processes.
              </p>

            </div>

          </div>
        </div>
      </section>


      {/* ======================================================
          WHAT SETS US APART
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-[#F8EEE8] to-white">
        <div className="container-custom">

          <SectionTitle
            badge="Why Raj Biosis"
            title="What Sets Us Apart"
            description="Our approach combines product knowledge, practical understanding and customer-focused support to create dependable biomedical solutions."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

            {strengths.map((item, index) => (
              <div
                key={index}
                className="group rounded-[30px] border border-[#F1DDD1] bg-white p-7 shadow-lg shadow-[#F1DDD1] transition-all duration-300 hover:-translate-y-2 hover:border-[#D7A384] hover:shadow-2xl hover:shadow-[#E8C8B6]"
              >

                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8EEE8] text-3xl transition-all duration-300 group-hover:bg-[#A45F35]">
                  {item.icon}
                </div>

                <h3 className="mt-6 text-xl font-bold text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-600">
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

      <section className="section-padding bg-white">
        <div className="container-custom">

          <SectionTitle
            badge="Our Reach"
            title="Supporting Different Healthcare Environments"
            description="Our solutions are designed to serve the diverse requirements of healthcare, diagnostic and laboratory environments."
            center
          />

          <div className="mt-16 grid gap-8 md:grid-cols-2">

            {healthcareAreas.map((item, index) => (
              <div
                key={index}
                className="group flex gap-6 rounded-[30px] border border-[#F1DDD1] bg-white p-8 shadow-md transition-all duration-300 hover:-translate-y-1 hover:border-[#D7A384] hover:shadow-xl hover:shadow-[#F1DDD1]"
              >

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#F1DDD1] text-xl font-bold text-[#874723]">
                  0{index + 1}
                </div>

                <div>

                  <h3 className="text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 leading-7 text-slate-600">
                    {item.description}
                  </p>

                </div>

              </div>
            ))}

          </div>
        </div>
      </section>


      {/* ======================================================
          COMMITMENT
      ====================================================== */}

      <section className="section-padding bg-gradient-to-b from-white to-[#F8EEE8]">
        <div className="container-custom">

          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* Left */}

            <div>

              <span className="inline-block rounded-full border border-[#F1DDD1] bg-[#F8EEE8] px-5 py-2 font-semibold text-[#874723]">
                Our Commitment
              </span>

              <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 md:text-4xl">
                Focused On Quality Beyond The Product
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                A biomedical product is only one part of a successful
                healthcare solution. We believe that product understanding,
                proper coordination and continued assistance are equally
                important.
              </p>

              <p className="mt-5 leading-8 text-slate-600">
                That is why our approach focuses on creating a complete
                customer experience, from understanding requirements and
                selecting suitable equipment to providing assistance after
                the product reaches the customer.
              </p>

            </div>


            {/* Right */}

            <div className="rounded-[35px] border border-[#F1DDD1] bg-white p-8 shadow-xl shadow-[#F1DDD1] md:p-10">

              <div className="space-y-6">

                <div className="flex items-start gap-5">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1DDD1] text-[#874723]">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Reliable Products
                    </h4>

                    <p className="mt-2 leading-7 text-slate-600">
                      Solutions selected with healthcare applications
                      and operational requirements in mind.
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-5">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1DDD1] text-[#874723]">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Professional Communication
                    </h4>

                    <p className="mt-2 leading-7 text-slate-600">
                      Clear coordination throughout the product and
                      service journey.
                    </p>
                  </div>

                </div>


                <div className="flex items-start gap-5">

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F1DDD1] text-[#874723]">
                    ✓
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900">
                      Customer-Centric Support
                    </h4>

                    <p className="mt-2 leading-7 text-slate-600">
                      Continued assistance designed to help customers
                      get practical value from their equipment.
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>


      {/* ======================================================
          FINAL ABOUT CTA
      ====================================================== */}

      <section className="section-padding bg-white">
        <div className="container-custom">

          <div className="rounded-[40px] border border-[#F1DDD1] bg-gradient-to-br from-[#F8EEE8] via-white to-[#F8EEE8] p-8 text-center shadow-lg shadow-[#F1DDD1] md:p-14">

            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Building Better Biomedical Connections
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              With a focus on quality, technology and professional support,
              Raj Biosis works to connect healthcare organizations with
              dependable biomedical and diagnostic solutions.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Quality
              </span>

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Innovation
              </span>

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Reliability
              </span>

              <span className="rounded-full bg-white px-5 py-3 font-semibold text-[#874723] shadow-sm ring-1 ring-[#F1DDD1]">
                Support
              </span>

            </div>

          </div>

        </div>
      </section>
    </>
  );
}