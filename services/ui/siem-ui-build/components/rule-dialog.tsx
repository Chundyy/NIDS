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
  content?: string
  nocase?: boolean
  dns_query?: boolean
  http_uri?: boolean
  http_method?: boolean
  rule_options?: string
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
  content: "",
  nocase: false,
  dns_query: false,
  http_uri: false,
  http_method: false,
  rule_options: "",
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
      // Merge initialData with defaultForm to ensure all fields have values
      setForm({ ...defaultForm, ...initialData })
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
                <Label htmlFor="category" className="text-xs text-muted-foreground">Category</Label>
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
                    <SelectItem value="trojan">Trojan</SelectItem>
                    <SelectItem value="malware">Malware</SelectItem>
                    <SelectItem value="dos">DoS Attack</SelectItem>
                    <SelectItem value="ddos">DDoS Attack</SelectItem>
                    <SelectItem value="policy-violation">Policy Violation</SelectItem>
                    <SelectItem value="protocol-command-decode">Protocol Command</SelectItem>
                    <SelectItem value="bad-unknown">Bad/Unknown</SelectItem>
                    <SelectItem value="attempted-recon">Reconnaissance</SelectItem>
                    <SelectItem value="attempted-dos">Attempted DoS</SelectItem>
                    <SelectItem value="attempted-admin">Admin Attempt</SelectItem>
                    <SelectItem value="successful-admin">Successful Admin</SelectItem>
                    <SelectItem value="misc-activity">Misc Activity</SelectItem>
                    <SelectItem value="misc-attack">Misc Attack</SelectItem>
                    <SelectItem value="web-application-attack">Web App Attack</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground">
                  Ou edite manualmente no campo abaixo se precisar de uma categoria customizada
                </p>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="custom_category"
                  className="bg-secondary/50 border-border text-foreground text-xs"
                />
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
                    <SelectItem value="dns">DNS</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="tls">TLS</SelectItem>
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

            {/* Advanced Options */}
            <div className="border-t border-border pt-3 mt-2">
              <Label className="text-xs text-muted-foreground font-semibold">
                Advanced Suricata Options (Optional)
              </Label>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content" className="text-xs text-muted-foreground">
                Content (text to match)
              </Label>
              <Input
                id="content"
                value={form.content || ""}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="e.g. example.com"
                className="bg-secondary/50 border-border text-foreground"
              />
            </div>

            {/* Checkboxes row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="nocase"
                  checked={form.nocase || false}
                  onChange={(e) => setForm({ ...form, nocase: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="nocase" className="text-xs text-muted-foreground cursor-pointer">
                  Case Insensitive (nocase)
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="dns_query"
                  checked={form.dns_query || false}
                  onChange={(e) => setForm({ ...form, dns_query: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="dns_query" className="text-xs text-muted-foreground cursor-pointer">
                  DNS Query
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="http_uri"
                  checked={form.http_uri || false}
                  onChange={(e) => setForm({ ...form, http_uri: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="http_uri" className="text-xs text-muted-foreground cursor-pointer">
                  HTTP URI
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="http_method"
                  checked={form.http_method || false}
                  onChange={(e) => setForm({ ...form, http_method: e.target.checked })}
                  className="h-4 w-4"
                />
                <Label htmlFor="http_method" className="text-xs text-muted-foreground cursor-pointer">
                  HTTP Method
                </Label>
              </div>
            </div>

            {/* Custom Rule Options */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rule_options" className="text-xs text-muted-foreground">
                Custom Options (advanced)
              </Label>
              <Textarea
                id="rule_options"
                value={form.rule_options || ""}
                onChange={(e) => setForm({ ...form, rule_options: e.target.value })}
                placeholder='e.g. classtype:trojan-activity; reference:url,example.com'
                className="bg-secondary/50 border-border text-foreground resize-none"
                rows={2}
              />
              <p className="text-[10px] text-muted-foreground">
                Additional Suricata rule options separated by semicolons
              </p>
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
