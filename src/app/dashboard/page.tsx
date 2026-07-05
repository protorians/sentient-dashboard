import { AppSidebar } from "@/core/presentation/app-sidebar"
import { ChartAreaInteractive } from "@/core/presentation/chart-area-interactive"
import { DataTable } from "@/core/presentation/data-table"
import { SectionCards } from "@/core/presentation/section-cards"
import { SiteHeader } from "@/core/presentation/site-header"
import { SidebarInset, SidebarProvider } from "@/core/presentation/ui/sidebar"

import data from "./data.json"

export default function Page() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-6">
              <div className="lg:col-span-8">
                <ChartAreaInteractive />
              </div>
              <div className="lg:col-span-4">
                <SectionCards className="px-0 lg:px-0 grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-1" />
              </div>
              <div className="lg:col-span-12">
                <DataTable data={data} />
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
