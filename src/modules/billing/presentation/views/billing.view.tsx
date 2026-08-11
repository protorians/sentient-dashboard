"use client"

import {Footer} from "@/core/presentation/themes/katon/footer"
import {View} from "@/core/presentation/themes/katon/view"
import {Header} from "@/core/presentation/themes/katon/header"
import {Main} from "@/core/presentation/themes/katon/main"
import {Wrapper} from "@/core/presentation/themes/katon/wrapper"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs"
import {CreditCardIcon, PackageIcon, FileTextIcon} from "lucide-react"
import {AnimatedContent} from "@/core/presentation/animated-content"
import {BillingAnalyticsChart} from "@/modules/billing/presentation/components/billing-analytics-chart"
import {PaymentMethodsDataGrid} from "@/modules/billing/presentation/components/payment-methods-data-grid"
import {OrdersDataGrid} from "@/modules/billing/presentation/components/orders-data-grid"
import {InvoicesDataGrid} from "@/modules/billing/presentation/components/invoices-data-grid"
import {CreateOrderStepper} from "@/modules/billing/presentation/components/create-order-stepper"
import {CreateInvoiceStepper} from "@/modules/billing/presentation/components/create-invoice-stepper"
import {CreatePaymentMethodStepper} from "@/modules/billing/presentation/components/create-payment-method-stepper"
import {useQuery, useQueryClient} from "@tanstack/react-query"
import {BillingApiService} from "@/modules/billing/application/service/billing-api-service"
import {OrderInterface} from "@/modules/billing/domain/order.interface"

export function BillingView() {
    const queryClient = useQueryClient()

    const {data: orders} = useQuery<OrderInterface[]>({
        queryKey: ['billing', 'orders', 'view'],
        queryFn: async () => {
            const response = await BillingApiService.getOrders()
            const raw = response.data?.data
            return Array.isArray(raw) ? raw : (raw?.data ?? [])
        },
        staleTime: 30_000,
    })

    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col p-6 gap-6">
                    <AnimatedContent variant="container" animateChildren className="contents">
                        <div className="flex flex-col gap-6">

                            <div className="flex flex-row items-center">
                                <div className="flex flex-row flex-auto overflow-hidden">
                                    <h1 className="text-2xl font-bold truncate text-ellipsis">Facturation</h1>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <CreatePaymentMethodStepper variant="outline" size="lg"/>
                                    <CreateOrderStepper queryClient={queryClient} variant="outline" size="lg"/>
                                    <CreateInvoiceStepper queryClient={queryClient} orders={orders ?? []}/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <BillingAnalyticsChart/>
                            </div>

                            <Tabs defaultValue="invoices" className="w-full">
                                <div className="flex flex-row items-center justify-center">
                                    <TabsList>
                                        <TabsTrigger value="invoices">
                                            <FileTextIcon data-icon="inline-start"/>
                                            Factures
                                        </TabsTrigger>
                                        <TabsTrigger value="orders">
                                            <PackageIcon data-icon="inline-start"/>
                                            Commandes
                                        </TabsTrigger>
                                        <TabsTrigger value="payment-methods">
                                            <CreditCardIcon data-icon="inline-start"/>
                                            Paiements
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="invoices">
                                    <InvoicesDataGrid/>
                                </TabsContent>
                                <TabsContent value="orders">
                                    <OrdersDataGrid/>
                                </TabsContent>
                                <TabsContent value="payment-methods">
                                    <PaymentMethodsDataGrid/>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}
