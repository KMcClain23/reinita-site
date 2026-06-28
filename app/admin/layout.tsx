import Link from "next/link";
import { LogoutButton } from "./logout-button";

export const metadata = {
  title: "Admin",
  robots: "noindex,nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-shore">
      <header className="border-b border-mist">
        <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-display-italic text-xl text-abyss">Admin</span>
            <nav className="flex items-center gap-6 text-sm text-driftwood">
              <Link
                href="/admin/demos"
                className="hover:text-abyss transition-colors"
              >
                Demos
              </Link>
              <Link href="/" className="hover:text-abyss transition-colors">
                View site →
              </Link>
            </nav>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}
