"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

export default function Footer() {
  const [contactInfo, setContactInfo] =
    useState([]);
  const [loading, setLoading] = useState(true);
  const [districtData, setDistrictData] =
    useState(null);

  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "products",
    "contact",
    "items",
  ];

  const district =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  useEffect(() => {
    const loadContact = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicals",
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          setContactInfo(
            snap.data().contactInfo || []
          );
        }

        setLoading(false);
      } catch (err) {
        console.log(err);
        setLoading(false);
      }
    };

    loadContact();
  }, []);

  useEffect(() => {
    const loadDistrict = async () => {
      if (!district) return;

      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "centralbiomedicals",
            "districts",
            district
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
  }, [district]);

  const phone =
    contactInfo.find(
      (x) => x.label === "Phone Number"
    )?.value || "";

  const email =
    contactInfo.find(
      (x) => x.label === "Email Address"
    )?.value || "";

  const address =
    contactInfo.find(
      (x) => x.label === "Office Address"
    )?.value || "";

  const dynamicAddress =
    districtData
      ? `${districtData.district}, ${districtData.state}, India`
      : address;

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };
  if (loading) {
    return (
      <footer className="bg-white border-t border-slate-200">
        <div className="container-custom py-16">

          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="h-8 w-40 bg-slate-200 rounded animate-pulse mb-6" />

                {[...Array(5)].map((_, j) => (
                  <div
                    key={j}
                    className="h-5 bg-slate-200 rounded animate-pulse mb-4"
                  />
                ))}
              </div>
            ))}

          </div>

          <div className="border-t border-slate-200 mt-12 pt-6">
            <div className="h-5 w-72 bg-slate-200 rounded animate-pulse" />
          </div>

        </div>
      </footer>
    );
  }
  return (
    <footer className="bg-gradient-to-b from-white to-green-50 border-t border-green-100">

      <div className="container-custom py-16">

        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-10">

          {/* Company */}

          <div>

            <h2 className="text-2xl font-bold text-green-600">
              Central
              <span className="text-slate-900">
                {" "}Biomedicals
              </span>
            </h2>

            <p className="mt-5 text-slate-600 leading-7">
              Delivering trusted diagnostic
              and biomedical solutions with
              innovation, quality, and
              precision healthcare support.
            </p>

          </div>

          {/* Quick Links */}

          <div>

            <h3 className="text-lg font-semibold text-slate-900 mb-5">
              Quick Links
            </h3>

            <div className="flex flex-col gap-3">

              {[
                {
                  name: "Home",
                  link: "/",
                },
                {
                  name: "About",
                  link: "/about",
                },
                {
                  name: "Services",
                  link: "/services",
                },
                {
                  name: "Products",
                  link: "/items",
                },
                {
                  name: "Contact",
                  link: "/contact",
                },
              ].map((item) => (

                <Link
                  key={item.name}
                  href={makeLink(item.link)}
                  className="text-slate-600 transition hover:text-green-600 hover:translate-x-1"
                >
                  {item.name}
                </Link>

              ))}

            </div>

          </div>

          {/* Services */}

          <div>

            <h3 className="text-lg font-semibold text-slate-900 mb-5">
              Services
            </h3>

            <div className="space-y-3 text-slate-600">

              <p className="hover:text-green-600 transition">
                Diagnostic Equipment
              </p>

              <p className="hover:text-green-600 transition">
                Laboratory Solutions
              </p>

              <p className="hover:text-green-600 transition">
                Biomedical Instruments
              </p>

              <p className="hover:text-green-600 transition">
                Maintenance Support
              </p>

            </div>

          </div>

          {/* Contact */}

          <div>

            <h3 className="text-lg font-semibold text-slate-900 mb-5">
              Contact Info
            </h3>

            <div className="space-y-5 text-slate-600">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">

                  <MapPin
                    size={18}
                    className="text-green-600"
                  />

                </div>

                <p className="leading-6">

                  {dynamicAddress}

                </p>

              </div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">

                  <Phone
                    size={18}
                    className="text-green-600"
                  />

                </div>

                <p>{phone}</p>

              </div>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">

                  <Mail
                    size={18}
                    className="text-green-600"
                  />

                </div>

                <p>{email}</p>

              </div>

            </div>

          </div>

        </div>

        {/* Bottom */}

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-green-100 pt-8 text-sm text-slate-500 md:flex-row">

          <p>
            © 2026 Central Biomedicals. All rights reserved.
          </p>

          <p>
            Designed with ❤️ for modern diagnostics.
          </p>

        </div>

      </div>

    </footer>
  );
}