export interface SessionUser {
  id: string
  organizationId: string
  email: string
  name: string
  role: string
}

export class AuthApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

function trimEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "")
}

const AUTH_URL = trimEnv(process.env.NEXT_PUBLIC_AUTH_URL)
const AUTH_BASE_PATH = trimEnv(process.env.NEXT_PUBLIC_AUTH_BASE_PATH) || "/v1/auth"
const USER_SESSION_PATH =
  trimEnv(process.env.NEXT_PUBLIC_USER_SESSION_PATH) || "/v1/user/session"

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${AUTH_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  const body = await response.json().catch(() => null)

  if (!response.ok) {
    const rawMessage = body?.message
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage || "Something went wrong. Please try again."
    throw new AuthApiError(message, response.status)
  }

  return body as T
}

export function signup(input: { name: string; email: string; password: string }) {
  return request<{ email: string }>(`${AUTH_BASE_PATH}/signup`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function verify(input: { email: string; code: string }) {
  return request<{ user: SessionUser }>(`${AUTH_BASE_PATH}/verify`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function resendOtp(input: { email: string }) {
  return request<{ email: string }>(`${AUTH_BASE_PATH}/resend-otp`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function signin(input: { email: string; password: string }) {
  return request<{ user: SessionUser }>(`${AUTH_BASE_PATH}/signin`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function forgotPassword(input: { email: string }) {
  return request<{ email: string }>(`${AUTH_BASE_PATH}/forgot`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function resetPassword(input: { email: string; code: string; password: string }) {
  return request<{ user: SessionUser }>(`${AUTH_BASE_PATH}/reset`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function logout() {
  return request<{ success: boolean }>(`${AUTH_BASE_PATH}/logout`, {
    method: "POST",
  })
}

export function getSession() {
  return request<{ user: SessionUser | null }>(USER_SESSION_PATH, {
    method: "GET",
  })
}
