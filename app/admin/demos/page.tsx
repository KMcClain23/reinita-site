import { createServiceRoleClient } from "@/lib/supabase";
import { DemosAdmin, type Demo } from "./demos-admin";

export const dynamic = "force-dynamic";

async function getAllDemos(): Promise<Demo[]> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("demos")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Admin demos query error:", error);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error("Admin demos fetch failed:", err);
    return [];
  }
}

export default async function AdminDemosPage() {
  const demos = await getAllDemos();
  return (
    <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-12">
      <DemosAdmin initialDemos={demos} />
    </div>
  );
}
