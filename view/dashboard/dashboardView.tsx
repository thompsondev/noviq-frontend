"use client"

import Link from "next/link"
import { useCurrentUser } from "@/hooks/useCurrentUser"

const DashboardView = () => {
  const user = useCurrentUser()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">
          Welcome{user ? `, ${user.name}` : ""}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s what&apos;s happening with your account.
        </p>
      </div>
      <Link
        href="/dashboard/discover"
        className="w-fit rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
      >
        Go to Discover →
      </Link>
    </div>
  )
}

export default DashboardView
