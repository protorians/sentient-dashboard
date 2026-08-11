"use client"

import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@/core/presentation/themes/katon/view";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";
import {StockSidePanel} from "@/modules/stock/presentation/components/stock-side.panel";
import {StockDataGrid} from "@/modules/stock/presentation/components/stock-data-grid";
import {StockAnalyticsChart} from "@/modules/stock/presentation/components/stock-analytics-chart";
import {StockCategoriesDataGrid} from "@/modules/stock/presentation/components/stock-categories-data-grid";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {CreateProductStepper} from "@/modules/stock/presentation/components/create-product-stepper";
import {ProductCategoryStepper} from "@/modules/stock/presentation/components/product-category-stepper";
import {CreateWarehouseStepper} from "@/modules/stock/presentation/components/create-warehouse-stepper";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/core/presentation/ui/tabs";
import {LayersIcon, FolderTreeIcon} from "lucide-react";
import {AnimatedContent} from "@/core/presentation/animated-content";


export function StockView() {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row p-6 gap-6">
                    <AnimatedContent variant="container" animateChildren className="contents">
                        <div className="flex-auto flex flex-col gap-6">

                            <div className="flex flex-row items-center">
                                <div className="flex flex-row flex-auto overflow-hidden">
                                    <h1 className="text-2xl font-bold truncate text-ellipsis">Gestion des stocks</h1>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <CreateWarehouseStepper variant="outline" size="lg"/>
                                    <CreateProductStepper/>
                                    <ProductCategoryStepper/>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 min-h-[40dvh]">
                                <StockAnalyticsChart/>
                            </div>

                            <Tabs defaultValue="products" className="w-full">
                                <div className="flex flex-row items-center justify-center">
                                    <TabsList>
                                        <TabsTrigger value="products">
                                            <LayersIcon data-icon="inline-start"/>
                                            Produits
                                        </TabsTrigger>
                                        <TabsTrigger value="categories">
                                            <FolderTreeIcon data-icon="inline-start"/>
                                            Catégories
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                                <TabsContent value="products">
                                    <div className="flex-auto">
                                        <StockDataGrid/>
                                    </div>
                                </TabsContent>
                                <TabsContent value="categories">
                                    <div className="flex-auto">
                                        <StockCategoriesDataGrid/>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <StockSidePanel/>
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}
