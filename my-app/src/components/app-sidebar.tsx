"use client";

import * as React from "react";
import {
  Settings2,
  Table,
  CalendarDays,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
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

import { NavCreate } from "./nav-create";
import { useProject } from "@/context/project";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { projectID } = useProject();

  const data = {
    navMain: [
      {
        title: "DashBoard",
        url: `/project/dashboard/${projectID}`,
        icon: LayoutDashboard,
        isActive: true,
      },
      {
        title: "Kanban Board",
        url: `/project/task/${projectID}`,
        icon: Table,
        isActive: true,
      },
      {
        title: "Calendar",
        url: `/project/calendar/${projectID}`,
        icon: CalendarDays,
      },
      {
        title: "Message",
        url: `/project/message/${projectID}`,
        icon: MessageCircle,
      },
      {
        title: "Settings",
        url: `/project/settings/${projectID}`,
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
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="30"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    className="lucide lucide-sport-shoe-icon lucide-sport-shoe"
                  >
                    <path d="m15 10.42 4.8-5.07" />
                    <path d="M19 18h3" />
                    <path d="M9.5 22 21.414 9.415A2 2 0 0 0 21.2 6.4l-5.61-4.208A1 1 0 0 0 14 3v2a2 2 0 0 1-1.394 1.906L8.677 8.053A1 1 0 0 0 8 9c-.155 6.393-2.082 9-4 9a2 2 0 0 0 0 4h14" />
                  </svg>
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
        <NavCreate create={data.Create} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
