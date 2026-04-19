"use client";
import { type LucideIcon, ChevronDown, FolderKanban } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useProject } from "@/context/project";
import { useUser } from "@/context/user";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router"; // ✅ TanStack

type ProjectData = { name: string; url: number };
type Project = { [key: string]: any };

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
  }[];
}) {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [open, setOpen] = useState(true);
  const { user } = useUser();
  const { projectID, switchProject } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;
    api.get(`/project/${user.uid}`).then((res) => {
      setProjects(
        res.data.message.map((value: Project) => ({
          name: value.name,
          url: value.uid,
        })),
      );
    });
  }, [user]);

  const handleProjectSwitch = (project: ProjectData) => {
    switchProject(String(project.url));
    navigate({
      to: "/project/dashboard/$projectID",
      params: { projectID: String(project.url) },
    });
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        <Collapsible open={open} onOpenChange={setOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Select Project">
                <FolderKanban />
                <span>Projects</span>
                <ChevronDown
                  className="ml-auto transition-transform duration-200"
                  style={{
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {projects.length === 0 && (
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton disabled>
                      <span className="text-muted-foreground text-xs">
                        No projects found
                      </span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                )}
                {projects.map((project) => (
                  <SidebarMenuSubItem key={project.url}>
                    <SidebarMenuSubButton
                      isActive={String(project.url) === String(projectID)}
                      onClick={() => handleProjectSwitch(project)}
                      className="cursor-pointer"
                    >
                      <span>{project.name}</span>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>

        {items.map((item) => (
          <Collapsible key={item.title} asChild defaultOpen={item.isActive}>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={item.title}>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
