import { apiRequest } from "./api-client"

export interface Company {
  id: string
  organizationId: string
  name: string
  domain: string
  industry: string | null
  country: string | null
  employeeCount: number | null
  revenue: string | null
  technologies: string[]
  fundingStage: string | null
  sourceQuery: string | null
  createdAt: string
}

export interface CompanySearchInput {
  keyword?: string
  industry?: string
  country?: string
}

export function searchCompanies(input: CompanySearchInput) {
  return apiRequest<{ companies: Company[]; sourceConfigured: boolean }>(
    "/v1/companies/search",
    {
      method: "POST",
      body: JSON.stringify(input),
    }
  )
}

export function listCompanies() {
  return apiRequest<Company[]>("/v1/companies", { method: "GET" })
}
