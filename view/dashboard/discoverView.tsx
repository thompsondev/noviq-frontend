"use client"

import { Fragment, useEffect, useState } from "react"
import {
  ApiError,
  generateEmailAsset,
  listCompanies,
  researchCompany,
  searchCompanies,
  showNotification,
  type Company,
  type CompanyIntelligence,
  type GeneratedAsset,
} from "@/lib"
import { Button, Input } from "@heroui/react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

interface ResearchState {
  status: "loading" | "done" | "error"
  intelligence?: CompanyIntelligence
  cached?: boolean
  error?: string
}

interface EmailState {
  status: "loading" | "done" | "error"
  asset?: GeneratedAsset
  error?: string
}

const DiscoverView = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  // Defaults to "not configured" (no company data source exists yet, per
  // docs/12-roadmap.md) rather than waiting for a search to reveal that.
  const [sourceConfigured, setSourceConfigured] = useState(false)
  const [error, setError] = useState("")
  const [research, setResearch] = useState<Record<string, ResearchState>>({})
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [emails, setEmails] = useState<Record<string, EmailState>>({})

  useEffect(() => {
    let cancelled = false
    listCompanies()
      .then((result) => {
        if (!cancelled) setCompanies(result)
      })
      .catch(() => {
        if (!cancelled) setError("Couldn't load your companies.")
      })
      .finally(() => {
        if (!cancelled) setIsLoadingList(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const keyword = String(formData.get("keyword") ?? "").trim()
    const industry = String(formData.get("industry") ?? "").trim()
    const country = String(formData.get("country") ?? "").trim()

    if (!keyword && !industry && !country) {
      setError("Enter at least one search filter.")
      return
    }

    setError("")
    setIsSearching(true)
    try {
      const result = await searchCompanies({
        keyword: keyword || undefined,
        industry: industry || undefined,
        country: country || undefined,
      })
      setSourceConfigured(result.sourceConfigured)
      setCompanies((prev) => {
        const existingIds = new Set(prev.map((c) => c.id))
        const merged = [...prev]
        for (const company of result.companies) {
          if (!existingIds.has(company.id)) merged.push(company)
        }
        return merged
      })
      if (result.companies.length === 0 && !result.sourceConfigured) {
        showNotification({
          type: "info",
          message: "No company data source is connected yet — see the banner below.",
        })
      } else if (result.companies.length === 0) {
        showNotification({ type: "info", message: "No companies matched that search." })
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  const handleResearch = async (companyId: string) => {
    setResearch((prev) => ({ ...prev, [companyId]: { status: "loading" } }))
    try {
      const result = await researchCompany(companyId)
      setResearch((prev) => ({
        ...prev,
        [companyId]: {
          status: "done",
          intelligence: result.intelligence,
          cached: result.cached,
        },
      }))
      setExpandedId(companyId)
    } catch (err) {
      setResearch((prev) => ({
        ...prev,
        [companyId]: {
          status: "error",
          error: err instanceof ApiError ? err.message : "Research failed. Try again.",
        },
      }))
    }
  }

  const handleGenerateEmail = async (companyId: string) => {
    setEmails((prev) => ({ ...prev, [companyId]: { status: "loading" } }))
    try {
      const asset = await generateEmailAsset(companyId)
      setEmails((prev) => ({ ...prev, [companyId]: { status: "done", asset } }))
    } catch (err) {
      setEmails((prev) => ({
        ...prev,
        [companyId]: {
          status: "error",
          error: err instanceof ApiError ? err.message : "Generation failed. Try again.",
        },
      }))
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Discover</h1>
        <p className="text-sm text-muted-foreground">
          Search for companies to research and reach out to.
        </p>
      </div>

      {!sourceConfigured ? (
        <div className="rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground">
          No company data source is connected yet, so searches won&apos;t return live
          results. Companies you&apos;ve already discovered are still listed below.
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-md border border-border p-4">
        <FieldGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="keyword">Keyword</FieldLabel>
            <Input
              id="keyword"
              name="keyword"
              placeholder="skincare"
              className="h-9 w-full rounded-md"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="industry">Industry</FieldLabel>
            <Input
              id="industry"
              name="industry"
              placeholder="Beauty"
              className="h-9 w-full rounded-md"
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="country">Country</FieldLabel>
            <Input
              id="country"
              name="country"
              placeholder="Canada"
              className="h-9 w-full rounded-md"
            />
          </Field>
        </FieldGroup>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <Button
          type="submit"
          isDisabled={isSearching}
          className="mt-4 rounded-md bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
        >
          {isSearching ? "Searching…" : "Search"}
        </Button>
      </form>

      <div className="rounded-md border border-border">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Companies ({companies.length})
        </div>
        {isLoadingList ? (
          <p className="p-4 text-sm text-muted-foreground">Loading…</p>
        ) : companies.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No companies discovered yet. Try a search above.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-4 py-2 font-medium">Name</th>
                  <th className="px-4 py-2 font-medium">Domain</th>
                  <th className="px-4 py-2 font-medium">Industry</th>
                  <th className="px-4 py-2 font-medium">Country</th>
                  <th className="px-4 py-2 font-medium">Research</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => {
                  const state = research[company.id]
                  const isExpanded = expandedId === company.id && state?.intelligence

                  return (
                    <Fragment key={company.id}>
                      <tr className="border-b border-border last:border-0">
                        <td className="px-4 py-2">{company.name}</td>
                        <td className="px-4 py-2 text-muted-foreground">{company.domain}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {company.industry ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {company.country ?? "—"}
                        </td>
                        <td className="px-4 py-2">
                          {!state || state.status === "error" ? (
                            <button
                              type="button"
                              onClick={() => handleResearch(company.id)}
                              className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline"
                              title={state?.error}
                            >
                              {state?.status === "error" ? "Failed — Retry" : "Research"}
                            </button>
                          ) : state.status === "loading" ? (
                            <span className="text-muted-foreground">Researching…</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedId((prev) => (prev === company.id ? null : company.id))
                              }
                              className="cursor-pointer font-medium text-foreground underline-offset-2 hover:underline"
                            >
                              {state.intelligence?.status === "insufficient_data"
                                ? "Insufficient data"
                                : isExpanded
                                  ? "Hide details"
                                  : "View details"}
                              {state.cached ? " (cached)" : ""}
                            </button>
                          )}
                        </td>
                      </tr>
                      {isExpanded ? (
                        <tr className="border-b border-border bg-muted/40 last:border-0">
                          <td colSpan={5} className="px-4 py-3 text-sm">
                            <div className="flex flex-col gap-2">
                              {state.intelligence!.summary ? (
                                <p>{state.intelligence!.summary}</p>
                              ) : null}
                              {state.intelligence!.products.length ? (
                                <p>
                                  <span className="font-medium">Products: </span>
                                  {state.intelligence!.products.join(", ")}
                                </p>
                              ) : null}
                              {state.intelligence!.pricing ? (
                                <p>
                                  <span className="font-medium">Pricing: </span>
                                  {state.intelligence!.pricing}
                                </p>
                              ) : null}
                              {state.intelligence!.competitors.length ? (
                                <p>
                                  <span className="font-medium">Competitors: </span>
                                  {state.intelligence!.competitors.join(", ")}
                                </p>
                              ) : null}
                              {state.intelligence!.techStack.length ? (
                                <p>
                                  <span className="font-medium">Tech stack: </span>
                                  {state.intelligence!.techStack.join(", ")}
                                </p>
                              ) : null}
                              {state.intelligence!.painPoints.length ? (
                                <p>
                                  <span className="font-medium">Pain points: </span>
                                  {state.intelligence!.painPoints.join(", ")}
                                </p>
                              ) : null}

                              {state.intelligence!.status === "completed" ? (
                                <div className="mt-2 border-t border-border pt-3">
                                  {(() => {
                                    const emailState = emails[company.id]
                                    if (!emailState || emailState.status === "error") {
                                      return (
                                        <div className="flex flex-col gap-1">
                                          <button
                                            type="button"
                                            onClick={() => handleGenerateEmail(company.id)}
                                            className="w-fit cursor-pointer rounded-md border border-border bg-background px-3 py-1.5 font-medium text-foreground hover:bg-accent"
                                          >
                                            {emailState?.status === "error"
                                              ? "Failed — Retry generating email"
                                              : "Generate Email"}
                                          </button>
                                          {emailState?.error ? (
                                            <p className="text-destructive">{emailState.error}</p>
                                          ) : null}
                                        </div>
                                      )
                                    }
                                    if (emailState.status === "loading") {
                                      return <p className="text-muted-foreground">Generating email…</p>
                                    }
                                    return (
                                      <div className="flex flex-col gap-1">
                                        <p>
                                          <span className="font-medium">Subject: </span>
                                          {emailState.asset?.subject}
                                        </p>
                                        <p className="whitespace-pre-wrap text-muted-foreground">
                                          {emailState.asset?.body}
                                        </p>
                                      </div>
                                    )
                                  })()}
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoverView
