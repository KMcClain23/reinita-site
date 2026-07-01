import { createServerSupabaseClient } from "@/lib/supabase";
import { DemoCard, type Demo } from "@/components/demo-card";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata = {
  title: "Demos",
  description:
    "Audiobook narration samples by Reinita Larue across romance, fantasy, paranormal, and children's fiction.",
};

// Re-fetch every 5 minutes
export const revalidate = 300;

async function getDemos(): Promise<Demo[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("demos")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Demos query error:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    // If env isn't configured yet, just render empty state
    console.error("Demos fetch failed:", err);
    return [];
  }
}

export default async function DemosPage() {
  const demos = await getDemos();

  return (
    <>
      <section className="pt-40 pb-16">
        <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
          <p className="enter enter-1 eyebrow">Demos</p>
          <h1 className="enter enter-2 font-display-italic mt-6 text-[clamp(3rem,6vw+1rem,5rem)] leading-[1] text-abyss max-w-[16ch]">
            Press play, fall in.
          </h1>
          <p className="enter enter-3 mt-8 max-w-xl text-lg text-ink-soft">
            Samples across romance, fantasy, paranormal, and children's
            fiction. Looking for something specific? <a href="/contact" className="link-soft">Ask for a custom audition.</a>
          </p>
        </div>
      </section>

      {demos.length === 0 ? (
        <section className="pb-section">
          <div className="mx-auto max-w-[820px] px-6 lg:px-12">
            <div
              data-reveal
              className="border border-mist bg-shell rounded-[2.5rem] p-12 lg:p-16 text-center"
            >
              <p className="font-display-italic text-4xl text-abyss">
                First demos arriving soon.
              </p>
              <p className="mt-4 text-ink-soft max-w-md mx-auto">
                Currently in the booth recording samples across every genre on
                the docket. Subscribe to know the moment the first ones land.
              </p>
              <div className="mt-10 max-w-md mx-auto">
                <NewsletterForm />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="pb-section">
          <div className="mx-auto max-w-[1100px] px-6 lg:px-12">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {demos.map((demo, i) => (
                <div
                  key={demo.id}
                  data-reveal
                  style={{ "--enter-delay": `${(i % 3) * 80}ms` } as React.CSSProperties}
                >
                  <DemoCard demo={demo} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
