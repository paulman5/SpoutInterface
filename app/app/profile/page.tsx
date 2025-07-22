"use client"

import ProfileHeader from "@/components/features/profile/profileheader"
import ProfileTabs from "@/components/features/profile/profiletabs"
import { Suspense } from "react"

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileHeader />
      <Suspense fallback={<div>Loading...</div>}>
        <ProfileTabs />
      </Suspense>
    </div>
  )
}
