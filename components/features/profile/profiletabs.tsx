"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield } from "lucide-react";
import KYCFlow from "@/components/kycFlow";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ProfileTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialTab = searchParams?.get("tab") || "profile";
  const [tab, setTab] = useState(initialTab);

  // Keep tab in sync with URL
  useEffect(() => {
    setTab(initialTab);
    if (initialTab !== "kyc") {
      router.replace("/app/profile?tab=kyc");
    }
  }, [initialTab, router]);

  const handleTabChange = (value: string) => {
    if (value === "profile") return;
    setTab(value);
    router.replace(`/app/profile?tab=${value}`);
  };

  return (
    <Tabs value={tab} onValueChange={handleTabChange} className="space-y-6">
      <div className={`bg-white rounded-2xl p-2 shadow-md border-0`}>
        <TabsList className="flex justify-center w-full bg-transparent gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value="profile"
                  className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-xl opacity-60 cursor-not-allowed"
                  tabIndex={-1}
                  aria-disabled="true"
                >
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="center">
                Coming soon
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TabsTrigger
            value="kyc"
            className="flex items-center gap-2 data-[state=active]:bg-slate-100 rounded-xl"
          >
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Verification</span>
          </TabsTrigger>
        </TabsList>
      </div>

      {/* KYC Tab (was Notifications) */}
      <TabsContent value="kyc" className="space-y-6">
        <KYCFlow />
      </TabsContent>
    </Tabs>
  );
}
