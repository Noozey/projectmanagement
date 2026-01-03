"use client";

import * as React from "react";
import {
  LifeBuoy,
  Send,
  Settings2,
  Table,
  CalendarDays,
  LayoutDashboard,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import logo from "../../public/logo.png";
import { NavCreate } from "./nav-create";
import { useUser } from "@/context/user";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { currentProject } = useUser();

  const data = {
    navMain: [
      {
        title: "DashBoard",
        url: "/dashboard",
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Kanban Board",
        url: `/project/task/${currentProject}`,
        icon: Table,
        isActive: true,
      },
      {
        title: "Calendar",
        url: "/calendar",
        icon: CalendarDays,
      },
      {
        title: "Settings",
        url: "#",
        icon: Settings2,
      },
    ],

    Create: [
      {
        title: "Meeting",
        url: "/meeting",
      },
      {
        title: "Project",
        url: "/project",
      },
    ],
  };
  return (
    <Sidebar variant="inset" {...props} className="bg-sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className=" text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <img src={logo} alt="Logo" className="h-10" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">SriderDesk</span>
                  <span className="truncate text-xs">Project Management</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects />
        <NavCreate create={data.Create} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
