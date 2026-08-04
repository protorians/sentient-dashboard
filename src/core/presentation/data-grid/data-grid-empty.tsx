import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {DatabaseSearchIcon} from "lucide-react";
import {Button} from "@/core/presentation/ui/button";
import {useRouter} from "next/navigation";

export function DataGridEmpty() {
    const router = useRouter();

    return (
        <div
            className="flex-auto flex flex-col items-center justify-center min-h-[40dvh]">
            <Empty className="opacity-50">
                <EmptyMedia>
                    <DatabaseSearchIcon size={48} strokeWidth={1}/>
                </EmptyMedia>
                <EmptyTitle>Resultat</EmptyTitle>
                <EmptyDescription>Aucun resultat trouvé</EmptyDescription>
                <EmptyContent>
                    <Button variant="outline" onClick={() => router.refresh()}>Actualiser</Button>
                </EmptyContent>
            </Empty>
        </div>
    )
}