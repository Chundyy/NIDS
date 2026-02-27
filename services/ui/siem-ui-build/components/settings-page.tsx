"use client"

import { useState } from "react"
import {
  Server,
  Bell,
  Shield,
  Database,
  Globe,
  Key,
  Save,
  Loader2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

// ── Settings Section Wrapper ────────────────────────────────────────

function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-background border border-border">
            {icon}
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              {title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="pt-4">{children}</CardContent>
    </Card>
  )
}

// ── Setting Row ─────────────────────────────────────────────────────

function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 py-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm text-foreground">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

// ── Main Component ──────────────────────────────────────────────────

export function SettingsPage() {
  const [saving, setSaving] = useState(false)
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  )
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [slackNotifications, setSlackNotifications] = useState(false)
  const [criticalAlerts, setCriticalAlerts] = useState(true)
  const [highAlerts, setHighAlerts] = useState(true)
  const [mediumAlerts, setMediumAlerts] = useState(false)
  const [lowAlerts, setLowAlerts] = useState(false)
  const [autoBlock, setAutoBlock] = useState(true)
  const [autoQuarantine, setAutoQuarantine] = useState(true)
  const [retentionDays, setRetentionDays] = useState("90")
  const [refreshInterval, setRefreshInterval] = useState("30")
  const [twoFactor, setTwoFactor] = useState(false)
  const [sessionTimeout, setSessionTimeout] = useState("60")

  async function handleSave() {
    setSaving(true)
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSaving(false)
    toast.success("Settings saved successfully.")
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Settings</h2>
          <p className="text-xs text-muted-foreground">
            Configure NIDPS Sentinel system preferences and integrations.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* API Connection */}
      <SettingsSection
        icon={<Server className="h-4 w-4 text-primary" />}
        title="API Connection"
        description="Configure the connection to your FastAPI backend."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="api-url" className="text-xs text-muted-foreground">
              Backend API URL
            </Label>
            <div className="flex gap-2">
              <Input
                id="api-url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="http://localhost:8000"
                className="bg-secondary/50 border-border text-foreground font-mono text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 text-muted-foreground"
                onClick={() => {
                  toast.info(
                    "Set the NEXT_PUBLIC_API_BASE_URL environment variable to persist this across sessions."
                  )
                }}
              >
                Test
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground">
              Set via NEXT_PUBLIC_API_BASE_URL environment variable for
              production deployments.
            </p>
          </div>
          <SettingRow
            label="API Status"
            description="Current connection state to the backend"
          >
            <Badge
              variant="outline"
              className="text-xs bg-warning/15 text-warning border-warning/30"
            >
              Mock Data Mode
            </Badge>
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Notifications */}
      <SettingsSection
        icon={<Bell className="h-4 w-4 text-primary" />}
        title="Notifications"
        description="Configure how and when you receive alert notifications."
      >
        <div className="flex flex-col divide-y divide-border">
          <SettingRow
            label="Email Notifications"
            description="Receive alerts via email"
          >
            <Switch
              checked={emailNotifications}
              onCheckedChange={setEmailNotifications}
            />
          </SettingRow>
          <SettingRow
            label="Slack Notifications"
            description="Send alerts to a Slack channel"
          >
            <Switch
              checked={slackNotifications}
              onCheckedChange={setSlackNotifications}
            />
          </SettingRow>
          <Separator className="my-2" />
          <div className="pt-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Alert Level Filters
            </span>
          </div>
          <SettingRow label="Critical Alerts">
            <Switch
              checked={criticalAlerts}
              onCheckedChange={setCriticalAlerts}
            />
          </SettingRow>
          <SettingRow label="High Alerts">
            <Switch checked={highAlerts} onCheckedChange={setHighAlerts} />
          </SettingRow>
          <SettingRow label="Medium Alerts">
            <Switch
              checked={mediumAlerts}
              onCheckedChange={setMediumAlerts}
            />
          </SettingRow>
          <SettingRow label="Low Alerts">
            <Switch checked={lowAlerts} onCheckedChange={setLowAlerts} />
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Automated Response */}
      <SettingsSection
        icon={<Shield className="h-4 w-4 text-primary" />}
        title="Automated Response"
        description="Configure automatic threat containment actions."
      >
        <div className="flex flex-col divide-y divide-border">
          <SettingRow
            label="Auto-Block Malicious IPs"
            description="Automatically add confirmed attacker IPs to the firewall blocklist"
          >
            <Switch checked={autoBlock} onCheckedChange={setAutoBlock} />
          </SettingRow>
          <SettingRow
            label="Auto-Quarantine Malware"
            description="Automatically quarantine detected malware files"
          >
            <Switch
              checked={autoQuarantine}
              onCheckedChange={setAutoQuarantine}
            />
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Data & Storage */}
      <SettingsSection
        icon={<Database className="h-4 w-4 text-primary" />}
        title="Data & Storage"
        description="Manage data retention and refresh settings."
      >
        <div className="flex flex-col divide-y divide-border">
          <SettingRow
            label="Data Retention Period"
            description="Number of days to keep alert and log data"
          >
            <Select value={retentionDays} onValueChange={setRetentionDays}>
              <SelectTrigger className="w-32 bg-secondary/50 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="60">60 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">365 days</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
          <SettingRow
            label="Dashboard Refresh Interval"
            description="How often to poll the API for new data"
          >
            <Select
              value={refreshInterval}
              onValueChange={setRefreshInterval}
            >
              <SelectTrigger className="w-32 bg-secondary/50 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 seconds</SelectItem>
                <SelectItem value="30">30 seconds</SelectItem>
                <SelectItem value="60">1 minute</SelectItem>
                <SelectItem value="300">5 minutes</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Security */}
      <SettingsSection
        icon={<Key className="h-4 w-4 text-primary" />}
        title="Security"
        description="Authentication and session settings."
      >
        <div className="flex flex-col divide-y divide-border">
          <SettingRow
            label="Two-Factor Authentication"
            description="Require 2FA for all user logins"
          >
            <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
          </SettingRow>
          <SettingRow
            label="Session Timeout"
            description="Auto-logout after inactivity"
          >
            <Select
              value={sessionTimeout}
              onValueChange={setSessionTimeout}
            >
              <SelectTrigger className="w-32 bg-secondary/50 border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="480">8 hours</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </div>
      </SettingsSection>

      {/* Network Sources */}
      <SettingsSection
        icon={<Globe className="h-4 w-4 text-primary" />}
        title="Network Sources"
        description="Configure monitored network interfaces and data sources."
      >
        <div className="flex flex-col gap-3">
          {["eth0 - Production LAN", "eth1 - DMZ Segment", "wlan0 - Wireless"].map(
            (iface, i) => (
              <div
                key={iface}
                className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${i < 2 ? "bg-success" : "bg-muted-foreground"}`}
                  />
                  <span className="text-xs font-mono text-foreground">
                    {iface}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${i < 2 ? "bg-success/15 text-success border-success/30" : "bg-muted text-muted-foreground border-border"}`}
                >
                  {i < 2 ? "Active" : "Inactive"}
                </Badge>
              </div>
            )
          )}
          <p className="text-[10px] text-muted-foreground">
            To add or remove network interfaces, update the sensor configuration
            on your backend VM.
          </p>
        </div>
      </SettingsSection>

      {/* System Info */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoField label="Version" value="NIDPS Sentinel v1.0.0" />
            <InfoField label="AI Models" value="DistilBERT + Random Forest" />
            <InfoField label="Backend" value="FastAPI + Python" />
            <InfoField label="Frontend" value="Next.js + React" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  )
}
