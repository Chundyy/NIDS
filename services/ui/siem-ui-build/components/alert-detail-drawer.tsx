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
import { type Alert, categoryLabels } from "@/lib/mock-data"

function SeverityIndicator({ severity }: { severity: string }) {
  const config: Record<string, { color: string; bg: string; border: string }> = {
    CRITICAL: {
      color: "text-destructive",
      bg: "bg-destructive/15",
      border: "border-destructive/30",
    },
    HIGH: {
      color: "text-warning",
      bg: "bg-warning/15",
      border: "border-warning/30",
    },
    MEDIUM: {
      color: "text-[hsl(45,93%,47%)]",
      bg: "bg-[hsl(45,93%,47%)]/15",
      border: "border-[hsl(45,93%,47%)]/30",
    },
    LOW: {
      color: "text-primary",
      bg: "bg-primary/15",
      border: "border-primary/30",
    },
  }

  const c = config[severity] || config["LOW"]

  return (
    <Badge variant="outline" className={`${c.bg} ${c.color} ${c.border} text-xs`}>
      {severity}
    </Badge>
  )
}

interface AlertDetailDrawerProps {
  alert: Alert | null
  onClose: () => void
}

export function AlertDetailDrawer({ alert, onClose }: AlertDetailDrawerProps) {
  return (
    <Sheet open={!!alert} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border p-0 flex flex-col">
        {alert && (
          <>
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <SeverityIndicator severity={alert.severity} />
                <Badge
                  variant="secondary"
                  className="text-xs bg-secondary text-secondary-foreground"
                >
                  {categoryLabels[alert.category]}
                </Badge>
              </div>
              <SheetTitle className="text-base text-foreground mt-2 text-pretty">
                {alert.description}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Alert ID: {alert.id}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-5">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <MetaField
                    label="Timestamp"
                    value={format(
                      new Date(alert.timestamp),
                      "yyyy-MM-dd HH:mm:ss"
                    )}
                  />
                  <MetaField label="Severity" value={alert.severity} />
                  <MetaField label="Source IP" value={alert.source_ip} mono />
                  <MetaField
                    label="Destination IP"
                    value={alert.destination_ip}
                    mono
                  />
                  <MetaField
                    label="Category"
                    value={categoryLabels[alert.category]}
                  />
                  <MetaField label="Alert ID" value={alert.id} mono />
                </div>

                <Separator />

                {/* Payload */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Technical Payload
                  </h3>
                  <div className="rounded-lg border border-border bg-background p-4 overflow-x-auto">
                    <pre className="text-xs font-mono text-foreground whitespace-pre-wrap break-all leading-relaxed">
                      {alert.payload}
                    </pre>
                  </div>
                </div>

                <Separator />

                {/* AI Analysis markers */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    AI Classification
                  </h3>
                  <div className="flex flex-col gap-2">
                    <AIField label="Model" value="DistilBERT + Random Forest" />
                    <AIField
                      label="Classification"
                      value={categoryLabels[alert.category]}
                    />
                    <AIField
                      label="Severity Assessment"
                      value={alert.severity}
                    />
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

function MetaField({
  label,
  value,
  mono,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span
        className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  )
}

function AIField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xs font-medium text-foreground">{value}</span>
    </div>
  )
}
