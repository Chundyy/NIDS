"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Search,
  Filter,
  Bug,
  ShieldAlert,
  ShieldCheck,
  ShieldBan,
  Loader2,
  WifiOff,
} from "lucide-react"
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
import { malwareApi, type MalwareReport } from "@/lib/api"
import { ReportDetailDrawer } from "@/components/report-detail-drawer"
import { formatDistanceToNow, format } from "date-fns"

type ReportItem = MalwareReport

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    CRITICAL: "bg-destructive/15 text-destructive border-destructive/30",
    HIGH: "bg-warning/15 text-warning border-warning/30",
    MEDIUM: "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    LOW: "bg-primary/15 text-primary border-primary/30",
  }

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${colorMap[severity] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {severity}
    </Badge>
  )
}

function MalwareStatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-destructive/15 text-destructive border-destructive/30",
    quarantined: "bg-warning/15 text-warning border-warning/30",
    removed: "bg-success/15 text-success border-success/30",
  }

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${colorMap[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function StatCard({
  label,
  count,
  icon,
}: {
  label: string
  count: number
  icon: React.ReactNode
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background border border-border">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground tabular-nums">
            {count}
          </span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportsList() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await malwareApi.list()
      setReports(data)
      setApiAvailable(true)
    } catch {
      setReports([])
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      if (severityFilter !== "all" && r.severity !== severityFilter) return false
      if (statusFilter !== "all" && r.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.hash.toLowerCase().includes(q) &&
          !r.type.toLowerCase().includes(q) &&
          !r.source_ip.includes(q) &&
          !r.file_path.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [reports, severityFilter, statusFilter, searchQuery])

  const activeCount = reports.filter((r) => r.status === "active").length
  const quarantinedCount = reports.filter((r) => r.status === "quarantined").length
  const removedCount = reports.filter((r) => r.status === "removed").length

  const statusRowBorder: Record<string, string> = {
    active: "border-l-destructive",
    quarantined: "border-l-warning",
    removed: "border-l-success",
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!apiAvailable) {
    return (
      <div className="flex items-center justify-center py-24">
        <WifiOff className="h-6 w-6 text-warning mr-2" />
        <span className="text-warning text-sm">API unavailable. No malware reports to display.</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* API Status Banner */}
      {!apiAvailable && (
        <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-4 py-2.5">
          <WifiOff className="h-4 w-4 text-warning" />
          <span className="text-xs text-warning">
            API unavailable. Showing local mock data.
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Reports"
          count={reports.length}
          icon={<Bug className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="Active Threats"
          count={activeCount}
          icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          label="Quarantined"
          count={quarantinedCount}
          icon={<ShieldBan className="h-4 w-4 text-warning" />}
        />
        <StatCard
          label="Removed"
          count={removedCount}
          icon={<ShieldCheck className="h-4 w-4 text-success" />}
        />
      </div>

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
                placeholder="Search by name, hash, type, IP, path..."
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
                <SelectItem value="removed">Removed</SelectItem>
              </SelectContent>
            </Select>
            {(severityFilter !== "all" ||
              statusFilter !== "all" ||
              searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setSeverityFilter("all")
                  setStatusFilter("all")
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
        Showing {filteredReports.length} of {reports.length} malware reports
      </div>

      {/* Reports Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Malware Analysis Reports
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground w-8" />
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Severity
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Source IP
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    File Path
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Detected
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors cursor-pointer ${statusRowBorder[report.status] ?? "border-l-muted-foreground"}`}
                    onClick={() => setSelectedReport(report)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedReport(report)
                      }
                    }}
                  >
                    <td className="py-3 pl-3">
                      <Bug className="h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium text-foreground">
                        {report.name}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground"
                      >
                        {report.type}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <SeverityBadge severity={report.severity} />
                    </td>
                    <td className="py-3">
                      <MalwareStatusBadge status={report.status} />
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-xs font-mono text-foreground">
                        {report.source_ip}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className="text-[10px] font-mono text-muted-foreground max-w-[200px] truncate block">
                        {report.file_path}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">
                          {format(
                            new Date(report.detected_at),
                            "MMM dd, HH:mm"
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(
                            new Date(report.detected_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredReports.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No malware reports match your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Report Detail Drawer */}
      <ReportDetailDrawer
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  )
}
