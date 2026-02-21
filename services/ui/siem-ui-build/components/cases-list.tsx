"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  FolderOpen,
  Loader2,
  CheckCircle2,
  XCircle,
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
import {
  mockCases,
  type Case,
  type CaseStatus,
  type CasePriority,
  caseStatusLabels,
  casePriorityLabels,
} from "@/lib/mock-data"
import { CaseDetailDrawer } from "@/components/case-detail-drawer"
import { formatDistanceToNow, format } from "date-fns"

// ── Badge Components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: CaseStatus }) {
  const colorMap: Record<CaseStatus, string> = {
    open: "bg-destructive/15 text-destructive border-destructive/30",
    in_progress: "bg-warning/15 text-warning border-warning/30",
    resolved: "bg-success/15 text-success border-success/30",
    closed: "bg-muted text-muted-foreground border-border",
  }

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorMap[status]}`}>
      {caseStatusLabels[status]}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: CasePriority }) {
  const colorMap: Record<CasePriority, string> = {
    critical: "bg-destructive/15 text-destructive border-destructive/30",
    high: "bg-warning/15 text-warning border-warning/30",
    medium:
      "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    low: "bg-primary/15 text-primary border-primary/30",
  }

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorMap[priority]}`}>
      {casePriorityLabels[priority]}
    </Badge>
  )
}

// ── Status Icon ─────────────────────────────────────────────────────────

function StatusIcon({ status }: { status: CaseStatus }) {
  const iconMap: Record<CaseStatus, React.ReactNode> = {
    open: <FolderOpen className="h-4 w-4 text-destructive" />,
    in_progress: <Loader2 className="h-4 w-4 text-warning animate-spin" />,
    resolved: <CheckCircle2 className="h-4 w-4 text-success" />,
    closed: <XCircle className="h-4 w-4 text-muted-foreground" />,
  }

  return <>{iconMap[status]}</>
}

// ── Stat Card ───────────────────────────────────────────────────────────

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

// ── Main Component ──────────────────────────────────────────────────────

export function CasesList() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)

  const filteredCases = useMemo(() => {
    return mockCases.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false
      if (priorityFilter !== "all" && c.priority !== priorityFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.id.toLowerCase().includes(q) &&
          !c.assignee.toLowerCase().includes(q) &&
          !c.source_ips.some((ip) => ip.includes(q))
        ) {
          return false
        }
      }
      return true
    })
  }, [statusFilter, priorityFilter, searchQuery])

  // Stats
  const openCount = mockCases.filter((c) => c.status === "open").length
  const inProgressCount = mockCases.filter((c) => c.status === "in_progress").length
  const resolvedCount = mockCases.filter((c) => c.status === "resolved").length
  const closedCount = mockCases.filter((c) => c.status === "closed").length

  // Row border color by status
  const statusRowBorder: Record<CaseStatus, string> = {
    open: "border-l-destructive",
    in_progress: "border-l-warning",
    resolved: "border-l-success",
    closed: "border-l-muted-foreground",
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Open"
          count={openCount}
          icon={<FolderOpen className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          label="In Progress"
          count={inProgressCount}
          icon={<Loader2 className="h-4 w-4 text-warning" />}
        />
        <StatCard
          label="Resolved"
          count={resolvedCount}
          icon={<CheckCircle2 className="h-4 w-4 text-success" />}
        />
        <StatCard
          label="Closed"
          count={closedCount}
          icon={<XCircle className="h-4 w-4 text-muted-foreground" />}
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
                placeholder="Search by title, ID, assignee, IP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-secondary/50 border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-40 bg-secondary/50 border-border text-foreground">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== "all" ||
              priorityFilter !== "all" ||
              searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setStatusFilter("all")
                  setPriorityFilter("all")
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
        Showing {filteredCases.length} of {mockCases.length} cases
      </div>

      {/* Cases Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Investigation Cases
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground w-8" />
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Case ID
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Priority
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Title
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Assignee
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Updated
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => (
                  <tr
                    key={c.id}
                    className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors cursor-pointer ${statusRowBorder[c.status]}`}
                    onClick={() => setSelectedCase(c)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedCase(c)
                      }
                    }}
                  >
                    <td className="py-3 pl-3">
                      <StatusIcon status={c.status} />
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-mono text-foreground">
                        {c.id}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="py-3">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-xs text-foreground max-w-xs truncate block">
                        {c.title}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {c.assignee}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-xs text-foreground">
                          {format(new Date(c.updated_at), "MMM dd, HH:mm")}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(c.updated_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-mono text-muted-foreground">
                        {c.related_alert_ids.length}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredCases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No cases match your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Case Detail Drawer */}
      <CaseDetailDrawer
        caseItem={selectedCase}
        onClose={() => setSelectedCase(null)}
      />
    </div>
  )
}
