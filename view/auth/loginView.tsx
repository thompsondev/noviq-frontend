"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { cn, signin, AuthApiError, showNotification } from "@/lib"
import { Button, Input } from "@heroui/react"
import { FaEye, FaEyeSlash, FaGithub } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import Link from "next/link"

const LoginView = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get("email") ?? "").trim()
    const password = String(formData.get("password") ?? "")

    setError("")
    setIsSubmitting(true)
    try {
      await signin({ email, password })
      router.push("/dashboard")
    } catch (err) {
      if (err instanceof AuthApiError && err.status === 403) {
        window.localStorage.setItem("email", email)
        showNotification({ type: "info", message: "Please verify your email first." })
        router.push("/auth/verify")
        return
      }
      setError(err instanceof AuthApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="bg-background p-1.5 py-8">
        <div className="pb-5">
          <h1 className="pb-2 text-2xl font-semibold">Welcome back 👋 </h1>
          <p className="text-sm font-medium text-muted-foreground">
            sign-in to continue to your dashboard
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
              <Field>
                <div className="flex">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <Link
                    href="/auth/forgot"
                    className="ml-auto text-sm text-muted-foreground underline-offset-4"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative w-full">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="********"
                    className="h-9 w-full rounded-md pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FaEyeSlash className="size-4" aria-hidden="true" />
                    ) : (
                      <FaEye className="size-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </Field>
              {error ? (
                <p className="-mt-2 text-sm text-destructive">{error}</p>
              ) : null}
              <Field className="pb-4">
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="rounded-md bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  {isSubmitting ? "Signing in…" : "Login"}
                </Button>
              </Field>
              <FieldSeparator>or</FieldSeparator>
              <Field className="pt-4">
                <Button variant="outline" type="button" className="rounded-md">
                  <FcGoogle className="size-4" aria-hidden="true" />
                  Continue with Google
                </Button>
                <Button variant="outline" type="button" className="rounded-md">
                  <FaGithub
                    className="size-4 text-black dark:text-white"
                    aria-hidden="true"
                  />
                  Continue with GitHub
                </Button>
              </Field>
              <p className="pt-2 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-foreground no-underline hover:text-primary"
                >
                  Sign up
                </Link>
              </p>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginView
