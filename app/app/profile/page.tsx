"use client"

import ProfileHeader from "@/components/features/profile/profileheader"
import ProfileTabs from "@/components/features/profile/profiletabs"

function ProfilePage() {
  return (
    <div className="space-y-8">
      <ProfileHeader />
      <ProfileTabs />
    </div>
  )
}

export default ProfilePage
