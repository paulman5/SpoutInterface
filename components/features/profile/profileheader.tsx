import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon } from "lucide-react";

export default function ProfileHeader() {
  return (
    <div className="bg-gradient-to-r from-slate-600 via-slate-700 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <Badge
            variant="secondary"
            className="bg-white/20 text-white border-white/30 hover:bg-white/20"
          >
            <SettingsIcon className="w-4 h-4 mr-2" />
            Account Settings
          </Badge>
        </div>
        <h1 className="text-4xl font-bold mb-3">Settings</h1>
        <p className="text-slate-200 text-lg">
          Manage your account preferences, security settings, and platform
          configuration
        </p>
      </div>
    </div>
  );
}
