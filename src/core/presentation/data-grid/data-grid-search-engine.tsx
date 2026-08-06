import {Table} from "@tanstack/react-table";
import {SearchIcon, XIcon} from "lucide-react";
import {Button} from "@/core/presentation/ui/button";


export interface DataGridSearchEngineProps<TData> {
    table: Table<TData>;
    value?: string;
    onChange?: (value: string) => void;
}

export function DataGridSearchEngine<TData>({table, value, onChange}: DataGridSearchEngineProps<TData>) {
    return (
        <div className="flex-auto flex flex-row items-center gap-2 rounded-full bg-foreground/5 text-foreground  focus-within:bg-primary/10 focus-within:text-primary transition-all px-3 py-1.5">
            <SearchIcon className={'size-5'}/>
            <input
                className="flex-auto focus:outline-none"
                type="search"
                placeholder="Recherche..."
                value={value}
                onChange={event => onChange?.(event.target.value)}
            />
            <Button
                variant="ghost"
                className="p-0! hover:bg-transparent"
                onClick={() => onChange?.('')}
            >
                <XIcon className={'size-4'}/>
            </Button>
        </div>
    )
}