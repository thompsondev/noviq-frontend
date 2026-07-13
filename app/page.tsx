"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSession } from "@/lib"

const HOME_SPLASH_MS = Number(process.env.NEXT_PUBLIC_HOME_SPLASH_MS ?? 4000)

const HomePage = () => {
  const router = useRouter()

  useEffect(() => {
    let cancelled = false
    const start = Date.now()

    const resolveDestination = async () => {
      let target = "/auth/signin"
      try {
        const { user } = await getSession()
        if (user) target = "/dashboard"
      } catch {
        // Backend/session check failed — fall back to signin.
      }

      const remaining = Math.max(HOME_SPLASH_MS - (Date.now() - start), 0)
      window.setTimeout(() => {
        if (!cancelled) router.replace(target)
      }, remaining)
    }

    resolveDestination()
    return () => {
      cancelled = true
    }
  }, [router])

  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <Image
        src="/images/logo.svg"
        alt="Noviq"
        width={140}
        height={36}
        className="dark:invert"
        priority
      />
    </div>
  )
}

export default HomePage
