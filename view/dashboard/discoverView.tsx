"use client"

import { useEffect, useState } from "react"
import {
  ApiError,
  listCompanies,
  searchCompanies,
  showNotification,
  type Company,
} from "@/lib"
import { Button, Input } from "@heroui/react"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const DiscoverView = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [isLoadingList, setIsLoadingList] = useState(true)
  const [isSearching, setIsSearching] = useState(false)
  // Defaults to "not configured" (no company data source exists yet, per
  // docs/12-roadmap.md) rather than waiting for a search to reveal that.
  const [sourceConfigured, setSourceConfigured] = useState(false)
  const [error, setError] = useState("")

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
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-2">{company.name}</td>
                    <td className="px-4 py-2 text-muted-foreground">{company.domain}</td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {company.industry ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-muted-foreground">
                      {company.country ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscoverView
