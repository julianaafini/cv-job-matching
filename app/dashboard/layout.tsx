import type React from "react"
import { AppHeader } from "@/components/app-header"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900/50">
      <AppHeader />
      <main className="flex-1">
        <div className="container p-4 md:p-6">
          <Suspense fallback={<div className="p-4">Loading dashboard content...</div>}>{children}</Suspense>
        </div>
      </main>
    </div>
  )
}
