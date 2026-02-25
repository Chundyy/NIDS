"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

export interface RuleFormData {
  name: string
  description: string
  severity: string
  category: string
  action: string
  protocol: string
  source_ip: string
  source_port: string
  direction: string
  destination_ip: string
  destination_port: string
  message: string
}

interface RuleDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: RuleFormData) => Promise<void>
  initialData?: RuleFormData | null
  mode: "create" | "edit"
}

const defaultForm: RuleFormData = {
  name: "",
  description: "",
  severity: "MEDIUM",
  category: "web_exploit",
  action: "alert",
  protocol: "tcp",
  source_ip: "any",
  source_port: "any",
  direction: "->",
  destination_ip: "any",
  destination_port: "any",
  message: "",
}

export function RuleDialog({
  open,
  onClose,
  onSubmit,
  initialData,
  mode,
}: RuleDialogProps) {
  const [form, setForm] = useState<RuleFormData>(defaultForm)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setForm(initialData ?? defaultForm)
    }
  }, [open, initialData])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(form)
      onClose()
    } catch {
      // Error toast should be handled by parent
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="bg-card border-border sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {mode === "create" ? "Create Detection Rule" : "Edit Detection Rule"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Define a new detection rule to identify threats in network traffic."
                : "Modify the detection rule configuration."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rule-name" className="text-xs text-muted-foreground">
                Rule Name
              </Label>
              <Input
                id="rule-name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. SQL Injection Detection"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rule-desc" className="text-xs text-muted-foreground">
                Description
              </Label>
              <Textarea
                id="rule-desc"
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="What does this rule detect?"
                className="bg-secondary/50 border-border text-foreground resize-none"
                rows={3}
              />
            </div>

            {/* Severity + Category row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Severity</Label>
                <Select
                  value={form.severity}
                  onValueChange={(v) => setForm({ ...form, severity: v })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CRITICAL">Critical</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Category</Label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web_exploit">Web Exploit</SelectItem>
                    <SelectItem value="network_scan">Network Scan</SelectItem>
                    <SelectItem value="brute_force">Brute Force</SelectItem>
                    <SelectItem value="anomaly">Anomaly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Action + Protocol row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Action</Label>
                <Select
                  value={form.action}
                  onValueChange={(v) => setForm({ ...form, action: v })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alert">Alert</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="drop">Drop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-muted-foreground">Protocol</Label>
                <Select
                  value={form.protocol}
                  onValueChange={(v) => setForm({ ...form, protocol: v })}
                >
                  <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="udp">UDP</SelectItem>
                    <SelectItem value="icmp">ICMP</SelectItem>
                    <SelectItem value="ip">IP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source IP + Port row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="source-ip" className="text-xs text-muted-foreground">
                  Source IP
                </Label>
                <Input
                  id="source-ip"
                  required
                  value={form.source_ip}
                  onChange={(e) => setForm({ ...form, source_ip: e.target.value })}
                  placeholder="any"
                  className="bg-secondary/50 border-border text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="source-port" className="text-xs text-muted-foreground">
                  Source Port
                </Label>
                <Input
                  id="source-port"
                  required
                  value={form.source_port}
                  onChange={(e) => setForm({ ...form, source_port: e.target.value })}
                  placeholder="any"
                  className="bg-secondary/50 border-border text-foreground"
                />
              </div>
            </div>

            {/* Direction */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Direction</Label>
              <Select
                value={form.direction}
                onValueChange={(v) => setForm({ ...form, direction: v })}
              >
                <SelectTrigger className="bg-secondary/50 border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="->">→ (Unidirectional)</SelectItem>
                  <SelectItem value="<>">↔ (Bidirectional)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Destination IP + Port row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dest-ip" className="text-xs text-muted-foreground">
                  Destination IP
                </Label>
                <Input
                  id="dest-ip"
                  required
                  value={form.destination_ip}
                  onChange={(e) => setForm({ ...form, destination_ip: e.target.value })}
                  placeholder="any"
                  className="bg-secondary/50 border-border text-foreground"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dest-port" className="text-xs text-muted-foreground">
                  Destination Port
                </Label>
                <Input
                  id="dest-port"
                  required
                  value={form.destination_port}
                  onChange={(e) => setForm({ ...form, destination_port: e.target.value })}
                  placeholder="any"
                  className="bg-secondary/50 border-border text-foreground"
                />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="message" className="text-xs text-muted-foreground">
                Message (Alert Description)
              </Label>
              <Input
                id="message"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="e.g. Alert on example.com"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>

          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Rule" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
