import { AppSidebar } from "./app-sidebar";
import { SidebarProvider } from "./ui/sidebar";

function Header() {
  return (
    <SidebarProvider className="w-fit">
      <AppSidebar variant="inset" />
    </SidebarProvider>
  );
}

export { Header };
