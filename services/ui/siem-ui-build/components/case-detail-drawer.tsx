"use client"

import { format } from "date-fns"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  type Case,
  type CaseStatus,
  type CasePriority,
  caseStatusLabels,
  casePriorityLabels,
  mockAlerts,
  categoryLabels,
} from "@/lib/mock-data"

function StatusBadge({ status }: { status: CaseStatus }) {
  const colorMap: Record<CaseStatus, string> = {
    open: "bg-destructive/15 text-destructive border-destructive/30",
    in_progress: "bg-warning/15 text-warning border-warning/30",
    resolved: "bg-success/15 text-success border-success/30",
    closed: "bg-muted text-muted-foreground border-border",
  }

  return (
    <Badge variant="outline" className={`text-xs ${colorMap[status]}`}>
      {caseStatusLabels[status]}
    </Badge>
  )
}

function PriorityBadge({ priority }: { priority: CasePriority }) {
  const colorMap: Record<CasePriority, string> = {
    critical: "bg-destructive/15 text-destructive border-destructive/30",
    high: "bg-warning/15 text-warning border-warning/30",
    medium: "bg-[hsl(45,93%,47%)]/15 text-[hsl(45,93%,47%)] border-[hsl(45,93%,47%)]/30",
    low: "bg-primary/15 text-primary border-primary/30",
  }

  return (
    <Badge variant="outline" className={`text-xs ${colorMap[priority]}`}>
      {casePriorityLabels[priority]}
    </Badge>
  )
}

interface CaseDetailDrawerProps {
  caseItem: Case | null
  onClose: () => void
}

export function CaseDetailDrawer({ caseItem, onClose }: CaseDetailDrawerProps) {
  const relatedAlerts = caseItem
    ? mockAlerts.filter((a) => caseItem.related_alert_ids.includes(a.id))
    : []

  return (
    <Sheet open={!!caseItem} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border p-0 flex flex-col">
        {caseItem && (
          <>
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <StatusBadge status={caseItem.status} />
                <PriorityBadge priority={caseItem.priority} />
              </div>
              <SheetTitle className="text-base text-foreground mt-2 text-pretty">
                {caseItem.title}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {caseItem.id} &middot; Assigned to{" "}
                <span className="text-foreground">{caseItem.assignee}</span>
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-5">
                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-4">
                  <MetaField
                    label="Created"
                    value={format(new Date(caseItem.created_at), "yyyy-MM-dd HH:mm")}
                  />
                  <MetaField
                    label="Last Updated"
                    value={format(new Date(caseItem.updated_at), "yyyy-MM-dd HH:mm")}
                  />
                  <MetaField label="Assignee" value={caseItem.assignee} />
                  <MetaField
                    label="Related Alerts"
                    value={String(caseItem.related_alert_ids.length)}
                  />
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-foreground leading-relaxed">
                    {caseItem.description}
                  </p>
                </div>

                <Separator />

                {/* Source IPs & Affected Hosts */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Source IPs
                    </h3>
                    <div className="flex flex-col gap-1">
                      {caseItem.source_ips.map((ip) => (
                        <span key={ip} className="text-xs font-mono text-foreground">
                          {ip}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                      Affected Hosts
                    </h3>
                    <div className="flex flex-col gap-1">
                      {caseItem.affected_hosts.map((host) => (
                        <span key={host} className="text-xs font-mono text-foreground">
                          {host}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Related Alerts */}
                {relatedAlerts.length > 0 && (
                  <>
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Related Alerts
                      </h3>
                      <div className="flex flex-col gap-2">
                        {relatedAlerts.map((alert) => (
                          <div
                            key={alert.id}
                            className="rounded-md border border-border bg-background p-3"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-mono text-muted-foreground">
                                {alert.id}
                              </span>
                              <Badge
                                variant="secondary"
                                className="text-[10px] bg-secondary text-secondary-foreground"
                              >
                                {categoryLabels[alert.category]}
                              </Badge>
                            </div>
                            <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                              {alert.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Investigation Notes */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Investigation Notes
                  </h3>
                  <div className="flex flex-col gap-2">
                    {caseItem.notes.map((note, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 rounded-md border border-border bg-background px-3 py-2"
                      >
                        <span className="text-[10px] font-mono text-muted-foreground mt-0.5 shrink-0">
                          #{i + 1}
                        </span>
                        <p className="text-xs text-foreground leading-relaxed">
                          {note}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

function MetaField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-sm text-foreground">{value}</span>
    </div>
  )
}
