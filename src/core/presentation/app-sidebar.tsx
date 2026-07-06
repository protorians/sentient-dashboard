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
  VideoIcon, GalleryHorizontalIcon, FilesIcon
} from "lucide-react"
import {ThemeLogo} from "@/core/presentation/themes/logo.theme";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: (
        <LayoutDashboardIcon
        />
      ),
    },
    {
      title: "Centre de control",
      url: "/access-control",
      icon: (
        <ListIcon
        />
      ),
    },
    {
      title: "Facturations",
      url: "/billing",
      icon: (
        <ChartBarIcon
        />
      ),
    },
    {
      title: "Blog",
      url: "/blog",
      icon: (
        <FolderIcon
        />
      ),
    },
    {
      title: "CRM",
      url: "/crm",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Utilisateurs",
      url: "/users",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Organisations",
      url: "/organizations",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Projet",
      url: "/project-management",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Restaurant",
      url: "/restaurant",
      icon: (
        <UsersIcon
        />
      ),
    },
    {
      title: "Stock",
      url: "/stock-management",
      icon: (
        <UsersIcon
        />
      ),
    },
  ],
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
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
