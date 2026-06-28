import Link from "next/link";
import Image from "next/image";
import { WaveDivider } from "@/components/wave-divider";
import { NewsletterForm } from "@/components/newsletter-form";
import { DemoCard, type Demo } from "@/components/demo-card";
import { createServerSupabaseClient } from "@/lib/supabase";

// Re-fetch on every request so newly published demos appear immediately
// rather than waiting for a build or a cache TTL.
export const dynamic = "force-dynamic";

async function getFeaturedDemos(): Promise<Demo[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("demos")
      .select("*")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(3);
    if (error) {
      console.error("Featured demos query error:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Featured demos fetch failed:", err);
    return [];
  }
}

export default async function HomePage() {
  const featuredDemos = await getFeaturedDemos();
  return (
    <>
      {/* ─── Hero ───────────────────────────────────────────── */}
      <section className="relative pt-28 pb-20 lg:pt-32">
        <div className="mx-auto max-w-[1320px] px-6 lg:px-12">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:gap-16 items-center">
            {/* Photo column — landscape orientation, softened corners */}
            <div className="enter enter-1 relative aspect-[3/2] w-full overflow-hidden rounded-[2.5rem]">
              <Image
                src="/portrait.jpg"
                alt="Reinita Larue, audiobook narrator, photographed on the coast"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 760px"
                className="object-cover object-center"
              />
            </div>

            {/* Type column */}
            <div className="lg:pl-4">
              <p className="enter enter-2 eyebrow">Audiobook narrator</p>
              <div className="enter enter-3 mt-6">
                <h1 className="font-display-italic text-[clamp(3rem,7vw+1rem,5.5rem)] leading-[0.95] text-abyss">
                  Reinita
                  <br />
                  Larue
                </h1>
                <p className="mt-3 text-base text-driftwood italic">
                  Ray-nee-tuh Luh-roo
                </p>
              </div>
              <p className="enter enter-4 mt-7 font-display-italic text-2xl lg:text-[1.7rem] leading-tight text-tide">
                Romance · Fantasy · Paranormal · Children's fiction
              </p>
              <p className="enter enter-5 mt-5 max-w-md text-base lg:text-lg text-ink-soft">
                Human performances from a treated home studio.
              </p>
              <div
                className="enter enter-6 mt-10 flex flex-wrap gap-x-7 gap-y-3 items-center"
              >
                <Link
                  href="/demos"
                  className="lift-btn bg-abyss text-shore px-8 py-3.5 text-sm font-medium tracking-wide rounded-full hover:bg-tide"
                >
                  Listen to demos →
                </Link>
                <Link
                  href="/contact"
                  className="link-soft text-sm font-medium tracking-wide"
                >
                  Book a project
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Intro / pull quote ─────────────────────────────── */}
      <section className="py-section">
        <div className="mx-auto max-w-[820px] px-6 lg:px-12 text-center">
          <p data-reveal className="eyebrow">A few words</p>
          <blockquote
            data-reveal
            style={{ "--enter-delay": "100ms" } as React.CSSProperties}
            className="mt-8 font-display-italic text-[clamp(2rem,4vw+1rem,3.5rem)] leading-[1.1] text-abyss"
          >
            "As an avid ear-hole reader myself, I strive to make every
            listener's reading experience an immersive and captivating one."
          </blockquote>
          <p
            data-reveal
            style={{ "--enter-delay": "200ms" } as React.CSSProperties}
            className="mt-10 max-w-xl mx-auto text-ink-soft"
          >
            Audiobooks aren't just entertainment to me — they're how I fall in
            love with stories. I want to give that same feeling back to every
            listener who presses play.
          </p>
          <Link
            href="/about"
            data-reveal
            style={{ "--enter-delay": "300ms" } as React.CSSProperties}
            className="mt-10 inline-block link-soft text-sm font-medium tracking-wide"
          >
            More about Reinita →
          </Link>
        </div>
      </section>

      <WaveDivider />

      {/* ─── Listen (the signature dark section) ───────────── */}
      <section className="section-dark">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12 py-section">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
            <div data-reveal>
              <p className="eyebrow">Listen</p>
              <h2 className="font-display-italic mt-4 text-4xl lg:text-5xl text-shore">
                Press play.
              </h2>
            </div>
            <Link
              href="/demos"
              data-reveal
              style={{ "--enter-delay": "120ms" } as React.CSSProperties}
              className="link-soft text-mist text-sm font-medium tracking-wide self-start md:self-auto"
            >
              All demos →
            </Link>
          </div>

          {featuredDemos.length > 0 ? (
            <div
              data-reveal
              style={{ "--enter-delay": "150ms" } as React.CSSProperties}
              className="space-y-4"
            >
              {featuredDemos.map((demo) => (
                <DemoCard key={demo.id} demo={demo} variant="dark" />
              ))}
            </div>
          ) : (
            /* Empty state — pre-launch placeholder */
            <div
              data-reveal
              style={{ "--enter-delay": "150ms" } as React.CSSProperties}
              className="border border-mist/20 rounded-[2.5rem] p-12 text-center"
            >
              <p className="font-display-italic text-3xl text-shore">
                First demos arriving soon.
              </p>
              <p className="mt-3 text-mist/70 max-w-md mx-auto">
                I'm currently in the booth recording samples across romance,
                fantasy, paranormal, and children's. Subscribe below to know the
                moment they're live.
              </p>
            </div>
          )}

          {featuredDemos.length === 0 && (
            <>
              <WaveDivider variant="dark" className="mt-10" />

              {/* Newsletter — only shown in the pre-launch empty state */}
              <div
                data-reveal
                style={{ "--enter-delay": "100ms" } as React.CSSProperties}
                className="mt-12 max-w-md"
              >
                <NewsletterForm variant="dark" />
                <p className="mt-4 text-xs text-mist/50">
                  No spam. Just demo drops, project news, and the occasional
                  behind-the-glass story.
                </p>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── Studio ─────────────────────────────────────────── */}
      <section className="py-section">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          <div data-reveal className="max-w-2xl">
            <p className="eyebrow">Studio</p>
            <h2 className="font-display-italic mt-4 text-4xl lg:text-5xl text-abyss">
              How I deliver.
            </h2>
          </div>

          <dl className="mt-14 grid gap-y-10 gap-x-12 sm:grid-cols-3">
            <div
              data-reveal
              className="border-t border-mist pt-5"
            >
              <dt className="eyebrow">Equipment</dt>
              <dd className="mt-2 text-ink-soft">
                Shure MV7+ with pop filter, recorded in a treated home studio.
              </dd>
            </div>

            <div
              data-reveal
              style={{ "--enter-delay": "100ms" } as React.CSSProperties}
              className="border-t border-mist pt-5"
            >
              <dt className="eyebrow">Workflow</dt>
              <dd className="mt-2 text-ink-soft">
                Punch-and-roll recording, self-edited in Audacity to
                broadcast-quality delivery.
              </dd>
            </div>

            <div
              data-reveal
              style={{ "--enter-delay": "200ms" } as React.CSSProperties}
              className="border-t border-mist pt-5"
            >
              <dt className="eyebrow">Accents</dt>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-mist bg-shell text-xs text-driftwood tracking-wide">
                    Southern
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-mist bg-shell text-xs text-driftwood tracking-wide">
                    French
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full border border-mist bg-shell text-xs text-driftwood tracking-wide">
                    British
                  </span>
                </div>
            </div>
          </dl>
        </div>
      </section>

      {/* ─── Contact CTA ────────────────────────────────────── */}
      <section className="py-section">
        <div className="mx-auto max-w-[820px] px-6 lg:px-12 text-center">
          <p data-reveal className="eyebrow">Casting a project?</p>
          <h2
            data-reveal
            style={{ "--enter-delay": "100ms" } as React.CSSProperties}
            className="font-display-italic mt-6 text-4xl lg:text-5xl text-abyss"
          >
            Let's talk about your book.
          </h2>
          <p
            data-reveal
            style={{ "--enter-delay": "200ms" } as React.CSSProperties}
            className="mt-6 text-lg text-ink-soft max-w-lg mx-auto"
          >
            Romance, fantasy, paranormal, kids' lit — if your characters need a
            voice that lives inside the story with them, I'd love to hear about
            the project.
          </p>
          <Link
            href="/contact"
            data-reveal
            style={{ "--enter-delay": "300ms" } as React.CSSProperties}
            className="lift-btn mt-10 inline-block bg-abyss text-shore px-9 py-4 text-sm font-medium tracking-wide rounded-full hover:bg-tide"
          >
            Start a project inquiry →
          </Link>
        </div>
      </section>
    </>
  );
}
