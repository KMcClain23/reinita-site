"use client";

export function LogoutButton() {
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  };
  return (
    <button
      onClick={handleLogout}
      className="text-xs text-driftwood hover:text-abyss transition-colors"
    >
      Sign out
    </button>
  );
}
