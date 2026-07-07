import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/core/presentation/ui/card";
import {Empty, EmptyContent, EmptyDescription, EmptyMedia, EmptyTitle} from "@/core/presentation/ui/empty";
import {Button} from "@/core/presentation/ui/button";
import {BoxesIcon} from "lucide-react";


export function UserActivities() {
    return (
        <Card>
            <CardHeader>
                <CardDescription>Activités</CardDescription>
                <CardTitle></CardTitle>
            </CardHeader>
            <CardContent>
                <Empty>
                    <EmptyMedia>
                        <BoxesIcon size={80} strokeWidth={1} />
                    </EmptyMedia>
                    <EmptyTitle>Aucune activités</EmptyTitle>
                    <EmptyDescription>Vous n'avez encore aucune activité ici</EmptyDescription>
                    <EmptyContent>
                        <Button variant="outline">Actualiser</Button>
                    </EmptyContent>
                </Empty>
            </CardContent>
        </Card>
    )
}