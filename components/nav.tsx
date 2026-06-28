"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/demos", label: "Demos" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const clickCount = useRef(0);
  const lastClickTime = useRef(0);

  // Secret admin entrance: five logo clicks within 2 seconds.
  // Single clicks behave normally and navigate to /.
  const handleLogoClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime.current > 2000) {
      clickCount.current = 1;
    } else {
      clickCount.current += 1;
    }
    lastClickTime.current = now;

    if (clickCount.current >= 5) {
      e.preventDefault();
      clickCount.current = 0;
      router.push("/admin");
    }
  };

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-5 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Reinita Larue, home"
          onClick={handleLogoClick}
          className="block relative w-[100px] h-[64px] -ml-2"
        >
          <Image
            src="/logo.png"
            alt="Reinita Larue"
            fill
            priority
            sizes="100px"
            className="object-contain object-left"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-10" aria-label="Primary">
          {links.slice(1).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-soft text-sm font-medium tracking-wide"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex flex-col gap-[5px] p-2 -mr-2"
        >
          <span
            className={`block h-px w-5 bg-abyss transition-transform ${open ? "translate-y-[6px] rotate-45" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-abyss transition-opacity ${open ? "opacity-0" : ""}`}
          />
          <span
            className={`block h-px w-5 bg-abyss transition-transform ${open ? "-translate-y-[6px] -rotate-45" : ""}`}
          />
        </button>
      </div>

      {/* Mobile nav panel */}
      {open && (
        <nav
          id="mobile-nav"
          className="md:hidden bg-shore border-t border-mist"
          aria-label="Primary mobile"
        >
          <ul className="px-6 py-6 flex flex-col gap-5">
            {links.slice(1).map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-display-italic text-3xl text-abyss"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
