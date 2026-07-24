import {View} from "@/core/presentation/themes/katon/view";
import {Header} from "@/core/presentation/themes/katon/header";
import {Main} from "@/core/presentation/themes/katon/main";


export default function Page() {

    return (
        <View>
            <Header/>
            <Main className="">
                main
            </Main>
            <footer>
                footer
            </footer>
        </View>
    )

}