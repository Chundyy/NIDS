// This file contains utility data and constants for alerts
// Alert data is now fetched from the API

export type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
export type Category = string

export interface Alert {
  id: string
  timestamp: string
  severity: Severity
  source_ip: string
  destination_ip: string
  category: Category
  description: string
  payload: string
}

// Category labels for UI display
export const categoryLabels: Record<string, string> = {
  web_exploit: "Web Exploit",
  network_scan: "Network Scan",
  brute_force: "Brute Force",
  anomaly: "Anomaly",
  malware: "Malware",
  ddos: "DDoS",
}

// Severity color mapping
export const severityColors: Record<Severity, string> = {
  CRITICAL: "hsl(0, 72%, 51%)",
  HIGH: "hsl(25, 95%, 53%)",
  MEDIUM: "hsl(45, 93%, 47%)",
  LOW: "hsl(210, 100%, 52%)",
}

