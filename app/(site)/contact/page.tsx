import { ContactForm } from "@/components/contact-form";
import { WaveDivider } from "@/components/wave-divider";

export const metadata = {
  title: "Contact",
  description:
    "Project inquiries for audiobook narration with Reinita Larue.",
};

export default function ContactPage() {
  return (
    <>
      <section className="pt-40 pb-12">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          <p className="enter enter-1 eyebrow">Contact</p>
          <h1 className="enter enter-2 font-display-italic mt-6 text-[clamp(3rem,6vw+1rem,5rem)] leading-[1] text-abyss max-w-[16ch]">
            Tell me about the book.
          </h1>
          <p className="enter enter-3 mt-8 max-w-xl text-lg text-ink-soft">
            The more I know up front, the more useful my first reply can be —
            word count, royalty or PFH, deadline, and a sample of the
            manuscript if you can share one.
          </p>
        </div>
      </section>

      <section className="pb-section">
        <div data-reveal className="mx-auto max-w-[820px] px-6 lg:px-12">
          <ContactForm />
        </div>
      </section>

      <WaveDivider />

      <section className="py-section">
        <div className="mx-auto max-w-[820px] px-6 lg:px-12 text-center">
          <p data-reveal className="eyebrow">Or, the old-fashioned way</p>
          <a
            href="mailto:rlnarration@gmail.com"
            data-reveal
            style={{ "--enter-delay": "120ms" } as React.CSSProperties}
            className="mt-6 inline-block font-display-italic text-3xl lg:text-4xl link-soft text-abyss"
          >
            rlnarration@gmail.com
          </a>
        </div>
      </section>
    </>
  );
}
