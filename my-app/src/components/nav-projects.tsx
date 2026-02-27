"use client";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { api } from "@/lib/api";
import { useUser } from "@/context/user";
import { useEffect, useState } from "react";

type ProjectData = {
  name: string;
  url: number;
};

type Project = {
  [key: string]: ProjectData;
};

export function NavProjects() {
  const [projects, setProjects] = useState<ProjectData[]>();
  const { isMobile } = useSidebar();
  const { user } = useUser();

  const getProjects = async () => {
    await api.get(`/project/${user.uid}`).then((res) => {
      console.log(res);
      setProjects(
        res.data.message.map((value: Project) => {
          return {
            name: value.name,
            url: value.uid,
          };
        }),
      );
    });
  };

  useEffect(() => {
    getProjects();
  }, [user]);

  if (!projects) {
    return <div></div>;
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild>
              <a href={`/project/${item.url}`}>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
