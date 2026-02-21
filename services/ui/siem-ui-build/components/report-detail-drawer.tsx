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
import { type MockMalwareReport } from "@/lib/mock-data"
import { type MalwareReport } from "@/lib/api"

type Report = MockMalwareReport | MalwareReport

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
      className={`text-xs ${colorMap[severity] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {severity}
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: "bg-destructive/15 text-destructive border-destructive/30",
    quarantined: "bg-warning/15 text-warning border-warning/30",
    removed: "bg-success/15 text-success border-success/30",
  }

  return (
    <Badge
      variant="outline"
      className={`text-xs ${colorMap[status] ?? "bg-muted text-muted-foreground border-border"}`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
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
      <span className={`text-sm text-foreground break-all ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  )
}

interface ReportDetailDrawerProps {
  report: Report | null
  onClose: () => void
}

export function ReportDetailDrawer({
  report,
  onClose,
}: ReportDetailDrawerProps) {
  return (
    <Sheet open={!!report} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border p-0 flex flex-col">
        {report && (
          <>
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <SeverityBadge severity={report.severity} />
                <StatusBadge status={report.status} />
                <Badge
                  variant="secondary"
                  className="text-xs bg-secondary text-secondary-foreground"
                >
                  {report.type}
                </Badge>
              </div>
              <SheetTitle className="text-base text-foreground mt-2">
                {report.name}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Malware Report #{report.id}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-5">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <MetaField
                    label="Detected At"
                    value={format(
                      new Date(report.detected_at),
                      "yyyy-MM-dd HH:mm:ss"
                    )}
                  />
                  <MetaField label="Source IP" value={report.source_ip} mono />
                  <MetaField label="Type" value={report.type} />
                  <MetaField label="Status" value={report.status} />
                </div>

                <Separator />

                {/* File Info */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    File Information
                  </h3>
                  <div className="flex flex-col gap-3">
                    <MetaField label="File Path" value={report.file_path} mono />
                    <MetaField label="Hash (MD5)" value={report.hash} mono />
                  </div>
                </div>

                <Separator />

                {/* Description */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Analysis
                  </h3>
                  <div className="rounded-lg border border-border bg-background p-4">
                    <p className="text-xs text-foreground leading-relaxed">
                      {report.description}
                    </p>
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
