"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const staticRoutes = [
    "about",
    "services",
    "items",
    "contact",
  ];

  const district =
    pathParts.length > 0 &&
      !staticRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  const makeLink = (path) => {
    if (!district) return path;

    if (path === "/") {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Services", path: "/services" },
    { name: "Products", path: "/items" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[#F1DDD1] bg-white/90 backdrop-blur-xl shadow-sm">

      <div className="container-custom flex h-20 items-center justify-between">

        {/* Logo */}

        <Link href={makeLink("/")}>
          <Image
            src="/logo.png"
            alt="Raj Biosis"
            width={90}
            height={35}
            priority
            className="h-auto w-[70px] md:w-[90px] object-contain"
          />
        </Link>
        {/* Desktop Menu */}

        <nav className="hidden items-center gap-8 lg:flex">

          {navLinks.map((link) => (

            <Link
              key={link.name}
              href={makeLink(link.path)}
              className="relative font-medium text-slate-700 transition duration-300 hover:text-[#A45F35] after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-[#A45F35] after:transition-all hover:after:w-full"
            >
              {link.name}
            </Link>

          ))}

        </nav>

        {/* Desktop Button */}

        <div className="hidden lg:block">

          <Link href={makeLink("/contact")}>

            <button className="rounded-xl bg-[#A45F35] px-6 py-3 font-semibold text-white transition hover:bg-[#874723] hover:shadow-lg hover:shadow-[#E8C8B6]">

              Get Quote

            </button>

          </Link>

        </div>

        {/* Mobile Button */}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl border border-[#F1DDD1] p-2 transition hover:bg-[#F8EEE8] lg:hidden"
        >

          {menuOpen ? (
            <X
              size={26}
              className="text-[#A45F35]"
            />
          ) : (
            <Menu
              size={26}
              className="text-[#A45F35]"
            />
          )}

        </button>

      </div>

      {/* Mobile Menu */}

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[500px]" : "max-h-0"
          }`}
      >

        <div className="border-t border-[#F1DDD1] bg-white px-6 py-6">

          <nav className="flex flex-col gap-5">

            {navLinks.map((link) => (

              <Link
                key={link.name}
                href={makeLink(link.path)}
                onClick={() => setMenuOpen(false)}
                className="font-medium text-slate-700 transition hover:text-[#A45F35]"
              >

                {link.name}

              </Link>

            ))}

            <Link
              href={makeLink("/contact")}
              onClick={() => setMenuOpen(false)}
            >

              <button className="mt-2 w-full rounded-xl bg-[#A45F35] py-3 font-semibold text-white transition hover:bg-[#874723]">

                Get Quote

              </button>

            </Link>

          </nav>

        </div>

      </div>

    </header>
  );
}