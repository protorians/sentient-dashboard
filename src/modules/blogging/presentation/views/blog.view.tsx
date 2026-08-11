"use client"

import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@/core/presentation/themes/katon/view";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";
import {BlogSidePanel} from "@/modules/blogging/presentation/components/blog-side-panel";
import {BlogDataGrid} from "@/modules/blogging/presentation/components/blog-data-grid";
import {BlogAnalyticsChart} from "@/modules/blogging/presentation/components/blog-analytics-chart";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Button} from "@/core/presentation/ui/button";
import {PlusIcon, FolderIcon} from "lucide-react";
import {AnimatedContent} from "@/core/presentation/animated-content";
import {CreatePostStepper} from "@/modules/blogging/presentation/components/create-post-stepper";
import {ManageCategoryStepper} from "@/modules/blogging/presentation/components/manage-category-stepper";
import {useQueryClient} from "@tanstack/react-query";


export function BlogView() {
    const queryClient = useQueryClient();

    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row p-6 gap-6">
                    <AnimatedContent variant="container" animateChildren className="contents">
                        <div className="flex-auto flex flex-col">

                            <div className="flex flex-row items-center gap-2 mb-2">
                                <div className="flex flex-row flex-auto overflow-hidden">
                                    <h1 className="text-2xl font-bold truncate text-ellipsis">Blog</h1>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                    <ManageCategoryStepper>
                                        <Button variant="outline" size="sm">
                                            <FolderIcon className="size-4 mr-2"/>
                                            Catégories
                                        </Button>
                                    </ManageCategoryStepper>
                                    <CreatePostStepper>
                                        <Button size="sm">
                                            <PlusIcon className="size-4 mr-2"/>
                                            Nouvel article
                                        </Button>
                                    </CreatePostStepper>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                <BlogAnalyticsChart/>
                            </div>

                            <div className="flex-auto">
                                <BlogDataGrid/>
                            </div>
                        </div>
                        <BlogSidePanel/>
                    </AnimatedContent>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}
