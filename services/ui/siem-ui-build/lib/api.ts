const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export interface LoginCredentials {
  username: string
  password: string
}

export interface LoginResponse {
  status?: string
  username?: string
  role?: string
  error?: string
}

export interface Alert {
  id: string
  timestamp: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  source_ip: string
  destination_ip: string
  category: string
  description: string
  payload: string
}

export interface Rule {
  id: string
  name: string
  description: string
  enabled: boolean
  severity: string
  pattern: string
}

export interface MalwareAnalysis {
  id: string
  file_hash: string
  file_name: string
  status: string
  threat_level: string
  timestamp: string
}

export interface ScanResult {
  id: string
  target: string
  scan_type: string
  status: string
  timestamp: string
  results: unknown
}

// Auth API calls
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    })
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Login error:", error)
    return { error: "Failed to connect to authentication service" }
  }
}

// Alerts API calls
export async function fetchAlerts(
  limit: number = 50,
  severity?: string,
  source_ip?: string,
  destination_ip?: string
): Promise<Alert[]> {
  try {
    const params = new URLSearchParams()
    params.append("limit", limit.toString())
    if (severity) params.append("severity", severity)
    if (source_ip) params.append("source_ip", source_ip)
    if (destination_ip) params.append("destination_ip", destination_ip)

    const response = await fetch(`${API_BASE_URL}/alerts/?${params.toString()}`)
    if (!response.ok) throw new Error(`Failed to fetch alerts: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Fetch alerts error:", error)
    return []
  }
}

export async function fetchAlertById(id: string): Promise<Alert | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/${id}`)
    if (!response.ok) throw new Error(`Failed to fetch alert: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Fetch alert error:", error)
    return null
  }
}

export async function createAlert(alert: Omit<Alert, "id">): Promise<Alert | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/alerts/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(alert),
    })
    if (!response.ok) throw new Error(`Failed to create alert: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Create alert error:", error)
    return null
  }
}

// Rules API calls
export async function fetchRules(): Promise<Rule[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/rules/`)
    if (!response.ok) throw new Error(`Failed to fetch rules: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Fetch rules error:", error)
    return []
  }
}

export async function createRule(rule: Omit<Rule, "id">): Promise<Rule | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/rules/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rule),
    })
    if (!response.ok) throw new Error(`Failed to create rule: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Create rule error:", error)
    return null
  }
}

export async function updateRule(id: string, updates: Partial<Rule>): Promise<Rule | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/rules/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
    if (!response.ok) throw new Error(`Failed to update rule: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Update rule error:", error)
    return null
  }
}

// Malware API calls
export async function analyzeMalware(files: File[]): Promise<MalwareAnalysis[]> {
  try {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append("files", file)
    })

    const response = await fetch(`${API_BASE_URL}/malware/analyze`, {
      method: "POST",
      body: formData,
    })
    if (!response.ok) throw new Error(`Failed to analyze malware: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Analyze malware error:", error)
    return []
  }
}

export async function fetchMalwareAnalyses(): Promise<MalwareAnalysis[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/malware/analyses`)
    if (!response.ok) throw new Error(`Failed to fetch malware analyses: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Fetch malware analyses error:", error)
    return []
  }
}

// Scans API calls
export async function initiateScan(target: string, scan_type: string): Promise<ScanResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/scans/initiate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ target, scan_type }),
    })
    if (!response.ok) throw new Error(`Failed to initiate scan: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Initiate scan error:", error)
    return null
  }
}

export async function fetchScans(): Promise<ScanResult[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/scans/results`)
    if (!response.ok) throw new Error(`Failed to fetch scans: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Fetch scans error:", error)
    return []
  }
}

export async function fetchScanStatus(scan_id: string): Promise<ScanResult | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/scans/${scan_id}/status`)
    if (!response.ok) throw new Error(`Failed to fetch scan status: ${response.statusText}`)
    return await response.json()
  } catch (error) {
    console.error("Fetch scan status error:", error)
    return null
  }
}
