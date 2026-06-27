import {redirect} from "next/navigation";
import {Fragment} from "react";
import {Waiting} from "@/core/presentation/Waiting";

export default function Page() {
    redirect("/auth/sign-in");
    return <Fragment>
        <Waiting label={"Chargement"} />
    </Fragment>;
}
