"use client"

import { useState, useMemo, useEffect } from "react"
import { Search, Filter, Loader2 } from "lucide-react"
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
import { fetchAlerts, type Alert } from "@/lib/api"
import { AlertDetailDrawer } from "@/components/alert-detail-drawer"
import { formatDistanceToNow, format } from "date-fns"

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
type Category = string

const categoryLabels: Record<string, string> = {
  web_exploit: "Web Exploit",
  network_scan: "Network Scan",
  brute_force: "Brute Force",
  anomaly: "Anomaly",
  malware: "Malware",
  ddos: "DDoS",
}

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<Severity, string> = {
    CRITICAL: "bg-destructive/15 text-destructive border-destructive/30",
    HIGH: "bg-warning/15 text-warning border-warning/30",
    MEDIUM: "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    LOW: "bg-primary/15 text-primary border-primary/30",
  }

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorMap[severity]}`}>
      {severity}
    </Badge>
  )
}

function CategoryBadge({ category }: { category: Category }) {
  return (
    <Badge
      variant="secondary"
      className="text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground"
    >
      {categoryLabels[category]}
    </Badge>
  )
}

export function AlertsList() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null)

  // Fetch alerts from API
  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const severity = severityFilter !== "all" ? severityFilter : undefined
        const data = await fetchAlerts(50, severity)
        setAlerts(data)
      } catch (err) {
        setError("Failed to load alerts")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadAlerts()
  }, [severityFilter])

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      if (categoryFilter !== "all" && alert.category !== categoryFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !alert.source_ip.includes(q) &&
          !alert.destination_ip.includes(q) &&
          !alert.description.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [alerts, categoryFilter, searchQuery])

  const severityRowBorder: Record<string, string> = {
    CRITICAL: "border-l-destructive",
    HIGH: "border-l-warning",
    MEDIUM: "border-l-[hsl(45,93%,47%)]",
    LOW: "border-l-primary",
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
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

      {/* Results count */}
      <div className="text-xs text-muted-foreground">
        {isLoading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading alerts...
          </div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          `Showing ${filteredAlerts.length} of ${alerts.length} alerts`
        )}
      </div>

      {/* Alerts Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Alert Detections
          </CardTitle>
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
                    key={alert.id}
                    className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors cursor-pointer ${severityRowBorder[alert.severity]}`}
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
                          {formatDistanceToNow(new Date(alert.timestamp), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-3 text-xs font-mono text-foreground">
                      {alert.source_ip}
                    </td>
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
                      <p className="text-sm text-muted-foreground">
                        No alerts match your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
      />
    </div>
  )
}
