import Image from "next/image";

import PageBanner from "@/components/PageBanner";
import SectionTitle from "@/components/SectionTitle";
import DDS from "@/components/img/Dds.png";

export default function AboutPage() {
  return (
    <>
      {/* Banner */}
      <PageBanner
        title="About Central Biomedicals"
        subtitle="Delivering trusted diagnostic and biomedical technologies with innovation, quality, and healthcare precision."
      />

      {/* About Section */}
      <section className="section-padding bg-gradient-to-b from-white to-green-50">
        <div className="container-custom grid lg:grid-cols-2 gap-20 items-center">

          {/* Left Image */}
          <div className="relative">

            <div className="flex h-[600px] items-center justify-center overflow-hidden rounded-[40px] border border-green-100 bg-gradient-to-br from-green-50 via-white to-emerald-50 p-10 shadow-xl shadow-green-100">

              <Image
                src={DDS}
                alt="About"
                width={1200}
                height={900}
                className="max-h-full max-w-full object-contain transition duration-500 hover:scale-105"
              />

            </div>

            {/* Floating Experience Card */}

            <div className="absolute bottom-8 left-8 hidden rounded-[28px] border border-green-100 bg-white px-8 py-6 shadow-2xl lg:block">

              <h3 className="text-4xl font-black text-green-600">

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

              At Central Biomedicals, we specialize in providing
              premium biomedical and diagnostic equipment that
              enhances laboratory performance, healthcare accuracy
              and clinical efficiency across hospitals, laboratories
              and healthcare institutions.

            </p>

            <p className="mt-6 leading-8 text-slate-600">

              Our mission is to empower healthcare professionals
              through advanced technology, reliable products and
              dedicated after-sales support while maintaining the
              highest standards of quality and innovation.

            </p>

            {/* Features */}

            <div className="mt-10 grid gap-6 sm:grid-cols-2">

              <div className="rounded-3xl border border-green-100 bg-green-50 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-green-100">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">

                  🏥

                </div>

                <h4 className="text-xl font-bold text-slate-900">

                  Premium Equipment

                </h4>

                <p className="mt-3 leading-7 text-slate-600">

                  High-quality laboratory and diagnostic
                  instruments designed for maximum
                  precision and long-term reliability.

                </p>

              </div>

              <div className="rounded-3xl border border-green-100 bg-green-50 p-6 transition-all duration-300 hover:-translate-y-2 hover:bg-white hover:shadow-xl hover:shadow-green-100">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-2xl">

                  🤝

                </div>

                <h4 className="text-xl font-bold text-slate-900">

                  Expert Support

                </h4>

                <p className="mt-3 leading-7 text-slate-600">

                  Professional consultation, installation,
                  maintenance and dedicated customer
                  support across India.

                </p>

              </div>

            </div>

          </div>

        </div>
      </section>
    </>
  );
}