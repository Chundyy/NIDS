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
import { Progress } from "@/components/ui/progress"
import { type Host, type HostStatus, hostStatusLabels } from "@/lib/mock-data"

function StatusBadge({ status }: { status: HostStatus }) {
  const colorMap: Record<HostStatus, string> = {
    online: "bg-success/15 text-success border-success/30",
    offline: "bg-muted text-muted-foreground border-border",
    compromised: "bg-destructive/15 text-destructive border-destructive/30",
    quarantined: "bg-warning/15 text-warning border-warning/30",
  }

  return (
    <Badge variant="outline" className={`text-xs ${colorMap[status]}`}>
      {hostStatusLabels[status]}
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
      <span className={`text-sm text-foreground ${mono ? "font-mono" : ""}`}>
        {value}
      </span>
    </div>
  )
}

function UsageBar({ label, value }: { label: string; value: number }) {
  const color =
    value > 80
      ? "bg-destructive"
      : value > 50
        ? "bg-warning"
        : "bg-success"

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="text-xs font-mono text-foreground">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

interface HostDetailDrawerProps {
  host: Host | null
  onClose: () => void
}

export function HostDetailDrawer({ host, onClose }: HostDetailDrawerProps) {
  return (
    <Sheet open={!!host} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg bg-card border-border p-0 flex flex-col">
        {host && (
          <>
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center gap-3">
                <StatusBadge status={host.status} />
                <Badge
                  variant="secondary"
                  className="text-xs bg-secondary text-secondary-foreground"
                >
                  {host.os}
                </Badge>
              </div>
              <SheetTitle className="text-base text-foreground mt-2">
                {host.hostname}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {host.ip} / {host.mac}
              </SheetDescription>
            </SheetHeader>
            <Separator />
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="flex flex-col gap-5">
                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4">
                  <MetaField label="Hostname" value={host.hostname} />
                  <MetaField label="IP Address" value={host.ip} mono />
                  <MetaField label="MAC Address" value={host.mac} mono />
                  <MetaField label="Operating System" value={host.os} />
                  <MetaField
                    label="Last Seen"
                    value={format(new Date(host.last_seen), "yyyy-MM-dd HH:mm:ss")}
                  />
                  <MetaField
                    label="Alerts"
                    value={String(host.alerts_count)}
                  />
                </div>

                <Separator />

                {/* Resource Usage */}
                {(host.status === "online" || host.status === "compromised") && (
                  <div>
                    <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                      Resource Usage
                    </h3>
                    <div className="flex flex-col gap-3">
                      <UsageBar label="CPU" value={host.cpu_usage} />
                      <UsageBar label="Memory" value={host.memory_usage} />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <MetaField
                        label="Network In"
                        value={host.network_in}
                        mono
                      />
                      <MetaField
                        label="Network Out"
                        value={host.network_out}
                        mono
                      />
                    </div>
                  </div>
                )}

                {(host.status === "online" || host.status === "compromised") && (
                  <Separator />
                )}

                {/* Open Ports */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Open Ports
                  </h3>
                  {host.open_ports.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {host.open_ports.map((port) => (
                        <Badge
                          key={port}
                          variant="outline"
                          className="font-mono text-xs bg-background text-foreground border-border"
                        >
                          {port}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No open ports detected.
                    </p>
                  )}
                </div>

                <Separator />

                {/* Services */}
                <div>
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Running Services
                  </h3>
                  {host.services.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {host.services.map((svc) => (
                        <Badge
                          key={svc}
                          variant="secondary"
                          className="text-xs bg-secondary text-secondary-foreground"
                        >
                          {svc}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No services detected.
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
