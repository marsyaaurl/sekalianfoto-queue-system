import React from "react";
import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/admin/Sidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getAdminSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar email={session.email} />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
