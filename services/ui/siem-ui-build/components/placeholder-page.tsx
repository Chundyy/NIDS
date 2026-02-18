"use client"

import { Construction } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface PlaceholderPageProps {
  title: string
}

export function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Card className="bg-card border-border">
      <CardContent className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-secondary">
          <Construction className="h-7 w-7 text-muted-foreground" />
        </div>
        <div className="text-center">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            This section is under development. Connect your API to enable this feature.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
