import Link from "next/link";

const socials = [
  {
    label: "ACX",
    href: "https://www.acx.com/narrator?p=A3CTL3TKTPB17C",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/reinitabear/",
  },
  {
    label: "TikTok",
    href: "https://www.tiktok.com/@reinitabear",
  },
];

export function Footer() {
  return (
    <footer className="section-dark">
      <div className="mx-auto max-w-[1280px] px-6 lg:px-12 py-20">
        <div className="grid gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <p className="eyebrow">Reinita Larue</p>
            <p className="mt-4 max-w-sm text-mist/80">
              Audiobook narrator voicing romance, fantasy, paranormal, and
              children's fiction from a treated home studio.
            </p>
          </div>

          <div>
            <p className="eyebrow">Elsewhere</p>
            <ul className="mt-4 space-y-2">
              {socials.map((s) => (
                <li key={s.href}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    className="link-soft text-shore"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="eyebrow">Booking</p>
            <a
              href="mailto:rlnarration@gmail.com"
              className="mt-4 inline-block link-soft text-shore"
            >
              rlnarration@gmail.com
            </a>
            <p className="mt-6 text-sm text-mist/70">
              <Link href="/contact" className="link-soft text-mist">
                Send a project inquiry →
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-mist/15 text-xs text-mist/60">
          <p>© {new Date().getFullYear()} Reinita Larue. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
