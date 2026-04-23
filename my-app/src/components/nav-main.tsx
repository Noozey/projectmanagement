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
  useSidebar,
} from "@/components/ui/sidebar";
import { useProject } from "@/context/project";
import { useUser } from "@/context/user";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "@tanstack/react-router";

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
  const [open, setOpen] = useState(false);
  const { user } = useUser();
  const { projectID, switchProject } = useProject();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, setOpenMobile } = useSidebar();

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

  const activeProject = projects.find(
    (p) => String(p.url) === String(projectID),
  );

  const handleProjectSwitch = (project: ProjectData) => {
    switchProject(String(project.url));
    navigate({
      to: "/project/dashboard/$dashboard",
      params: {
        dashboard: String(project.url),
      },
    });
    if (isMobile) setOpenMobile(false);
    setOpen(false);
  };

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Main</SidebarGroupLabel>
      <SidebarMenu>
        {/* Project switcher */}
        <Collapsible open={open} onOpenChange={setOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Select Project">
                <FolderKanban />
                <span>
                  {activeProject
                    ? activeProject.name.split(" ").slice(0, 2).join(" ")
                    : "Projects"}
                </span>
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
                    <SidebarMenuSubButton>
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

        {/* Nav items */}
        {items.map((item) => {
          const isActive = location.pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
              >
                <Link
                  to={item.url}
                  onClick={() => isMobile && setOpenMobile(false)}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
