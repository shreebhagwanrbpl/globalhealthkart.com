"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
import { fetchContactData, fetchDistrictData } from "@/lib/data-fetcher";
import { parseContactInfo } from "@/lib/contact-parser";

export default function ContactPage() {
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] = useState(null);
  const [contactInfo, setContactInfo] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const pathname = usePathname();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const pathParts =
    pathname?.split("/").filter(Boolean) || [];

  const currentDistrict =
    pathParts.length > 0 &&
    !["about", "services", "products", "contact", "items", "api"].includes(pathParts[0])
      ? pathParts[0]
      : null;

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // ==========================================================
  // FORM SUBMIT VIA INTERNAL API
  // ==========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const phoneRegex =
      /^[6-9]\d{9}$/;

    if (!form.name.trim()) {
      return toast.error("Name is required");
    }

    if (!emailRegex.test(form.email.trim())) {
      return toast.error("Enter valid email");
    }

    if (!phoneRegex.test(form.phone.trim())) {
      return toast.error("Enter valid 10-digit mobile number");
    }

    if (!form.message.trim()) {
      return toast.error("Message is required");
    }

    try {
      setSubmitting(true);

      const response = await fetch("/api/contact-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      toast.success("Message submitted successfully");

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("[ContactPage] Submission error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================================
  // LOAD DISTRICT & CONTACT DATA FROM ADMIN API
  // ==========================================================

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        if (currentDistrict) {
          try {
            const distData = await fetchDistrictData(currentDistrict);
            if (isMounted && distData) {
              setDistrictData(distData);
            }
          } catch (dErr) {
            console.error("Error loading district data:", dErr);
          }
        }

        const contactData = await fetchContactData();
        if (isMounted && Array.isArray(contactData)) {
          setContactInfo(contactData);
        }
      } catch (err) {
        console.error("Error loading contact info:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [currentDistrict]);

  // ==========================================================
  // PARSE DYNAMIC CONTACT DATA (ZERO STATIC FALLBACK)
  // ==========================================================

  const { phones, emails, address: rawAddress } = parseContactInfo(contactInfo);

  const workingHoursItem = contactInfo.find((item) => {
    const l = (item?.label || "").toLowerCase();
    return l.includes("hour") || l.includes("timing") || l.includes("working");
  });

  const hours = workingHoursItem
    ? Array.isArray(workingHoursItem.value)
      ? workingHoursItem.value.join(", ")
      : typeof workingHoursItem.value === "string"
      ? workingHoursItem.value.trim()
      : ""
    : "";

  const dynamicAddress = districtData
    ? `${districtData.district}, ${districtData.state}, India`
    : rawAddress;

  const mapAddress = encodeURIComponent(dynamicAddress || "Jaipur, Rajasthan, India");

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12">
            <div>
              <div className="h-12 w-64 bg-slate-200 rounded animate-pulse mb-8" />
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-200 rounded-3xl animate-pulse mb-6"
                />
              ))}
            </div>

            <div className="bg-white p-10 rounded-3xl border border-[#E8C8B6]">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 bg-slate-200 rounded-2xl animate-pulse mb-5"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* ======================================================
          BANNER
      ====================================================== */}
      <PageBanner
        title="Contact Us"
        subtitle="Get in touch with Raj Biosis for premium diagnostic and biomedical solutions."
      />

      {/* ======================================================
          CONTACT SECTION
      ====================================================== */}
      <section className="section-padding bg-white">
        <div className="container-custom grid lg:grid-cols-2 gap-14">
          {/* ==================================================
              LEFT INFO
          ================================================== */}
          <div>
            {/* Badge */}
            <span className="inline-block bg-gradient-to-r from-[#F8EEE8] via-[#F8EEE8] to-[#F8EEE8] border border-[#E8C8B6] text-[#874723] px-5 py-2 rounded-full font-semibold mb-5">
              Contact Information
            </span>

            {/* Heading */}
            <h2 className="section-title text-[#3B2118]">
              Let’s Start a Conversation
            </h2>

            {/* Description */}
            <p className="section-subtitle text-[#874723]">
              Reach out to us for healthcare consultation, biomedical products, and advanced diagnostic support.
            </p>

            {/* ==================================================
                CONTACT CARDS
            ================================================== */}
            <div className="space-y-6 mt-10">
              {/* Phone */}
              {phones.length > 0 && (
                <div className="flex items-start gap-5 bg-[#F8EEE8] p-6 rounded-[28px] border border-[#E8C8B6] hover:border-[#9A5632] hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)] transition-all duration-300">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#874723] via-[#A45F35] to-[#9A5632] flex items-center justify-center text-white shadow-md shadow-[#A45F35]/20">
                    <Phone size={24} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg text-[#3B2118]">
                      Phone Number
                    </h4>

                    <div className="space-y-1 mt-2">
                      {phones.map((num, i) => (
                        <p key={i} className="text-[#874723]">
                          <a
                            href={`tel:${String(num).replace(/\s+/g, "")}`}
                            className="hover:text-[#A45F35] transition"
                          >
                            {num}
                          </a>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Email */}
              {emails.length > 0 && (
                <div className="flex items-start gap-5 bg-[#F8EEE8] p-6 rounded-[28px] border border-[#E8C8B6] hover:border-[#9A5632] hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)] transition-all duration-300">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#874723] via-[#A45F35] to-[#9A5632] flex items-center justify-center text-white shadow-md shadow-[#A45F35]/20">
                    <Mail size={24} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg text-[#3B2118]">
                      Email Address
                    </h4>

                    <div className="space-y-1 mt-2">
                      {emails.map((em, i) => (
                        <p key={i} className="text-[#874723]">
                          <a
                            href={`mailto:${em}`}
                            className="hover:text-[#A45F35] transition break-all"
                          >
                            {em}
                          </a>
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Address */}
              {dynamicAddress && (
                <div className="flex items-start gap-5 bg-[#F8EEE8] p-6 rounded-[28px] border border-[#E8C8B6] hover:border-[#9A5632] hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)] transition-all duration-300">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#874723] via-[#A45F35] to-[#9A5632] flex items-center justify-center text-white shadow-md shadow-[#A45F35]/20">
                    <MapPin size={24} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg text-[#3B2118]">
                      Office Address
                    </h4>

                    <p className="text-[#874723] mt-2 leading-7">
                      {dynamicAddress}
                    </p>
                  </div>
                </div>
              )}

              {/* Working Hours */}
              {hours && (
                <div className="flex items-start gap-5 bg-[#F8EEE8] p-6 rounded-[28px] border border-[#E8C8B6] hover:border-[#9A5632] hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)] transition-all duration-300">
                  <div className="w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br from-[#874723] via-[#A45F35] to-[#9A5632] flex items-center justify-center text-white shadow-md shadow-[#A45F35]/20">
                    <Clock3 size={24} />
                  </div>

                  <div>
                    <h4 className="font-semibold text-lg text-[#3B2118]">
                      Working Hours
                    </h4>

                    <p className="text-[#874723] mt-2">
                      {hours}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ==================================================
              RIGHT FORM
          ================================================== */}
          <div className="bg-white rounded-[40px] p-8 lg:p-10 border border-[#E8C8B6] shadow-[0_20px_60px_rgba(82,88,39,0.12)]">
            <h3 className="text-3xl font-bold text-[#3B2118]">
              Send Us Message
            </h3>

            <p className="text-[#874723] mt-3">
              Fill out the form and our team will contact you soon.
            </p>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {/* Name */}
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                required
                value={form.name}
                onChange={handleChange}
                className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
              />

              {/* Email */}
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                required
                value={form.email}
                onChange={handleChange}
                className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
              />

              {/* Phone */}
              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                maxLength={10}
                required
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
              />

              {/* Subject */}
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
              />

              {/* Message */}
              <textarea
                rows={5}
                name="message"
                placeholder="Your Message"
                required
                value={form.message}
                onChange={handleChange}
                className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition resize-none"
              />

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#A45F35] text-white hover:text-white py-4 rounded-2xl font-semibold shadow-lg shadow-[#A45F35]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#A45F35]/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {submitting ? "Submitting..." : "Send Message"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ======================================================
          GOOGLE MAP
      ====================================================== */}
      {dynamicAddress && (
        <section className="pb-24 bg-white">
          <div className="container-custom">
            <div className="rounded-[40px] overflow-hidden border border-[#E8C8B6] shadow-lg shadow-[#A45F35]/10">
              <iframe
                src={`https://maps.google.com/maps?q=${mapAddress}&z=13&output=embed`}
                width="100%"
                height="500"
                loading="lazy"
                className="border-0 w-full"
              ></iframe>
            </div>
          </div>
        </section>
      )}
    </>
  );
}