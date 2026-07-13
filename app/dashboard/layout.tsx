"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import { cn, getSession, logout, type SessionUser } from "@/lib"
import { CurrentUserProvider } from "@/hooks/useCurrentUser"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/discover", label: "Discover" },
]

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<SessionUser | null | undefined>(undefined)

  useEffect(() => {
    let cancelled = false

    getSession()
      .then((result) => {
        if (cancelled) return
        if (!result.user) {
          router.replace("/auth/signin")
          return
        }
        setUser(result.user)
      })
      .catch(() => {
        if (!cancelled) router.replace("/auth/signin")
      })

    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = async () => {
    await logout().catch(() => {})
    router.replace("/auth/signin")
  }

  if (user === undefined) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <CurrentUserProvider value={user}>
      <div className="flex min-h-svh bg-background">
        <aside className="flex w-56 flex-col border-r border-border p-4">
          <div className="pb-6 text-lg font-semibold">Noviq</div>
          <nav className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            Log out
          </button>
        </aside>
        <main className="flex-1 overflow-y-auto p-8">{children}</main>
      </div>
    </CurrentUserProvider>
  )
}

export default DashboardLayout
