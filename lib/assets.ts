import { apiRequest } from "./api-client"

export type GeneratedAssetType = "email"
export type GeneratedAssetStatus = "completed" | "failed"

export interface GeneratedAsset {
  id: string
  companyId: string
  type: GeneratedAssetType
  status: GeneratedAssetStatus
  subject: string | null
  body: string | null
  createdAt: string
}

export function generateEmailAsset(companyId: string) {
  return apiRequest<GeneratedAsset>("/v1/assets/generate", {
    method: "POST",
    body: JSON.stringify({ companyId }),
  })
}

export function listAssets() {
  return apiRequest<GeneratedAsset[]>("/v1/assets", { method: "GET" })
}
