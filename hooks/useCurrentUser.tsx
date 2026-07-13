"use client"

import { createContext, useContext } from "react"
import type { SessionUser } from "@/lib"

const CurrentUserContext = createContext<SessionUser | null>(null)

export const CurrentUserProvider = CurrentUserContext.Provider

export const useCurrentUser = () => useContext(CurrentUserContext)
