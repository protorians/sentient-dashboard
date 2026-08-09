import React from "react";
import {View} from "@/core/presentation/themes/katon/view";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";

export default function BeverageSalesLayout({children}: { children: React.ReactNode }) {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row px-6 gap-6">
                    {children}
                </Main>
            </Wrapper>
        </View>
    );
}
