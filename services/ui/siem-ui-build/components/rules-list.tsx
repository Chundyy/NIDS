"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  Search,
  Filter,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  WifiOff,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"
import { rulesApi, type Rule } from "@/lib/api"
import { categoryLabels } from "@/lib/mock-data"
import { RuleDialog, type RuleFormData } from "@/components/rule-dialog"
import { formatDistanceToNow, format } from "date-fns"

type RuleItem = Rule

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

function CategoryBadge({ category }: { category: string }) {
  const label =
    (categoryLabels as Record<string, string>)[category] ??
    category.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <Badge
      variant="secondary"
      className="text-[10px] px-1.5 py-0 bg-secondary text-secondary-foreground"
    >
      {label}
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

export function RulesList() {
  const [rules, setRules] = useState<RuleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [apiAvailable, setApiAvailable] = useState(false)
  const [severityFilter, setSeverityFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")

  // CRUD state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<"create" | "edit">("create")
  const [editingRule, setEditingRule] = useState<RuleItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RuleItem | null>(null)
  const [reloadLoading, setReloadLoading] = useState(false)

  // Fetch rules from API or fallback to mock
  const fetchRules = useCallback(async () => {
    setLoading(true)
    try {
      const data = await rulesApi.list()
      setRules(data)
      setApiAvailable(true)
    } catch {
      setRules([])
      setApiAvailable(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRules()
  }, [fetchRules])

  // Filter
  const filteredRules = useMemo(() => {
    return rules.filter((r) => {
      if (severityFilter !== "all" && r.severity !== severityFilter) return false
      if (categoryFilter !== "all" && r.category !== categoryFilter) return false
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        if (
          !r.name.toLowerCase().includes(q) &&
          !r.description.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      return true
    })
  }, [rules, severityFilter, categoryFilter, searchQuery])

  const criticalCount = rules.filter((r) => r.severity === "CRITICAL").length
  const highCount = rules.filter((r) => r.severity === "HIGH").length
  const mediumCount = rules.filter((r) => r.severity === "MEDIUM").length

  // ── CRUD handlers ────────────────────────────────────────────────────

  function openCreate() {
    setEditingRule(null)
    setDialogMode("create")
    setDialogOpen(true)
  }

  function openEdit(rule: RuleItem) {
    setEditingRule(rule)
    setDialogMode("edit")
    setDialogOpen(true)
  }

  async function handleSubmit(data: RuleFormData) {
    console.log("🔵 [UI] Submitting rule data:", data)
    if (apiAvailable) {
      try {
        if (dialogMode === "create") {
          await rulesApi.create(data)
          toast.success("Rule created successfully.")
        } else if (editingRule) {
          await rulesApi.update(editingRule.id, data)
          toast.success("Rule updated successfully.")
        }
        await fetchRules()
      } catch {
        toast.error("API error. Changes applied locally only.")
        applyLocal(data)
      }
    } else {
      applyLocal(data)
    }
  }

  function applyLocal(data: RuleFormData) {
    if (dialogMode === "create") {
      const newRule: RuleItem = {
        ...data,
        id: `${Date.now()}`,
        created_at: new Date().toISOString(),
      }
      setRules([newRule, ...rules])
      toast.success("Rule created locally (API unavailable).")
    } else if (editingRule) {
      setRules(
        rules.map((r) =>
          r.id === editingRule.id
            ? { ...r, ...data }
            : r
        )
      )
      toast.success("Rule updated locally (API unavailable).")
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    if (apiAvailable) {
      try {
        await rulesApi.delete(deleteTarget.id)
        toast.success("Rule deleted successfully.")
        await fetchRules()
      } catch {
        setRules(rules.filter((r) => r.id !== deleteTarget.id))
        toast.success("Rule deleted locally (API error).")
      }
    } else {
      setRules(rules.filter((r) => r.id !== deleteTarget.id))
      toast.success("Rule deleted locally (API unavailable).")
    }
    setDeleteTarget(null)
  }

  async function handleReload() {
    if (!apiAvailable) {
      toast.error("API unavailable. Cannot reload rules.")
      return
    }
    setReloadLoading(true)
    try {
      await rulesApi.reload()
      toast.success("Suricata rules reloaded successfully!")
    } catch (error) {
      toast.error("Failed to reload Suricata rules.")
    } finally {
      setReloadLoading(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────

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
        <span className="text-warning text-sm">API unavailable. No rules to display.</span>
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
            API unavailable. Showing local mock data. Changes will not persist.
          </span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Total Rules"
          count={rules.length}
          icon={<ShieldCheck className="h-4 w-4 text-primary" />}
        />
        <StatCard
          label="Critical"
          count={criticalCount}
          icon={<AlertTriangle className="h-4 w-4 text-destructive" />}
        />
        <StatCard
          label="High"
          count={highCount}
          icon={<ShieldCheck className="h-4 w-4 text-warning" />}
        />
        <StatCard
          label="Medium"
          count={mediumCount}
          icon={<ShieldCheck className="h-4 w-4 text-[hsl(45,93%,47%)]" />}
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
                placeholder="Search by name or description..."
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
            {(severityFilter !== "all" ||
              categoryFilter !== "all" ||
              searchQuery) && (
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

      {/* Results count + create button */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          Showing {filteredRules.length} of {rules.length} rules
        </span>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleReload}
            disabled={reloadLoading || !apiAvailable}
          >
            {reloadLoading ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-4 w-4" />
            )}
            Reload Suricata
          </Button>
          <Button size="sm" onClick={openCreate}>
            <Plus className="mr-1.5 h-4 w-4" />
            New Rule
          </Button>
        </div>
      </div>

      {/* Rules Table */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-0">
          <CardTitle className="text-sm font-medium text-foreground">
            Detection Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Rule Name
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Severity
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="pb-2 text-left text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Created
                  </th>
                  <th className="pb-2 text-right text-xs font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => {
                  const severityBorder: Record<string, string> = {
                    CRITICAL: "border-l-destructive",
                    HIGH: "border-l-warning",
                    MEDIUM: "border-l-[hsl(45,93%,47%)]",
                    LOW: "border-l-primary",
                  }

                  return (
                    <tr
                      key={rule.id}
                      className={`border-b border-border/50 border-l-2 hover:bg-accent/50 transition-colors ${severityBorder[rule.severity] ?? "border-l-muted-foreground"}`}
                    >
                      <td className="py-3">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-medium text-foreground">
                            {rule.name}
                          </span>
                          <span className="text-[10px] text-muted-foreground max-w-xs truncate hidden md:block">
                            {rule.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-3">
                        <SeverityBadge severity={rule.severity} />
                      </td>
                      <td className="py-3">
                        <CategoryBadge category={rule.category} />
                      </td>
                      <td className="py-3 hidden md:table-cell">
                        {rule.created_at && (
                          <div className="flex flex-col">
                            <span className="text-xs text-foreground">
                              {format(new Date(rule.created_at), "MMM dd, HH:mm")}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(rule.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                            onClick={() => openEdit(rule)}
                            aria-label={`Edit ${rule.name}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(rule)}
                            aria-label={`Delete ${rule.name}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filteredRules.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <p className="text-sm text-muted-foreground">
                        No rules match your filters.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <RuleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleSubmit}
        mode={dialogMode}
        initialData={
          editingRule
            ? {
                name: editingRule.name,
                description: editingRule.description,
                severity: editingRule.severity,
                category: editingRule.category,
                action: editingRule.action,
                protocol: editingRule.protocol,
                source_ip: editingRule.source_ip,
                source_port: editingRule.source_port,
                direction: editingRule.direction,
                destination_ip: editingRule.destination_ip,
                destination_port: editingRule.destination_port,
                message: editingRule.message || "",
              }
            : null
        }
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
      >
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">
              Delete Rule
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {deleteTarget?.name}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
