// ── API Configuration ─────────────────────────────────────────────────
// Change this to your FastAPI backend URL when deploying.
// In development, the backend runs on your VM at port 8000.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://10.56.109.201:8000"

// ── Generic fetcher ──────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE}${path}`
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(
      `API error ${res.status}: ${res.statusText}${body ? ` - ${body}` : ""}`
    )
  }

  return res.json() as Promise<T>
}

// ── Rules API ────────────────────────────────────────────────────────

export interface Rule {
  id: string
  name: string
  description: string
  severity: string
  category: string
  sid?: number
  action?: string
  last_triggered?: string | null
  synced_to_suricata?: boolean
  created_at?: string
}

export type RuleCreate = Omit<Rule, "id" | "created_at" | "last_triggered" | "synced_to_suricata">
export type RuleUpdate = Partial<RuleCreate>

export const rulesApi = {
  list: () => apiFetch<Rule[]>("/rules/"),
  create: (data: RuleCreate) =>
    apiFetch<Rule>("/rules/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id: string, data: RuleUpdate) =>
    apiFetch<Rule>(`/rules/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiFetch<void>(`/rules/${id}`, {
      method: "DELETE",
    }),
}

// ── Malware / Reports API ────────────────────────────────────────────

export interface MalwareReport {
  id: number
  name: string
  hash: string
  type: string
  severity: string
  status: string
  detected_at: string
  source_ip: string
  file_path: string
  description: string
}

export const malwareApi = {
  list: () => apiFetch<MalwareReport[]>("/malware/"),
}

// ── Cases API ────────────────────────────────────────────────────────

export interface Case {
  id: number
  title: string
  status: string
  priority: string
  description: string
  analyst_assigned: string
  created_at: string
  updated_at: string
}

export const casesApi = {
  list: () => apiFetch<Case[]>("/cases/"),
}

// ── Hosts API ────────────────────────────────────────────────────────

export interface Host {
  id: number
  hostname: string
  ip_address: string
  os: string
  status: string
  risk_level: string
  last_seen: string
  alerts_count: number
  created_at: string
  updated_at: string
}

export const hostsApi = {
  list: () => apiFetch<Host[]>("/hosts/"),
}

// ── Daily Reports API ────────────────────────────────────────────────

export interface DailyReport {
  id: number
  report_date: string
  total_threats: number
  critical_count: number
  high_count: number
  medium_count: number
  low_count: number
  summary: string
  file_path?: string
  generated_by: string
  created_at: string
  updated_at: string
}

export const reportsApi = {
  list: () => apiFetch<DailyReport[]>("/reports/"),
  generate: (report_date?: string) =>
    apiFetch<DailyReport>("/reports/generate", {
      method: "POST",
      body: JSON.stringify({ report_date }),
    }),
  download: (id: number) => {
    const url = `${API_BASE}/reports/${id}/download`
    window.open(url, "_blank")
  },
  downloadHTML: (id: number) => {
    const url = `${API_BASE}/reports/${id}/html`
    window.open(url, "_blank")
  },
}

// ── Alerts API ───────────────────────────────────────────────────────
export interface Alert {
  id?: string;
  timestamp: string;
  severity: string;
  source_ip: string;
  destination_ip: string;
  category?: string;
  [key: string]: any;
}

export const alertsApi = {
  list: (params?: {
    limit?: number;
    severity?: string;
    source_ip?: string;
    destination_ip?: string;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.append("limit", String(params.limit));
    if (params?.severity) searchParams.append("severity", params.severity);
    if (params?.source_ip) searchParams.append("source_ip", params.source_ip);
    if (params?.destination_ip) searchParams.append("destination_ip", params.destination_ip);
    const query = searchParams.toString() ? `?${searchParams.toString()}` : "";
    return apiFetch<Alert[]>(`/alerts${query}`);
  },
}
