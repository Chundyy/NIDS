"use client"

import { useState } from "react"
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
import { AlertsList } from "@/components/alerts-list"
import { PlaceholderPage } from "@/components/placeholder-page"

const pageLabels: Record<string, string> = {
  dashboard: "Dashboard",
  alerts: "Alerts",
  cases: "Cases",
  hosts: "Hosts",
  rules: "Rules",
  reports: "Reports",
  settings: "Settings",
}

export function DashboardShell() {
  const [activePage, setActivePage] = useState("dashboard")

  function renderPage() {
    switch (activePage) {
      case "dashboard":
        return <DashboardOverview onNavigateToAlerts={() => setActivePage("alerts")} />
      case "alerts":
        return <AlertsList />
      default:
        return <PlaceholderPage title={pageLabels[activePage] ?? activePage} />
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar activePage={activePage} onNavigate={setActivePage} />
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
                  {pageLabels[activePage]}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-6">
          {renderPage()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
