"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

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
    <header className="sticky top-0 z-50 border-b border-green-100 bg-white/90 backdrop-blur-xl shadow-sm">

      <div className="container-custom flex h-20 items-center justify-between">

        {/* Logo */}

        <Link href={makeLink("/")}>

          <h1 className="text-2xl font-black tracking-tight">

            <span className="text-green-600">
              Central
            </span>

            <span className="text-slate-900">
              {" "}Biomedicals
            </span>

          </h1>

        </Link>

        {/* Desktop Menu */}

        <nav className="hidden items-center gap-8 lg:flex">

          {navLinks.map((link) => (

            <Link
              key={link.name}
              href={makeLink(link.path)}
              className="relative font-medium text-slate-700 transition duration-300 hover:text-green-600 after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 after:bg-green-600 after:transition-all hover:after:w-full"
            >
              {link.name}
            </Link>

          ))}

        </nav>

        {/* Desktop Button */}

        <div className="hidden lg:block">

          <Link href={makeLink("/contact")}>

            <button className="rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 hover:shadow-lg hover:shadow-green-200">

              Get Quote

            </button>

          </Link>

        </div>

        {/* Mobile Button */}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl border border-green-100 p-2 transition hover:bg-green-50 lg:hidden"
        >

          {menuOpen ? (
            <X
              size={26}
              className="text-green-600"
            />
          ) : (
            <Menu
              size={26}
              className="text-green-600"
            />
          )}

        </button>

      </div>

      {/* Mobile Menu */}

      <div
        className={`overflow-hidden transition-all duration-300 lg:hidden ${menuOpen ? "max-h-[500px]" : "max-h-0"
          }`}
      >

        <div className="border-t border-green-100 bg-white px-6 py-6">

          <nav className="flex flex-col gap-5">

            {navLinks.map((link) => (

              <Link
                key={link.name}
                href={makeLink(link.path)}
                onClick={() => setMenuOpen(false)}
                className="font-medium text-slate-700 transition hover:text-green-600"
              >

                {link.name}

              </Link>

            ))}

            <Link
              href={makeLink("/contact")}
              onClick={() => setMenuOpen(false)}
            >

              <button className="mt-2 w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700">

                Get Quote

              </button>

            </Link>

          </nav>

        </div>

      </div>

    </header>
  );
}