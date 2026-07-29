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
import { Button } from "@/core/presentation/ui/button";
import { MenuIcon } from "lucide-react";
import {useState} from "react";


export interface ModuleMenubarProps {
  module: ModuleDeclarationInterface
}

export function ModuleMenubar({module}: ModuleMenubarProps) {
  const [open, setOpen] = useState(false);

  if(!module.menu)
    return null;

  const renderItems = (items: (ModuleNavigationMenuItem | ModuleNavigationMenuSeparator)[]) => {
    return items.map((item, index) => {
      if ('separator' in item) {
        return <MenubarSeparator key={`sep-${index}`} />;
      }

      const itemWithItems = item as ModuleNavigationMenuItem;

      if (itemWithItems.items && itemWithItems.items.length > 0) {
        return (
          <MenubarSub key={itemWithItems.label}>
            <MenubarSubTrigger className={"gap-2"}>
              {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={4} className="" />}
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
            onClick={() => itemWithItems.action?.()}
             className={"gap-2"}
        >
          {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={4} className="" />}
          <span>{itemWithItems.label}</span>
        </MenubarItem>
      );
    });
  };

  const renderMobileItems = (items: (ModuleNavigationMenuItem | ModuleNavigationMenuSeparator)[]) => {
    return items.map((item, index) => {
      if ('separator' in item) {
        return <div key={`sep-${index}`} className="my-2 border-b border-border/50" />;
      }

      const itemWithItems = item as ModuleNavigationMenuItem;

      if (itemWithItems.items && itemWithItems.items.length > 0) {
        return (
          <AccordionItem key={itemWithItems.label} value={itemWithItems.label} className="border-none">
            <AccordionTrigger className="text-sm py-2 hover:no-underline">
              <div className="flex items-center gap-2">
                {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={4} />}
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
          className="w-full justify-start gap-2 h-9 px-2"
          onClick={() => {
            itemWithItems.action?.();
            setOpen(false);
          }}
        >
          {itemWithItems.icon && <LucideIcon name={itemWithItems.icon} size={4} />}
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
            <MenubarTrigger className={"gap-2"}>
              {menu.icon && <LucideIcon name={menu.icon} size={4} />}
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
            <MenuIcon />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px]! rounded-lg m-3 h-[92dvh]! px-6 bg-background/70 backdrop-blur-lg">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <LucideIcon name={module.icon} size={5} />
              {module.name}
            </SheetTitle>
          </SheetHeader>
          <div className="py-4 overflow-y-auto max-h-[calc(100vh-80px)]">
            <Accordion type="multiple" className="w-full">
              {module.menu.items.map((menu, index) => {
                if (menu.items && menu.items.length > 0) {
                  return (
                    <AccordionItem key={menu.label || index} value={menu.label || `item-${index}`} className="border-b">
                      <AccordionTrigger className="text-sm font-semibold hover:no-underline">
                        <div className="flex items-center gap-2">
                          {menu.icon && <LucideIcon name={menu.icon} size={4} />}
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
                    className="w-full justify-start gap-2 h-11 px-0 font-semibold border-b rounded-none"
                    onClick={() => {
                      menu.action?.();
                      setOpen(false);
                    }}
                  >
                    {menu.icon && <LucideIcon name={menu.icon} size={4} />}
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
