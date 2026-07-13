"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn, verify, resendOtp, AuthApiError, showNotification } from "@/lib"
import { Button, InputOTP } from "@heroui/react"
import { Field, FieldGroup } from "@/components/ui/field"

const RESEND_OTP_SECONDS = 60
const RESEND_OTP_STORAGE_KEY = "verify_resend_otp_expires_at"
const EMAIL_STORAGE_KEY = "email"

const VerifyView = ({ className, ...props }: React.ComponentProps<"div">) => {
  const router = useRouter()
  const [resendTimer, setResendTimer] = useState(RESEND_OTP_SECONDS)
  const [email] = useState(() =>
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem(EMAIL_STORAGE_KEY) ?? ""
  )
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!email) {
      router.replace("/auth/signup")
    }
  }, [email, router])

  useEffect(() => {
    const syncTimerFromStorage = () => {
      const storedExpiry = window.localStorage.getItem(RESEND_OTP_STORAGE_KEY)

      if (!storedExpiry) {
        const expiresAt = Date.now() + RESEND_OTP_SECONDS * 1000
        window.localStorage.setItem(RESEND_OTP_STORAGE_KEY, String(expiresAt))
        setResendTimer(RESEND_OTP_SECONDS)
        return
      }

      const expiresAt = Number(storedExpiry)
      const secondsLeft = Math.max(Math.ceil((expiresAt - Date.now()) / 1000), 0)
      setResendTimer(secondsLeft)
    }

    const timeoutId = window.setTimeout(syncTimerFromStorage, 0)
    const intervalId = window.setInterval(() => {
      syncTimerFromStorage()
    }, 1000)

    return () => {
      window.clearTimeout(timeoutId)
      window.clearInterval(intervalId)
    }
  }, [])

  const handleResendOtp = async () => {
    if (!email || isResending) return
    setIsResending(true)
    try {
      await resendOtp({ email })
      const expiresAt = Date.now() + RESEND_OTP_SECONDS * 1000
      window.localStorage.setItem(RESEND_OTP_STORAGE_KEY, String(expiresAt))
      setResendTimer(RESEND_OTP_SECONDS)
      showNotification({ type: "success", message: "A new code is on its way." })
    } catch (err) {
      showNotification({
        type: "error",
        message: err instanceof AuthApiError ? err.message : "Couldn't resend the code.",
      })
    } finally {
      setIsResending(false)
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (code.length !== 6) {
      setError("Please enter the 6-digit code.")
      return
    }

    setError("")
    setIsSubmitting(true)
    try {
      await verify({ email, code })
      window.localStorage.removeItem(EMAIL_STORAGE_KEY)
      window.localStorage.removeItem(RESEND_OTP_STORAGE_KEY)
      showNotification({ type: "success", message: "Account verified." })
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof AuthApiError ? err.message : "Invalid or expired code.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn("flex flex-col items-center gap-6", className)}
      {...props}
    >
      <div className="m-auto flex w-full max-w-sm flex-col items-center bg-background p-1.5 py-8 text-center">
        <div className="pb-5">
          <h1 className="pb-2 text-2xl font-semibold">Verify your account </h1>
          <p className="text-sm font-medium text-muted-foreground">
            we&#39;ve sent a mail to {email}
          </p>
        </div>
        <div className="w-full pt-1">
          <form className="w-full" onSubmit={handleSubmit}>
            <FieldGroup className="w-full items-center">
              <Field className="items-center">
                <div className="flex w-full justify-center">
                  <InputOTP
                    maxLength={6}
                    autoFocus
                    textAlign="center"
                    value={code}
                    onChange={setCode}
                  >
                    <InputOTP.Group>
                      <InputOTP.Slot index={0} className="rounded-md" />
                      <InputOTP.Slot index={1} className="rounded-md" />
                      <InputOTP.Slot index={2} className="rounded-md" />
                      <InputOTP.Slot index={3} className="rounded-md" />
                      <InputOTP.Slot index={4} className="rounded-md" />
                      <InputOTP.Slot index={5} className="rounded-md" />
                    </InputOTP.Group>
                  </InputOTP>
                </div>
              </Field>

              {error ? (
                <p className="-mt-2 text-sm text-destructive">{error}</p>
              ) : null}

              <Field className="m-auto w-full items-center pb-4">
                <Button
                  type="submit"
                  isDisabled={isSubmitting}
                  className="mx-auto w-full max-w-[70%] rounded-md bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                >
                  {isSubmitting ? "Verifying…" : "Verify Account"}
                </Button>

                <p className="pt-4 text-sm text-muted-foreground">
                  {resendTimer > 0 ? (
                    <>Resend OTP in {resendTimer}s</>
                  ) : (
                    <>
                      Didn&apos;t receive code?{" "}
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={isResending}
                        className="cursor-pointer font-medium text-foreground hover:text-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Resend OTP
                      </button>
                    </>
                  )}
                </p>
              </Field>
            </FieldGroup>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyView
