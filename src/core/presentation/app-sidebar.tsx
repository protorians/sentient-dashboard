"use client"

import * as React from "react"

import { NavDocuments } from "@/core/presentation/nav-documents"
import { NavMain } from "@/core/presentation/nav-main"
import { NavSecondary } from "@/core/presentation/nav-secondary"
import { NavUser } from "@/core/presentation/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/core/presentation/ui/sidebar"
import {
  LayoutDashboardIcon,
  ListIcon,
  ChartBarIcon,
  FolderIcon,
  UsersIcon,
  CameraIcon,
  FileTextIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
  VideoIcon, GalleryHorizontalIcon, FilesIcon, ShieldIcon
} from "lucide-react"
import {ThemeLogo} from "@/core/presentation/themes/logo.theme";
import {useModuleStore} from "@/core/infrastructure/stores/module.store";
import DefaultModules from "@/modules/available";
import {DynamicIcon} from "@/core/presentation/components/dynamic-icon";
import {ComponentIcon} from "lucide-react";
import {useAuth} from "@/modules/auth/presentation/hooks/use-auth";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [],
  navClouds: [
    {
      title: "Capture",
      icon: (
        <CameraIcon
        />
      ),
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Proposal",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
    {
      title: "Prompts",
      icon: (
        <FileTextIcon
        />
      ),
      url: "#",
      items: [
        {
          title: "Active Proposals",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: (
        <Settings2Icon
        />
      ),
    },
    {
      title: "Get Help",
      url: "#",
      icon: (
        <CircleHelpIcon
        />
      ),
    },
    {
      title: "Search",
      url: "#",
      icon: (
        <SearchIcon
        />
      ),
    },
  ],
  documents: [
    {
      name: "Vidéos",
      url: "/media-library/videos",
      icon: (
        <VideoIcon
        />
      ),
    },
    {
      name: "Images",
      url: "/media-library/images",
      icon: (
        <GalleryHorizontalIcon
        />
      ),
    },
    {
      name: "Documents",
      url: "/media-library/documents",
      icon: (
        <FilesIcon
        />
      ),
    },
    {
      name: "Rapports",
      url: "/reports",
      icon: (
        <FileChartColumnIcon
        />
      ),
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { modules } = useModuleStore();
  const { user: authUser } = useAuth();
  const [mounted, setMounted] = React.useState(false);

  const user = React.useMemo(() => ({
    name: authUser?.username || authUser?.userData?.firstname || "Utilisateur",
    email: authUser?.email || "No email",
    avatar: "/avatars/shadcn.jpg", // Fallback avatar
  }), [authUser]);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const dynamicNavMain = React.useMemo(() => {
    const modulesToUse = mounted ? modules : DefaultModules;
    return modulesToUse
      .filter((m) => m.isEnabled)
      .map((m) => ({
        title: m.name,
        url: m.url,
        icon: <DynamicIcon name={m.icon} />,
      }));
  }, [modules, mounted]);

  const navSecondaryWithModules = React.useMemo(() => {
    const items = [...data.navSecondary];
    if (!items.find(i => i.title === "Modules")) {
      items.push({
        title: "Modules",
        url: "/modules",
        icon: (
          <ComponentIcon
          />
        ),
      });
    }
    return items;
  }, [modules]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size={"lg"}
              asChild
              className="data-[slot=sidebar-menu-button]:p-2!"
            >
              <a href="#">
                <ThemeLogo variant={'banner'} className="h-18 w-auto" />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={dynamicNavMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={navSecondaryWithModules} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}
