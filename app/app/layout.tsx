import { Sidebar, SidebarInset } from "@/components/ui/sidebar";

import { SidebarProvider } from "@/components/ui/sidebar";
import OnchainIDChecker from "@/components/contract/OnchainIDChecker";
import {
  DashboardSidebarNavClient,
  DashboardNavbarHeaderClient,
} from "@/components/dashboardNavClient";
import { Toaster } from "@/components/ui/sonner";
import { Suspense } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Toaster position="top-right" />
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar collapsible="none" className="border-r bg-white">
          <DashboardSidebarNavClient />
        </Sidebar>

        <SidebarInset className="flex-1">
          <DashboardNavbarHeaderClient />
          <Suspense fallback={<div>Loading...</div>}>
            <OnchainIDChecker />
          </Suspense>
          <main className="flex-1 p-6 bg-gray-50">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
