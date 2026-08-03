import {HeaderTasksConnectedUser} from "@/core/presentation/themes/katon/header-tasks-connected-user";
import Link from "next/link";
import {BellDot} from "lucide-react";
import {ThemeSwitcherButton} from "@/core/presentation/ThemeSwitcherButton";

export function HeaderOptions() {
    return (
        <div className="flex flex-row items-center justify-center gap-1">
            <Link href={'/notifications'}>
                <BellDot/>
            </Link>
            <ThemeSwitcherButton/>
            <HeaderTasksConnectedUser/>
        </div>
    )
}