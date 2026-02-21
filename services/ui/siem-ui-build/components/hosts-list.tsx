"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Filter,
  Monitor,
  MonitorOff,
  ShieldAlert,
  ShieldBan,
  AlertTriangle,
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
  mockHosts,
  type Host,
  type HostStatus,
  hostStatusLabels,
} from "@/lib/mock-data"
import { HostDetailDrawer } from "@/components/host-detail-drawer"
import { formatDistanceToNow } from "date-fns"

// ── Badge Components ────────────────────────────────────────────────────

function StatusBadge({ status }: { status: HostStatus }) {
  const colorMap: Record<HostStatus, string> = {
    online: "bg-success/15 text-success border-success/30",
    offline: "bg-muted text-muted-foreground border-border",
    compromised: "bg-destructive/15 text-destructive border-destructive/30",
    quarantined: "bg-warning/15 text-warning border-warning/30",
  }

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorMap[status]}`}>
      {hostStatusLabels[status]}
    </Badge>
  )
}

function StatusDot({ status }: { status: HostStatus }) {
  const colorMap: Record<HostStatus, string> = {
    online: "bg-success",
    offline: "bg-muted-foreground",
    compromised: "bg-destructive",
    quarantined: "bg-warning",
  }

  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${colorMap[status]} ${status === "online" ? "animate-pulse" : ""}`}
    />
  )
}

// ── Usage Bar (compact) ─────────────────────────────────────────────

function MiniUsageBar({ value, label }: { value: number; label: string }) {
  const color =
    value > 80
      ? "bg-destructive"
      : value > 50
        ? "bg-warning"
        : "bg-success"

  return (
    <div className="flex items-center gap-2 min-w-[100px]">
      <span className="text-[10px] text-muted-foreground w-8">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-secondary">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
        {value}%
      </span>
    </div>
  )
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

export function HostsList() {
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedHost, setSelectedHost] = useState<Host | null>(null)

  const filteredHosts = useMemo(() => {
    return mockHosts.filter((h) => {
      if (statusFilter !== "all" && h.status !== statusFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !h.hostname.toLowerCase().includes(q) &&
          !h.ip.includes(q) &&
          !h.os.toLowerCase().includes(q) &&
          !h.mac.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [statusFilter, searchQuery])

  const onlineCount = mockHosts.filter((h) => h.status === "online").length
  const offlineCount = mockHosts.filter((h) => h.status === "offline").length
  const compromisedCount = mockHosts.filter((h) => h.status === "compromised").length
  const quarantinedCount = mockHosts.filter((h) => h.status === "quarantined").length

  const statusRowBorder: Record<HostStatus, string> = {
    online: "border-l-success",
    offline: "border-l-muted-foreground",
    compromised: "border-l-destructive",
    quarantined: "border-l-warning",
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Online"
          count={onlineCount}
          icon={<Monitor className="h-4 w-4 text-success" />}
        />
        <StatCard
          label="Offline"
          count={offlineCount}
          icon={<MonitorOff className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          label="Compromised"
          count={compromisedCount}
          icon={<ShieldAlert className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          label="Quarantined"
          count={quarantinedCount}
          icon={<ShieldBan className="h-4 w-4 text-warning" />}
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
                placeholder="Search by hostname, IP, OS, MAC..."
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
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="compromised">Compromised</SelectItem>
                <SelectItem value="quarantined">Quarantined</SelectItem>
              </SelectContent>
            </Select>
            {(statusFilter !== "all" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
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
        Showing {filteredHosts.length} of {mockHosts.length} hosts
      </div>

      {/* Hosts Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-foreground">
              Network Hosts
            </CardTitle>
            {compromisedCount > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>
                  {compromisedCount} compromised host{compromisedCount > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground w-8" />
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Hostname
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    IP Address
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    OS
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Resources
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Last Seen
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Alerts
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHosts.map((host) => (
                  <tr
                    key={host.id}
                    className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors cursor-pointer ${statusRowBorder[host.status]}`}
                    onClick={() => setSelectedHost(host)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault()
                        setSelectedHost(host)
                      }
                    }}
                  >
                    <td className="py-3 pl-3">
                      <StatusDot status={host.status} />
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-medium text-foreground">
                        {host.hostname}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-xs font-mono text-foreground">
                        {host.ip}
                      </span>
                    </td>
                    <td className="py-3">
                      <StatusBadge status={host.status} />
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {host.os}
                      </span>
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      {host.status === "online" || host.status === "compromised" ? (
                        <div className="flex flex-col gap-1">
                          <MiniUsageBar label="CPU" value={host.cpu_usage} />
                          <MiniUsageBar label="MEM" value={host.memory_usage} />
                        </div>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">--</span>
                      )}
                    </td>
                    <td className="py-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(host.last_seen), {
                          addSuffix: true,
                        })}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-mono ${host.alerts_count > 0 ? "text-warning" : "text-muted-foreground"}`}
                      >
                        {host.alerts_count}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredHosts.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No hosts match your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Host Detail Drawer */}
      <HostDetailDrawer
        host={selectedHost}
        onClose={() => setSelectedHost(null)}
      />
    </div>
  )
}
