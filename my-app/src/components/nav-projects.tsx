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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { api } from "@/lib/api";
import { useUser } from "@/context/user";
import { useEffect, useState } from "react";
import {
  ChevronRight,
  FolderOpen,
  Settings,
  LayoutDashboard,
  ListTodo,
  Calendar,
  MessageCircle,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

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
          <Collapsible
            key={item.name}
            asChild
            defaultOpen={false}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              {/* Project row — clicking the chevron toggles, clicking the name navigates */}
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.name}>
                  <FolderOpen className="w-4 h-4 shrink-0" />
                  <div
                    className="flex-1 truncate"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {item.name}
                  </div>
                  <ChevronRight className="ml-auto w-4 h-4 shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>

              {/* Dropdown sub-items */}
              <CollapsibleContent>
                <SidebarMenuSub>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={`/project/${item.url}`}>
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>Overview</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={`/project/task/${item.url}`}>
                        <ListTodo className="w-3.5 h-3.5" />
                        <span>Kanban</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={`/project/Calendar/${item.url}`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Calendar</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={`/message`}>
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Message</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>

                  <SidebarMenuSubItem>
                    <SidebarMenuSubButton asChild>
                      <Link to={`/project/settings/${item.url}`}>
                        <Settings className="w-3.5 h-3.5" />
                        <span>Settings</span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
