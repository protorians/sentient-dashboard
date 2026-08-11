import * as React from "react"
import {View} from "@/core/presentation/themes/katon/view";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";
import {Footer} from "@/core/presentation/themes/katon/footer";
import {DashboardModulesWidgets} from "@/modules/dashboard/presentation/components/dashboard-modules-widgets";
import DashboardSidePanel from "@/modules/dashboard/presentation/components/dashboard-side-panel";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {AnimatedContent} from "@/core/presentation/animated-content";

export function DashboardView() {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="w-full flex flex-col lg:flex-row p-6 gap-6">
                    <AnimatedContent variant="container" className="contents" >
                        <DashboardModulesWidgets/>
                        <DashboardSidePanel/>
                    </AnimatedContent>
                </Main>
                <Footer/>
            </Wrapper>
        </View>
    )
}
