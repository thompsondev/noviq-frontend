import { apiRequest, ApiError, trimEnv } from "./api-client"

export { ApiError as AuthApiError }

export interface SessionUser {
  id: string
  organizationId: string
  email: string
  name: string
  role: string
}

const AUTH_BASE_PATH = trimEnv(process.env.NEXT_PUBLIC_AUTH_BASE_PATH) || "/v1/auth"
const USER_SESSION_PATH =
  trimEnv(process.env.NEXT_PUBLIC_USER_SESSION_PATH) || "/v1/user/session"

export function signup(input: { name: string; email: string; password: string }) {
  return apiRequest<{ email: string }>(`${AUTH_BASE_PATH}/signup`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function verify(input: { email: string; code: string }) {
  return apiRequest<{ user: SessionUser }>(`${AUTH_BASE_PATH}/verify`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function resendOtp(input: { email: string }) {
  return apiRequest<{ email: string }>(`${AUTH_BASE_PATH}/resend-otp`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function signin(input: { email: string; password: string }) {
  return apiRequest<{ user: SessionUser }>(`${AUTH_BASE_PATH}/signin`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function forgotPassword(input: { email: string }) {
  return apiRequest<{ email: string }>(`${AUTH_BASE_PATH}/forgot`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function resetPassword(input: { email: string; code: string; password: string }) {
  return apiRequest<{ user: SessionUser }>(`${AUTH_BASE_PATH}/reset`, {
    method: "POST",
    body: JSON.stringify(input),
  })
}

export function logout() {
  return apiRequest<{ success: boolean }>(`${AUTH_BASE_PATH}/logout`, {
    method: "POST",
  })
}

export function getSession() {
  return apiRequest<{ user: SessionUser | null }>(USER_SESSION_PATH, {
    method: "GET",
  })
}
