import React, {Fragment, ReactNode} from "react";
import {
    ItemGroup,
    Item,
    ItemHeader,
    ItemTitle,
    ItemDescription,
    ItemContent,
    ItemFooter, ItemSeparator
} from "@/core/presentation/ui/item";

export type ListItemType = Record<string, ReactNode>

export interface ListItemsProps extends React.ComponentProps<"div"> {
    items: ListItemType;
    header?: ReactNode;
    footer?: ReactNode;
}

export interface ListItemProps extends React.ComponentProps<"div"> {
    label: string;
    children: ReactNode
}

export function ListItems({items, header, footer, ...props}: ListItemsProps) {
    const itemsArray = Object.entries(items)

    return (
        <ItemGroup {...props}>
            {header && (<ItemHeader className={"px-3 text-muted-foreground"}>
                {header}
            </ItemHeader>)}
            <ItemContent>
                <div className="">
                    {itemsArray.map(([label, value], index) => {
                        return (
                            <Fragment key={`list-items-${index}`}>
                                <ListItem label={label}>{value}</ListItem>
                                {index < itemsArray.length - 1 && (<ItemSeparator/>)}
                            </Fragment>
                        )
                    })}
                </div>
            </ItemContent>
            {footer && (<ItemFooter className={"px-3 text-muted-foreground"}>
                {footer}
            </ItemFooter>)}
        </ItemGroup>
    )
}

export function ListItem({label, children, ...props}: ListItemProps) {
    return (
        <Item {...props} className="py-1!">
            <ItemContent  className="py-0!">{label}</ItemContent>
            <ItemDescription  className="py-0!">{children}</ItemDescription>
        </Item>
    )
}