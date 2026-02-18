"use client"

import { useMemo, useState, useEffect } from "react"
import {
  ShieldAlert,
  AlertTriangle,
  ShieldBan,
  Cpu,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { fetchAlerts, type Alert } from "@/lib/api"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts"

interface DashboardOverviewProps {
  onNavigateToAlerts: () => void
}

const severityColors: Record<string, string> = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MEDIUM: "#eab308",
  LOW: "#22c55e",
}

function SeverityBadge({ severity }: { severity: string }) {
  const colorMap: Record<string, string> = {
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

export function DashboardOverview({ onNavigateToAlerts }: DashboardOverviewProps) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadAlerts = async () => {
      setIsLoading(true)
      try {
        const data = await fetchAlerts(100)
        setAlerts(data)
      } catch (error) {
        console.error("Failed to load alerts for dashboard:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadAlerts()
  }, [])

  const categoryData = useMemo(() => {
    const categories: Record<string, number> = {}
    alerts.forEach((alert) => {
      categories[alert.category] = (categories[alert.category] || 0) + 1
    })
    return Object.entries(categories)
      .map(([name, value]) => ({
        name: name.replace("_", " "),
        value,
      }))
      .sort((a, b) => b.value - a.value)
  }, [alerts])

  const severityData = useMemo(() => {
    const severities: Record<string, number> = {
      CRITICAL: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0,
    }
    alerts.forEach((alert) => {
      severities[alert.severity as keyof typeof severities] = 
        (severities[alert.severity as keyof typeof severities] || 0) + 1
    })
    return Object.entries(severities)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
      }))
  }, [alerts])

  const criticalCount = alerts.filter(
    (a) =>
      a.severity === "CRITICAL" &&
      new Date(a.timestamp).getTime() > Date.now() - 86400000
  ).length

  const kpis = [
    {
      title: "Total Alerts",
      value: alerts.length,
      icon: ShieldAlert,
      description: "All time detections",
      accent: "text-primary",
      bgAccent: "bg-primary/10",
    },
    {
      title: "Critical (24h)",
      value: criticalCount,
      icon: AlertTriangle,
      description: "Requires immediate action",
      accent: "text-destructive",
      bgAccent: "bg-destructive/10",
    },
    {
      title: "IPs Blocked",
      value: 23,
      icon: ShieldBan,
      description: "By IPS module",
      accent: "text-warning",
      bgAccent: "bg-warning/10",
    },
    {
      title: "System Load",
      value: "34%",
      icon: Cpu,
      description: "CPU utilization",
      accent: "text-success",
      bgAccent: "bg-success/10",
    },
  ]

  const barColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.title} className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-muted-foreground font-medium">
                    {kpi.title}
                  </span>
                  <span className="text-2xl font-bold text-foreground">
                    {kpi.value}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {kpi.description}
                  </span>
                </div>
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bgAccent}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Bar Chart - Alerts by Category */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Alerts by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData} barSize={40}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {categoryData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={barColors[index % barColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart - Severity */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Severity Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {severityData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={severityColors[entry.name as keyof typeof severityColors]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-3 mt-2">
              {severityData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      backgroundColor:
                        severityColors[entry.name as keyof typeof severityColors],
                    }}
                  />
                  <span className="text-[11px] text-muted-foreground">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Live Feed */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-medium text-foreground">
              Live Alert Feed
            </CardTitle>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={onNavigateToAlerts}
          >
            View All
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Time
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
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {alerts.slice(0, 6).map((alert) => (
                  <tr
                    key={alert.id}
                    className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={onNavigateToAlerts}
                  >
                    <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(alert.timestamp), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="py-2.5">
                      <SeverityBadge severity={alert.severity} />
                    </td>
                    <td className="py-2.5 text-xs font-mono text-foreground">
                      {alert.source_ip}
                    </td>
                    <td className="py-2.5 text-xs font-mono text-foreground">
                      {alert.destination_ip}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">
                      {alert.category.replace("_", " ")}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground max-w-xs truncate hidden md:table-cell">
                      {alert.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
