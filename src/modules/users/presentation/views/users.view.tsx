import {Footer} from "@/core/presentation/themes/katon/footer";
import {View} from "@/core/presentation/themes/katon/view";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";
import {UsersSidePanel} from "@/modules/users/presentation/components/users-side.panel";
import {UsersDataGrid} from "@/modules/users/presentation/components/users-data-grid";
import {UsersAnalytics} from "@/modules/users/presentation/components/users-analytics";
import {Wrapper} from "@/core/presentation/themes/katon/wrapper";


export function UsersView() {
    return (
        <View>
            <Wrapper>
                <Header/>
                <Main className="flex flex-col lg:flex-row p-6 gap-6">
                    <div className="flex-auto flex flex-col">

                        <div className="flex flex-col gap-4">
                            <h1 className="text-2xl font-bold">Gestion des utilisateurs</h1>
                            <UsersAnalytics/>
                        </div>

                        <div className="flex-auto">
                            <UsersDataGrid/>
                        </div>
                    </div>

                    <UsersSidePanel/>
                </Main>
            </Wrapper>
            <Footer/>
        </View>
    )
}