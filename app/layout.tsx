import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { ScrollReveal } from "@/components/scroll-reveal";
import { AudioSync } from "@/components/audio-sync";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  axes: ["SOFT", "WONK", "opsz"],
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: {
    default: "Reinita Larue — audiobook narrator",
    template: "%s · Reinita Larue",
  },
  description:
    "Audiobook narrator voicing romance, fantasy, paranormal, and children's fiction. Ear-hole reader turned ear-hole giver.",
  openGraph: {
    title: "Reinita Larue — audiobook narrator",
    description:
      "Audiobook narrator voicing romance, fantasy, paranormal, and children's fiction.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reinita Larue — audiobook narrator",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${manrope.variable}`}>
      <body>
        <ScrollReveal />
        <AudioSync />
        {children}
      </body>
    </html>
  );
}
