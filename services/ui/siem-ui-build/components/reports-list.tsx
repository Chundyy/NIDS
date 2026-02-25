"use client"

import { useState, useMemo, useCallback, useEffect, type ReactNode } from "react"
import {
  Search,
  Filter,
  Bug,
  ShieldAlert,
  ShieldCheck,
  ShieldBan,
  Loader2,
  WifiOff,
  Download,
  RefreshCw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { malwareApi, reportsApi, type MalwareReport, type DailyReport } from "@/lib/api"
import { ReportDetailDrawer } from "@/components/report-detail-drawer"
import { formatDistanceToNow, format } from "date-fns"

type ReportItem = MalwareReport

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
    CRITICAL: "bg-destructive/15 text-destructive border-destructive/30",
    HIGH: "bg-warning/15 text-warning border-warning/30",
    MEDIUM:
      "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    LOW: "bg-primary/15 text-primary border-primary/30",
  }

  return (
    <Badge
      variant="outline"
      className={`text-[10px] px-1.5 py-0 ${
        colorMap[severity] ?? "bg-muted text-muted-foreground border-border"
      }`}
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
      className={`text-[10px] px-1.5 py-0 ${
        colorMap[status] ?? "bg-muted text-muted-foreground border-border"
      }`}
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
  icon: ReactNode
}) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background border border-border">
          {icon}
        </div>
        <div className="flex flex-col">
          <span className="text-xl font-bold text-foreground tabular-nums">{count}</span>
          <span className="text-[11px] text-muted-foreground">{label}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function ReportsList() {
  const [reports, setReports] = useState<ReportItem[]>([])
  const [dailyReports, setDailyReports] = useState<DailyReport[]>([])
  const [loading, setLoading] = useState(true)
  const [dailyLoading, setDailyLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    try {
      const data = await malwareApi.list()
      setReports(data ?? [])
      setApiAvailable(true)
    } catch {
      setReports([])
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchDailyReports = useCallback(async () => {
    setDailyLoading(true)
    try {
      const data = await reportsApi.list()
      setDailyReports(data ?? [])
    } catch {
      setDailyReports([])
    } finally {
      setDailyLoading(false)
    }
  }, [])

  const handleGenerateReport = useCallback(async () => {
    setGeneratingReport(true)
    try {
      await reportsApi.generate()
      await fetchDailyReports()
    } catch (error) {
      console.error("Failed to generate report:", error)
    } finally {
      setGeneratingReport(false)
    }
  }, [fetchDailyReports])

  useEffect(() => {
    fetchReports()
    fetchDailyReports()
  }, [fetchReports, fetchDailyReports])

  const filteredReports = useMemo(() => {
    return reports.filter((r: any) => {
      if (severityFilter !== "all" && r.severity !== severityFilter) return false
      if (statusFilter !== "all" && r.status !== statusFilter) return false

      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !String(r.name ?? "").toLowerCase().includes(q) &&
          !String(r.hash ?? "").toLowerCase().includes(q) &&
          !String(r.type ?? "").toLowerCase().includes(q) &&
          !String(r.source_ip ?? "").toLowerCase().includes(q) &&
          !String(r.file_path ?? "").toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [reports, severityFilter, statusFilter, searchQuery])

  const activeCount = reports.filter((r: any) => r.status === "active").length
  const quarantinedCount = reports.filter((r: any) => r.status === "quarantined").length
  const removedCount = reports.filter((r: any) => r.status === "removed").length

  const statusRowBorder: Record<string, string> = {
    active: "border-l-destructive",
    quarantined: "border-l-warning",
    removed: "border-l-success",
  }

  if (loading && dailyLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const showApiWarning = !apiAvailable

  return (
    <Tabs defaultValue="malware" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="malware">Malware Detection Reports</TabsTrigger>
        <TabsTrigger value="daily">Daily Analysis Reports</TabsTrigger>
      </TabsList>

      {/* ── Malware Reports Tab ── */}
      <TabsContent value="malware" className="space-y-4 mt-4">
    <div className="flex flex-col gap-4">
      {showApiWarning && (
        <div className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/5 px-4 py-2.5">
          <WifiOff className="h-4 w-4 text-warning" />
          <span className="text-xs text-warning">
            API unavailable. No malware reports to display.
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

            {(severityFilter !== "all" || statusFilter !== "all" || searchQuery) && (
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

      <div className="text-xs text-muted-foreground">
        Showing {filteredReports.length} of {reports.length} malware reports
      </div>

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
                {filteredReports.map((report: any) => (
                  <tr
                    key={
                      report.id ??
                      `${report.hash ?? "nohash"}-${report.detected_at ?? "nodate"}`
                    }
                    className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors cursor-pointer ${
                      statusRowBorder[report.status] ?? "border-l-muted-foreground"
                    }`}
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
                          {format(new Date(report.detected_at), "MMM dd, HH:mm")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(report.detected_at), {
                            addSuffix: true,
                          })}
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

      <ReportDetailDrawer report={selectedReport} onClose={() => setSelectedReport(null)} />
        </div>
      </TabsContent>

      {/* ── Daily Reports Tab ── */}
      <TabsContent value="daily" className="space-y-4 mt-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Daily Analysis Reports</h3>
            <Button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              size="sm"
              className="gap-2"
            >
              {generatingReport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Generate Today's Report
                </>
              )}
            </Button>
          </div>

          {dailyLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : dailyReports.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-12 text-center">
                <p className="text-sm text-muted-foreground">No daily reports available yet.</p>
                <p className="text-xs text-muted-foreground mt-1">Click "Generate Today's Report" to create one.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {dailyReports.map((report) => (
                <Card key={report.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-foreground">
                            {format(new Date(report.report_date), "MMMM dd, yyyy")}
                          </h4>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {formatDistanceToNow(new Date(report.report_date), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{report.summary}</p>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary" className="text-xs">
                            Total: {report.total_threats}
                          </Badge>
                          {report.critical_count > 0 && (
                            <Badge className="text-xs bg-destructive/15 text-destructive border-destructive/30">
                              Critical: {report.critical_count}
                            </Badge>
                          )}
                          {report.high_count > 0 && (
                            <Badge className="text-xs bg-warning/15 text-warning border-warning/30">
                              High: {report.high_count}
                            </Badge>
                          )}
                          {report.medium_count > 0 && (
                            <Badge className="text-xs bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30">
                              Medium: {report.medium_count}
                            </Badge>
                          )}
                          {report.low_count > 0 && (
                            <Badge className="text-xs bg-primary/15 text-primary border-primary/30">
                              Low: {report.low_count}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2 whitespace-nowrap"
                          onClick={() => reportsApi.downloadHTML(report.id)}
                        >
                          <Download className="h-4 w-4" />
                          HTML
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-2 whitespace-nowrap"
                          onClick={() => reportsApi.download(report.id)}
                        >
                          JSON
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}