"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn, forgotPassword, AuthApiError, showNotification } from "@/lib"
import { Button, Input } from "@heroui/react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import Link from "next/link"

export const RESET_EMAIL_STORAGE_KEY = "reset_email"

const ForgotView = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()

    setError("")
    setIsSubmitting(true)
    try {
      await forgotPassword({ email })
      window.localStorage.setItem(RESET_EMAIL_STORAGE_KEY, email)
      showNotification({
        type: "success",
        message: "If that account exists, a reset code is on its way.",
      })
      router.push("/auth/reset")
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-background p-1.5 py-8">
        <div className="pb-5">
          <h1 className="pb-2 text-2xl font-semibold">Forgot Password </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Let&#39;s help get back your account
          </p>
        </div>
        <div className="pt-3">
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="m@example.com"
                  className="h-9 w-full rounded-md"
                  required
                />
              </Field>

              {error ? (
                <p className="-mt-2 text-sm text-destructive">{error}</p>
              ) : null}

              <Field className="">
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="rounded-md bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  {isSubmitting ? "Searching…" : "Find my account"}
                </Button>
              </Field>

              <p className="pt-1 text-center text-sm text-muted-foreground">
                Remember Password?{" "}
                <Link
                  href="/auth/signin"
                  className="font-medium text-foreground no-underline hover:text-primary"
                >
                  Sign in
                </Link>
              </p>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ForgotView
