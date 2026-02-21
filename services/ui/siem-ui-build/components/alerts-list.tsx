"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Filter } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { alertsApi } from "@/lib/api"
import { AlertDetailDrawer } from "@/components/alert-detail-drawer"
import { formatDistanceToNow, format } from "date-fns"

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
type Category = "web_exploit" | "network_scan" | "brute_force" | "anomaly"

const categoryLabels: Record<Category, string> = {
  web_exploit: "Web Exploit",
  network_scan: "Network Scan",
  brute_force: "Brute Force",
  anomaly: "Anomaly",
}

interface AlertFixed {
  id?: string
  timestamp: string
  severity: Severity
  source_ip: string
  destination_ip: string
  category?: Category
  description?: string
  payload?: string
  [key: string]: any
}

function normalizeSeverity(input: unknown): Severity {
  const s = String(input ?? "LOW").toUpperCase()
  if (s === "CRITICAL" || s === "HIGH" || s === "MEDIUM" || s === "LOW") return s
  return "LOW"
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const colorMap: Record<Severity, string> = {
    CRITICAL: "bg-destructive/15 text-destructive border-destructive/30",
    HIGH: "bg-warning/15 text-warning border-warning/30",
    MEDIUM:
      "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    LOW: "bg-primary/15 text-primary border-primary/30",
  }

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorMap[severity]}`}>
      {severity}
    </Badge>
  )
}

function CategoryBadge({ category }: { category?: Category }) {
  if (!category) return null
  return (
    <Badge
      variant="secondary"
      className="text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground"
    >
      {categoryLabels[category]}
    </Badge>
  )
}

export default function AlertsList() {
  const [alerts, setAlerts] = useState<AlertFixed[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<AlertFixed | null>(null)

  useEffect(() => {
    setLoading(true)
    alertsApi
      .list({ limit: 200 })
      .then((data) => {
        setAlerts(
          (data ?? []).map((a: any) => ({
            ...a,
            severity: normalizeSeverity(a?.severity),
            category: a?.category,
          }))
        )
        setLoading(false)
      })
      .catch((err) => {
        setError(err?.message || "Failed to load alerts")
        setLoading(false)
      })
  }, [])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (severityFilter !== "all" && alert.severity !== (severityFilter as Severity)) return false
      if (categoryFilter !== "all" && alert.category !== (categoryFilter as Category)) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !alert.source_ip?.toLowerCase().includes(q) &&
          !alert.destination_ip?.toLowerCase().includes(q) &&
          !(alert.description && alert.description.toLowerCase().includes(q))
        ) {
          return false
        }
      }
      return true
    })
  }, [alerts, severityFilter, categoryFilter, searchQuery])

  const severityRowBorder: Record<Severity, string> = {
    CRITICAL: "border-l-destructive",
    HIGH: "border-l-warning",
    MEDIUM: "border-l-[hsl(45,93%,47%)]",
    LOW: "border-l-primary",
  }

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading alerts...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3 items-start md:items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by IP or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="web_exploit">Web Exploit</SelectItem>
                <SelectItem value="network_scan">Network Scan</SelectItem>
                <SelectItem value="brute_force">Brute Force</SelectItem>
                <SelectItem value="anomaly">Anomaly</SelectItem>
              </SelectContent>
            </Select>

            {(severityFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setSeverityFilter("all")
                  setCategoryFilter("all")
                  setSearchQuery("")
                }}
              >
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-muted-foreground">
        Showing {filteredAlerts.length} of {alerts.length} alerts
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-foreground">Alert Detections</CardTitle>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground w-8" />
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Timestamp
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Severity
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Source IP
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Destination
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Description
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredAlerts.map((alert) => (
                  <tr
                    key={
                      alert.id ??
                      `${alert.timestamp}-${alert.source_ip}-${alert.destination_ip}`
                    }
                    className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors cursor-pointer ${
                      severityRowBorder[alert.severity]
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedAlert(alert)
                      }
                    }}
                  >
                    <td className="py-3" />
                    <td className="py-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">
                          {format(new Date(alert.timestamp), "MMM dd, HH:mm:ss")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-3 text-xs font-mono text-foreground">{alert.source_ip}</td>
                    <td className="py-3 text-xs font-mono text-foreground">
                      {alert.destination_ip}
                    </td>
                    <td className="py-3">
                      <CategoryBadge category={alert.category} />
                    </td>
                    <td className="py-3 text-xs text-muted-foreground max-w-xs truncate hidden lg:table-cell">
                      {alert.description}
                    </td>
                  </tr>
                ))}

                {filteredAlerts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">No alerts match your filters.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AlertDetailDrawer alert={selectedAlert as any} onClose={() => setSelectedAlert(null)} />
    </div>
  )
}