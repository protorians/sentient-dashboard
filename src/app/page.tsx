import {AuthConfig} from "@/core/domain/config/auth.config";
import {redirect} from "next/navigation";
import {Fragment} from "react";
import {Waiting} from "@/core/presentation/waiting";

export default function Page() {
    redirect(`${AuthConfig.routes.login}`);
    return <Fragment>
        <Waiting label={"Chargement"} />
    </Fragment>;
}
