import {AppSidebar} from "@/core/presentation/app-sidebar"
import {ChartAreaInteractive} from "@/core/presentation/chart-area-interactive"
import {DataTable} from "@/core/presentation/data-table"
import {SectionCards} from "@/core/presentation/section-cards"
import {DashboardHeader} from "@/core/presentation/dashboard-header"
import {SidebarInset, SidebarProvider} from "@/core/presentation/ui/sidebar"

import data from "./data.json"
import {SectionModuleDetails} from "@/core/presentation/section-module-details";
import { UserActivities } from "@/core/presentation/user-activities"

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
            <AppSidebar variant="inset"/>
            <SidebarInset>
                <DashboardHeader/>
                <div className="flex flex-1 flex-col p-4 lg:p-6">
                    <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 md:gap-6">
                            <div className="lg:col-span-4 lg:order-first flex flex-col gap-6">
                                <SectionModuleDetails
                                    title={"Informations générales"}
                                    statistical={{
                                        label: "test",
                                        amount: 1000,
                                        devise: "XOF",
                                        trend: 90,
                                        description: "Description"
                                    }}
                                ></SectionModuleDetails>

                                <UserActivities/>
                            </div>
                            <div className="lg:col-span-8 lg:order-last flex flex-col gap-4 md:gap-6">
                                <SectionCards
                                    className="px-0 lg:px-0 grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-2"/>
                                <ChartAreaInteractive/>
                                <DataTable data={data}/>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
