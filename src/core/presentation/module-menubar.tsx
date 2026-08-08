import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarSeparator,
    MenubarSub,
    MenubarSubContent,
    MenubarSubTrigger,
    MenubarTrigger
} from "@/core/presentation/ui/menubar";
import {
    ModuleDeclarationInterface,
    ModuleNavigationMenuItem,
    ModuleNavigationMenuSeparator
} from "@/core/domain/entities/module.interface";
import {LucideIcon} from "@/core/presentation/icons/lucide";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/core/presentation/ui/sheet";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/core/presentation/ui/accordion";
import {Button} from "@/core/presentation/ui/button";
import {MenuIcon} from "lucide-react";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {cn} from "@/core/infrastructure/utilities/utils";
import {HeaderMenubarSize} from "@/core/presentation/themes/katon/header-menubar";

const sizeMap: Record<HeaderMenubarSize, { trigger: string; item: string; icon: number; mobileItem: string }> = {
    xs:  { trigger: "text-xs h-7 px-1.5 py-0",     item: "text-xs px-2 py-1",     icon: 3,  mobileItem: "text-xs h-8" },
    sm:  { trigger: "text-xs h-8 px-2 py-0",    item: "text-xs px-2.5 py-1.5", icon: 3,  mobileItem: "text-sm h-9" },
    md:  { trigger: "text-sm h-9 px-2.5 py-0",       item: "text-sm px-3 py-1.5",   icon: 4,  mobileItem: "text-sm h-10" },
    lg:  { trigger: "text-sm h-10 px-3.5 py-0",       item: "text-sm px-3.5 py-2",   icon: 4,  mobileItem: "text-base h-11" },
    xl:  { trigger: "text-base h-11 px-4.5 py-0",     item: "text-base px-4 py-2",   icon: 5,  mobileItem: "text-base h-12" },
    xxl: { trigger: "text-lg h-12 px-5 py-0",       item: "text-lg px-5 py-2.5",   icon: 5,  mobileItem: "text-lg h-14" },
};

export interface ModuleMenubarProps {
    module: ModuleDeclarationInterface;
    size?: HeaderMenubarSize;
}

export function ModuleMenubar({module, size = 'md'}: ModuleMenubarProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const s = sizeMap[size];

    if (!module.menu)
        return null;

    const handleItemAction = (item: ModuleNavigationMenuItem) => {
        if (item.action) {
            item.action();
        } else if (item.url) {
            router.push(item.url);
        }
    };

    const renderItems = (items: (ModuleNavigationMenuItem | ModuleNavigationMenuSeparator)[]) => {
        return items.map((item, index) => {
            if ('separator' in item) {
                return <MenubarSeparator key={`sep-${index}`}/>;
            }

            const itemWithItems = item as ModuleNavigationMenuItem;

            if (itemWithItems.items && itemWithItems.items.length > 0) {
                return (
                    <MenubarSub key={itemWithItems.label}>
                        <MenubarSubTrigger className={cn("gap-2", s.item)}>
                            {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={s.icon} className=""/>}
                            <span>{itemWithItems.label}</span>
                        </MenubarSubTrigger>
                        <MenubarSubContent>
                            {renderItems(itemWithItems.items)}
                        </MenubarSubContent>
                    </MenubarSub>
                );
            }

            return (
                <MenubarItem
                    key={itemWithItems.label}
                    onClick={() => handleItemAction(itemWithItems)}
                    className={cn("gap-2", s.item)}
                >
                    {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={s.icon} className=""/>}
                    <span>{itemWithItems.label}</span>
                </MenubarItem>
            );
        });
    };

    const renderMobileItems = (items: (ModuleNavigationMenuItem | ModuleNavigationMenuSeparator)[]) => {
        return items.map((item, index) => {
            if ('separator' in item) {
                return <div key={`sep-${index}`} className="my-2 border-b border-border/50"/>;
            }

            const itemWithItems = item as ModuleNavigationMenuItem;

            if (itemWithItems.items && itemWithItems.items.length > 0) {
                return (
                    <AccordionItem key={itemWithItems.label} value={itemWithItems.label} className="border-none">
                        <AccordionTrigger className={cn("py-2 hover:no-underline", s.mobileItem)}>
                            <div className="flex items-center gap-2">
                                {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={s.icon}/>}
                                <span>{itemWithItems.label}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="pl-4 flex flex-col gap-1 border-l ml-2">
                                {renderMobileItems(itemWithItems.items)}
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                );
            }

            return (
                <Button
                    key={itemWithItems.label}
                    variant="ghost"
                    className={cn("w-full justify-start gap-2 px-2 font-semibold border-b rounded-none", s.mobileItem)}
                    onClick={() => {
                        handleItemAction(itemWithItems);
                        setOpen(false);
                    }}
                >
                    {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={s.icon}/>}
                    <span>{itemWithItems.label}</span>
                </Button>
            );
        });
    };

    return (
        <>
            <Menubar className="hidden md:flex border-none shadow-none bg-transparent px-1.5">
                {module.menu.items.map((menu, index) => (
                    <MenubarMenu key={menu.label || index}>
                        <MenubarTrigger
                            className={cn("gap-2", s.trigger)}
                            {...(!menu.items?.length && menu.url ? { onClick: () => router.push(menu.url!) } : {})}
                        >
                            {menu.icon && <LucideIcon name={menu.icon} size={s.icon}/>}
                            {menu.label}
                        </MenubarTrigger>
                        {menu.items && menu.items.length > 0 && (
                            <MenubarContent className={"rounded-md!"}>
                                {renderItems(menu.items)}
                            </MenubarContent>
                        )}
                    </MenubarMenu>
                ))}
            </Menubar>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon-sm" className="md:hidden">
                        <MenuIcon/>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left"
                              className="w-[300px]! rounded-lg m-3 h-[92dvh]! px-6 bg-background/70 backdrop-blur-lg">
                    <SheetHeader className="pb-4">
                        <SheetTitle className="flex items-center gap-2">
                            <LucideIcon name={module.icon} size={5}/>
                            {module.name}
                        </SheetTitle>
                    </SheetHeader>
                    <div className="py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
                        <Accordion type="multiple" className="w-full">
                            {module.menu.items.map((menu, index) => {
                                if (menu.items && menu.items.length > 0) {
                                    return (
                                        <AccordionItem key={menu.label || index} value={menu.label || `item-${index}`}
                                                       className="border-b">
                                            <AccordionTrigger className={cn("font-semibold hover:no-underline", s.mobileItem)}>
                                                <div className="flex items-center gap-2">
                                                    {menu.icon && <LucideIcon name={menu.icon} size={s.icon}/>}
                                                    <span>{menu.label}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent>
                                                <div className="flex flex-col gap-1 py-1">
                                                    {renderMobileItems(menu.items)}
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                }

                                return (
                                    <Button
                                        key={menu.label || index}
                                        variant="ghost"
                                        className={cn("w-full justify-start gap-2 px-0 font-semibold border-b rounded-none", s.mobileItem)}
                                        onClick={() => {
                                            handleItemAction(menu);
                                            setOpen(false);
                                        }}
                                    >
                                        {menu.icon && <LucideIcon name={menu.icon} size={s.icon}/>}
                                        <span>{menu.label}</span>
                                    </Button>
                                );
                            })}
                        </Accordion>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    )
}
