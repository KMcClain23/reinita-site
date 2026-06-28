import Image from "next/image";
import Link from "next/link";
import { WaveDivider } from "@/components/wave-divider";

export const metadata = {
  title: "About",
  description:
    "About Reinita Larue — audiobook narrator, ocean-lover, listener-turned-voice.",
};

export default function AboutPage() {
  return (
    <>
      <section className="pt-40 pb-12">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          <p className="enter enter-1 eyebrow">About</p>
          <h1 className="enter enter-2 font-display-italic mt-6 text-[clamp(3rem,6vw+1rem,5rem)] leading-[1] text-abyss max-w-[14ch]">
            The voice behind the headphones.
          </h1>
        </div>
      </section>

      <section className="pb-section">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          {/* Landscape portrait stretched across the top */}
          <div
            data-reveal
            className="relative aspect-[3/2] w-full overflow-hidden rounded-[2.5rem] mb-16"
          >
            <Image
              src="/portrait.jpg"
              alt="Reinita Larue, photographed on the coast"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1100px"
              className="object-cover object-center"
            />
          </div>

          <div className="max-w-[680px] mx-auto space-y-7 text-lg leading-relaxed text-ink-soft">
              <p data-reveal>
                As an avid ear-hole reader myself, I strive to make every
                listener's reading experience an immersive and captivating
                one. Audiobooks aren't just entertainment to me — they're how
                I fall in love with stories, and I want to give that same
                feeling back to every listener who presses play.
              </p>

              <p
                data-reveal
                style={{ "--enter-delay": "100ms" } as React.CSSProperties}
              >
                {/* TODO: Reinita to fill — why narration? what brought her here? */}
                <span className="italic text-driftwood">
                  [Paragraph 2 — Reinita's story: how she got into narration,
                  what she trained in, what kinds of books she gravitates
                  toward as a listener.]
                </span>
              </p>

              <p
                data-reveal
                style={{ "--enter-delay": "200ms" } as React.CSSProperties}
              >
                I narrate romance, fantasy, paranormal, and children's
                fiction, with a vocal range that spans child to elderly and
                comfort in southern, French, and British accents. I record in
                a treated home studio on a Shure MV7+, work in punch-and-roll
                for clean delivery, and edit my own work to broadcast-ready
                standards.
              </p>

              <p
                data-reveal
                style={{ "--enter-delay": "300ms" } as React.CSSProperties}
              >
                A true Aquarius, I'm happiest near the ocean, deep in a book,
                or imagining what whales and polar bears might be thinking. I
                believe the best stories deserve to be <em>heard</em>.
              </p>
          </div>
        </div>
      </section>

      <WaveDivider />

      {/* Quick facts grid */}
      <section className="py-section">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          <h2 data-reveal className="eyebrow">Quick facts</h2>
          <dl className="mt-10 grid gap-y-10 gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
            <Fact label="Genres" delay={0}>
              Romance, fantasy, paranormal, children's
            </Fact>
            <Fact label="Vocal range" delay={80}>Child to elderly</Fact>
            <Fact label="Accents" delay={160}>Southern, French, British</Fact>
            <Fact label="Studio" delay={240}>
              Shure MV7+ with pop filter, Audacity, treated home booth
            </Fact>
            <Fact label="Workflow" delay={320}>Punch and roll, self-edited</Fact>
            <Fact label="Languages" delay={400}>English (fluent)</Fact>
          </dl>
        </div>
      </section>

      <section className="py-section">
        <div className="mx-auto max-w-[820px] px-6 lg:px-12 text-center">
          <h2
            data-reveal
            className="font-display-italic text-4xl lg:text-5xl text-abyss"
          >
            Have a project in mind?
          </h2>
          <Link
            href="/contact"
            data-reveal
            style={{ "--enter-delay": "150ms" } as React.CSSProperties}
            className="lift-btn mt-10 inline-block bg-abyss text-shore px-9 py-4 text-sm font-medium tracking-wide rounded-full hover:bg-tide"
          >
            Send an inquiry →
          </Link>
        </div>
      </section>
    </>
  );
}

function Fact({
  label,
  children,
  delay = 0,
}: {
  label: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div
      data-reveal
      style={{ "--enter-delay": `${delay}ms` } as React.CSSProperties}
      className="border-t border-mist pt-5"
    >
      <dt className="eyebrow">{label}</dt>
      <dd className="mt-2 text-ink-soft">{children}</dd>
    </div>
  );
}
