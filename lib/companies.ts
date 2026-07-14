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

export type CompanyIntelligenceStatus = "completed" | "insufficient_data" | "failed"

export interface CompanyIntelligence {
  id: string
  companyId: string
  status: CompanyIntelligenceStatus
  summary: string | null
  products: string[]
  pricing: string | null
  competitors: string[]
  techStack: string[]
  painPoints: string[]
  generatedAt: string
}

export interface ResearchResponse {
  intelligence: CompanyIntelligence
  cached: boolean
}

export function researchCompany(companyId: string) {
  return apiRequest<ResearchResponse>(`/v1/companies/${companyId}/research`, {
    method: "POST",
  })
}
