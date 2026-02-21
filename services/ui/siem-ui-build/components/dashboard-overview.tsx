"use client";

import { useEffect, useMemo, useState } from "react";
import { ShieldAlert, AlertTriangle, ShieldBan, Cpu, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { alertsApi } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
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
} from "recharts";

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type Category = "web_exploit" | "network_scan" | "brute_force" | "anomaly";

interface AlertFixed {
  id?: string;
  timestamp: string;
  severity: Severity;
  source_ip: string;
  destination_ip: string;
  category?: Category;
  description?: string;
  payload?: string;
  [key: string]: any;
}

const severityColors: Record<Severity, string> = {
  CRITICAL: "hsl(0, 72%, 51%)",
  HIGH: "hsl(25, 95%, 53%)",
  MEDIUM: "hsl(45, 93%, 47%)",
  LOW: "hsl(210, 100%, 52%)",
};

// Used for the category bar chart
const barColors = [
  "hsl(var(--primary))",
  "hsl(var(--secondary))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--accent))",
];

function normalizeSeverity(input: unknown): Severity {
  const s = String(input ?? "LOW").toUpperCase();
  if (s === "CRITICAL" || s === "HIGH" || s === "MEDIUM" || s === "LOW") return s;
  return "LOW";
}

function getAlertsByCategory(alerts: AlertFixed[]) {
  const counts: Record<Category, number> = {
    web_exploit: 0,
    network_scan: 0,
    brute_force: 0,
    anomaly: 0,
  };

  alerts.forEach((a) => {
    if (a.category && counts[a.category] !== undefined) {
      counts[a.category]++;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({
    name: name.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    value,
    category: name,
  }));
}

function getAlertsBySeverity(alerts: AlertFixed[]) {
  const counts: Record<Severity, number> = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  alerts.forEach((a) => {
    if (a.severity && counts[a.severity] !== undefined) {
      counts[a.severity]++;
    }
  });

  return Object.entries(counts).map(([name, value]) => ({ name, value }));
}

interface DashboardOverviewProps {
  onNavigateToAlerts: () => void;
}

function SeverityBadge({ severity }: { severity: Severity }) {
  const colorMap: Record<Severity, string> = {
    CRITICAL: "bg-destructive/15 text-destructive border-destructive/30",
    HIGH: "bg-warning/15 text-warning border-warning/30",
    MEDIUM:
      "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    LOW: "bg-primary/15 text-primary border-primary/30",
  };

  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colorMap[severity]}`}>
      {severity}
    </Badge>
  );
}

export function DashboardOverview({ onNavigateToAlerts }: DashboardOverviewProps) {
  const [alerts, setAlerts] = useState<AlertFixed[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    alertsApi
      .list({ limit: 100 })
      .then((data) => {
        if (cancelled) return;

        setAlerts(
          (data ?? []).map((a: any) => ({
            ...a,
            severity: normalizeSeverity(a?.severity),
            category: a?.category,
          }))
        );
        setLoading(false);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Failed to load alerts");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const categoryData = useMemo(() => getAlertsByCategory(alerts), [alerts]);
  const severityData = useMemo(() => getAlertsBySeverity(alerts), [alerts]);

  const criticalCount = useMemo(() => {
    const since = Date.now() - 24 * 60 * 60 * 1000;
    return alerts.filter(
      (a) => a.severity === "CRITICAL" && new Date(a.timestamp).getTime() > since
    ).length;
  }, [alerts]);

  const kpis = useMemo(
    () => [
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
    ],
    [alerts.length, criticalCount]
  );

  if (loading) {
    return <div className="p-6 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-destructive">{error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-foreground">Dashboard Overview</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-foreground"
          onClick={onNavigateToAlerts}
        >
          View All
          <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>

      <div className="space-y-6">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="bg-card border-border">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.title}</p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">{kpi.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{kpi.description}</p>
                  </div>
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${kpi.bgAccent}`}
                  >
                    <kpi.icon className={`h-5 w-5 ${kpi.accent}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                        <Cell key={entry.name} fill={severityColors[entry.name as Severity]} />
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
                      style={{ backgroundColor: severityColors[entry.name as Severity] }}
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

        {/* Live feed */}
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
                      key={
                        alert.id ??
                        `${alert.timestamp}-${alert.source_ip}-${alert.destination_ip}`
                      }
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={onNavigateToAlerts}
                    >
                      <td className="py-2.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
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
                        {alert.category ? alert.category.replace("_", " ") : ""}
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
    </div>
  );
}