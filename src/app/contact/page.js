"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  addDoc,
  collection,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import toast from "react-hot-toast";

import {
  Mail,
  Phone,
  MapPin,
  Clock3,
} from "lucide-react";

import PageBanner from "@/components/PageBanner";
// import CTASection from "@/components/CTASection";

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
    pathParts.length > 0
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
  // FORM SUBMIT
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

    if (!emailRegex.test(form.email)) {
      return toast.error("Enter valid email");
    }

    if (!phoneRegex.test(form.phone)) {
      return toast.error(
        "Enter valid mobile number"
      );
    }

    if (!form.message.trim()) {
      return toast.error(
        "Message is required"
      );
    }

    try {
      setSubmitting(true);

      await addDoc(
        collection(
          db,
          "websitesQueries",
          "globalhealthkartcom",
          "contactQueries"
        ),
        {
          ...form,
          createdAt: new Date(),
        }
      );

      toast.success(
        "Message submitted successfully"
      );

      setForm({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

    } catch (err) {
      console.error(err);

      toast.error(
        "Something went wrong"
      );

    } finally {
      setSubmitting(false);
    }
  };


  // ==========================================================
  // LOAD DISTRICT
  // ==========================================================

  useEffect(() => {
    const loadDistrict = async () => {
      if (!currentDistrict) return;

      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "globalhealthkartcom",
            "districts",
            currentDistrict
          )
        );

        if (snap.exists()) {
          setDistrictData(snap.data());
        }

      } catch (err) {
        console.log(err);
      }
    };

    loadDistrict();
  }, [currentDistrict]);


  // ==========================================================
  // LOAD CONTACT
  // ==========================================================

  useEffect(() => {
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
          setContactInfo(
            snap.data().contactInfo || []
          );
        }

      } catch (err) {
        console.log(err);

      } finally {
        setLoading(false);
      }
    };

    loadContact();
  }, []);


  // ==========================================================
  // CONTACT DATA
  // ==========================================================

  const phone =
    contactInfo.find(
      (x) => x.label === "Phone Number"
    )?.value ||
    "+91 9983123469\n+91 9983333489";

  const email =
    contactInfo.find(
      (x) => x.label === "Email Address"
    )?.value ||
    "rajbiosis@yahoo.in";

  const address =
    contactInfo.find(
      (x) => x.label === "Office Address"
    )?.value ||
    "F-4, 1st Floor, Plot No. 16, D-Block Tagor Nagar, on Ajmer-Delhi, 200 Feet Bypass Rd, Jaipur, Rajasthan 302021";

  const hours =
    contactInfo.find(
      (x) => x.label === "Working Hours"
    )?.value ||
    "Mon - Sat (10AM - 6PM)";

  const dynamicAddress =
    districtData
      ? `${districtData.district}, ${districtData.state}, India`
      : address;

  const phoneNumbers = phone
    ? phone
      .split(/[\n,]+/)
      .map((num) => num.trim())
      .filter(Boolean)
    : [];

  const mapAddress =
    encodeURIComponent(dynamicAddress);


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <section className="section-padding bg-white">
        <div className="container-custom">

          <div className="grid lg:grid-cols-2 gap-12">

            <div>
              <div className="
                h-12
                w-64
                bg-slate-200
                rounded
                animate-pulse
                mb-8
              " />

              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="
                    h-28
                    bg-slate-200
                    rounded-3xl
                    animate-pulse
                    mb-6
                  "
                />
              ))}
            </div>

            <div className="
              bg-white
              p-10
              rounded-3xl
              border
              border-[#E8C8B6]
            ">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="
                    h-14
                    bg-slate-200
                    rounded-2xl
                    animate-pulse
                    mb-5
                  "
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

      <section className="
        section-padding
        bg-white
      ">

        <div className="
          container-custom
          grid
          lg:grid-cols-2
          gap-14
        ">

          {/* ==================================================
              LEFT INFO
          ================================================== */}

          <div>

            {/* Badge */}

            <span className="
              inline-block
              bg-gradient-to-r
              from-[#F8EEE8]
              via-[#F8EEE8]
              to-[#F8EEE8]
              border
              border-[#E8C8B6]
              text-[#874723]
              px-5
              py-2
              rounded-full
              font-semibold
              mb-5
            ">
              Contact Information
            </span>


            {/* Heading */}

            <h2 className="
              section-title
              text-[#3B2118]
            ">
              Let’s Start a Conversation
            </h2>


            {/* Description */}

            <p className="
              section-subtitle
              text-[#874723]
            ">
              Reach out to us for
              healthcare consultation,
              biomedical products, and
              advanced diagnostic support.
            </p>


            {/* ==================================================
                CONTACT CARDS
            ================================================== */}

            <div className="
              space-y-6
              mt-10
            ">

              {/* Phone */}

              <div className="
                flex
                items-start
                gap-5
                bg-[#F8EEE8]
                p-6
                rounded-[28px]
                border
                border-[#E8C8B6]
                hover:border-[#9A5632]
                hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)]
                transition-all
                duration-300
              ">

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#874723]
                  via-[#A45F35]
                  to-[#9A5632]
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-md
                  shadow-[#A45F35]/20
                ">
                  <Phone size={24} />
                </div>

                <div>

                  <h4 className="
                    font-semibold
                    text-lg
                    text-[#3B2118]
                  ">
                    Phone Number
                  </h4>

                  <div className="
                    space-y-1
                    mt-2
                  ">

                    {phoneNumbers.map(
                      (num, i) => (
                        <p
                          key={i}
                          className="
                            text-[#874723]
                          "
                        >
                          <a
                            href={`tel:${num}`}
                            className="
                              hover:text-[#A45F35]
                              transition
                            "
                          >
                            {num}
                          </a>
                        </p>
                      )
                    )}

                  </div>

                </div>

              </div>


              {/* Email */}

              <div className="
                flex
                items-start
                gap-5
                bg-[#F8EEE8]
                p-6
                rounded-[28px]
                border
                border-[#E8C8B6]
                hover:border-[#9A5632]
                hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)]
                transition-all
                duration-300
              ">

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#874723]
                  via-[#A45F35]
                  to-[#9A5632]
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-md
                  shadow-[#A45F35]/20
                ">
                  <Mail size={24} />
                </div>

                <div>

                  <h4 className="
                    font-semibold
                    text-lg
                    text-[#3B2118]
                  ">
                    Email Address
                  </h4>

                  <p className="
                    text-[#874723]
                    mt-2
                    break-all
                  ">
                    {email}
                  </p>

                </div>

              </div>


              {/* Address */}

              <div className="
                flex
                items-start
                gap-5
                bg-[#F8EEE8]
                p-6
                rounded-[28px]
                border
                border-[#E8C8B6]
                hover:border-[#9A5632]
                hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)]
                transition-all
                duration-300
              ">

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#874723]
                  via-[#A45F35]
                  to-[#9A5632]
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-md
                  shadow-[#A45F35]/20
                ">
                  <MapPin size={24} />
                </div>

                <div>

                  <h4 className="
                    font-semibold
                    text-lg
                    text-[#3B2118]
                  ">
                    Office Address
                  </h4>

                  <p className="
                    text-[#874723]
                    mt-2
                    leading-7
                  ">
                    {dynamicAddress}
                  </p>

                </div>

              </div>


              {/* Working Hours */}

              <div className="
                flex
                items-start
                gap-5
                bg-[#F8EEE8]
                p-6
                rounded-[28px]
                border
                border-[#E8C8B6]
                hover:border-[#9A5632]
                hover:shadow-[0_15px_40px_rgba(82,88,39,0.12)]
                transition-all
                duration-300
              ">

                <div className="
                  w-14
                  h-14
                  shrink-0
                  rounded-2xl
                  bg-gradient-to-br
                  from-[#874723]
                  via-[#A45F35]
                  to-[#9A5632]
                  flex
                  items-center
                  justify-center
                  text-white
                  shadow-md
                  shadow-[#A45F35]/20
                ">
                  <Clock3 size={24} />
                </div>

                <div>

                  <h4 className="
                    font-semibold
                    text-lg
                    text-[#3B2118]
                  ">
                    Working Hours
                  </h4>

                  <p className="
                    text-[#874723]
                    mt-2
                  ">
                    {hours}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              RIGHT FORM
          ================================================== */}

          <div className="
            bg-white
            rounded-[40px]
            p-8
            lg:p-10
            border
            border-[#E8C8B6]
            shadow-[0_20px_60px_rgba(82,88,39,0.12)]
          ">

            <h3 className="
              text-3xl
              font-bold
              text-[#3B2118]
            ">
              Send Us Message
            </h3>

            <p className="
              text-[#874723]
              mt-3
            ">
              Fill out the form and our
              team will contact you soon.
            </p>


            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="
                mt-8
                space-y-5
              "
            >

              {/* Name */}

              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={form.name}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-[#E8C8B6]
                  bg-[#FCF8F5]
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  text-[#3B2118]
                  placeholder:text-[#8A6B5A]
                  focus:border-[#A45F35]
                  focus:ring-2
                  focus:ring-[#A45F35]/15
                  transition
                "
              />


              {/* Email */}

              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={form.email}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-[#E8C8B6]
                  bg-[#FCF8F5]
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  text-[#3B2118]
                  placeholder:text-[#8A6B5A]
                  focus:border-[#A45F35]
                  focus:ring-2
                  focus:ring-[#A45F35]/15
                  transition
                "
              />


              {/* Phone */}

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                maxLength={10}
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(
                      /\D/g,
                      ""
                    ),
                  })
                }
                className="
                  w-full
                  border
                  border-[#E8C8B6]
                  bg-[#FCF8F5]
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  text-[#3B2118]
                  placeholder:text-[#8A6B5A]
                  focus:border-[#A45F35]
                  focus:ring-2
                  focus:ring-[#A45F35]/15
                  transition
                "
              />


              {/* Subject */}

              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-[#E8C8B6]
                  bg-[#FCF8F5]
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  text-[#3B2118]
                  placeholder:text-[#8A6B5A]
                  focus:border-[#A45F35]
                  focus:ring-2
                  focus:ring-[#A45F35]/15
                  transition
                "
              />


              {/* Message */}

              <textarea
                rows={5}
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="
                  w-full
                  border
                  border-[#E8C8B6]
                  bg-[#FCF8F5]
                  rounded-2xl
                  px-5
                  py-4
                  outline-none
                  text-[#3B2118]
                  placeholder:text-[#8A6B5A]
                  focus:border-[#A45F35]
                  focus:ring-2
                  focus:ring-[#A45F35]/15
                  transition
                  resize-none
                "
              />


              {/* Submit */}

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  bg-[#A45F35]
                  text-white
                  hover:text-white
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
                  disabled:cursor-not-allowed
                  disabled:hover:translate-y-0
                "
              >
                {submitting
                  ? "Submitting..."
                  : "Send Message"}
              </button>

            </form>

          </div>

        </div>

      </section>


      {/* ======================================================
          GOOGLE MAP
      ====================================================== */}

      <section className="
        pb-24
        bg-white
      ">

        <div className="container-custom">

          <div className="
            rounded-[40px]
            overflow-hidden
            border
            border-[#E8C8B6]
            shadow-lg
            shadow-[#A45F35]/10
          ">

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


      {/* ======================================================
          CTA
      ====================================================== */}

      {/* <CTASection /> */}

    </>
  );
}