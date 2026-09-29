"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function ContactForm({
  title = "Send Us a Message",
  subtitle = "Fill out the form and our team will contact you soon.",
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!form.name.trim()) {
      return toast.error("Please enter your full name.");
    }
    if (!form.phone.trim()) {
      return toast.error("Please enter your mobile number.");
    }
    if (!phoneRegex.test(form.phone.trim())) {
      return toast.error("Please enter a valid 10-digit mobile number.");
    }
    if (!form.email.trim()) {
      return toast.error("Please enter your email address.");
    }
    if (!emailRegex.test(form.email.trim())) {
      return toast.error("Please enter a valid email address.");
    }
    if (!form.message.trim()) {
      return toast.error("Please type your inquiry message.");
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
        throw new Error(`Server returned ${response.status}`);
      }

      toast.success("Your inquiry has been submitted successfully.");

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (err) {
      console.error("Error submitting contact inquiry:", err);
      toast.error("Failed to submit message. Please try again or call directly.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[40px] p-8 lg:p-10 border border-[#E8C8B6] shadow-[0_20px_60px_rgba(82,88,39,0.12)]">
      <h3 className="text-3xl font-bold text-[#3B2118]">
        {title}
      </h3>

      <p className="text-[#874723] mt-3">
        {subtitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          required
          value={form.name}
          onChange={handleChange}
          className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
        />

        <input
          type="email"
          name="email"
          placeholder="Email Address"
          required
          value={form.email}
          onChange={handleChange}
          className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
        />

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

        <input
          type="text"
          name="subject"
          placeholder="Subject"
          value={form.subject}
          onChange={handleChange}
          className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition"
        />

        <textarea
          rows={5}
          name="message"
          placeholder="Your Message"
          required
          value={form.message}
          onChange={handleChange}
          className="w-full border border-[#E8C8B6] bg-[#FCF8F5] rounded-2xl px-5 py-4 outline-none text-[#3B2118] placeholder:text-[#8A6B5A] focus:border-[#A45F35] focus:ring-2 focus:ring-[#A45F35]/15 transition resize-none"
        />

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-[#A45F35] text-white hover:text-white py-4 rounded-2xl font-semibold shadow-lg shadow-[#A45F35]/20 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#A45F35]/25 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {submitting ? "Submitting..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
