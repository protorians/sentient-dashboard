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


export interface ModuleMenubarProps {
  module: ModuleDeclarationInterface
}

export function ModuleMenubar({module}: ModuleMenubarProps) {
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

  return (
    <Menubar className="border-none shadow-none bg-transparent px-1.5">
      {module.menu.items.map((menu, index) => (
        <MenubarMenu key={menu.label || index}>
          <MenubarTrigger className={"gap-2"}>
            {menu.icon && <LucideIcon name={menu.icon} size={4} className="" />}
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
  )
}
