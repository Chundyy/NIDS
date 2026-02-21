"use client"

import { useMemo, useState } from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { DashboardOverview } from "@/components/dashboard-overview"
import AlertsList from "@/components/alerts-list"
import { CasesList } from "@/components/cases-list"
import { HostsList } from "@/components/hosts-list"
import { RulesList } from "@/components/rules-list"
import { ReportsList } from "@/components/reports-list"
import { SettingsPage } from "@/components/settings-page"

const pageLabels = {
  dashboard: "Dashboard",
  alerts: "Alerts",
  cases: "Cases",
  hosts: "Hosts",
  rules: "Rules",
  reports: "Reports",
  settings: "Settings",
} as const

type Page = keyof typeof pageLabels

export function DashboardShell() {
  const [activePage, setActivePage] = useState<Page>("dashboard")

  const content = useMemo(() => {
    switch (activePage) {
      case "dashboard":
        return <DashboardOverview onNavigateToAlerts={() => setActivePage("alerts")} />
      case "alerts":
        return <AlertsList />
      case "cases":
        return <CasesList />
      case "hosts":
        return <HostsList />
      case "rules":
        return <RulesList />
      case "reports":
        return <ReportsList />
      case "settings":
        return <SettingsPage />
      default:
        return null
    }
  }, [activePage])

  return (
    <SidebarProvider>
      <AppSidebar 
        activePage={activePage}
        onNavigate={(page: any) => setActivePage(page)} 
      />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger className="-ml-1 text-muted-foreground" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <span className="text-muted-foreground text-sm">NIDS Sentinel</span>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-foreground text-sm">
                  {pageLabels[activePage] ?? "Dashboard"}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-6">{content}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}