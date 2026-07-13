export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

export function trimEnv(value: string | undefined): string {
  return (value ?? "").trim().replace(/\/+$/, "")
}

// NEXT_PUBLIC_AUTH_URL is the backend origin — every /v1 route lives on the
// same NestJS app, not just auth, so it doubles as the general API origin.
export const API_ORIGIN = trimEnv(process.env.NEXT_PUBLIC_AUTH_URL)

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_ORIGIN}${path}`, {
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
    throw new ApiError(message, response.status)
  }

  return body as T
}
