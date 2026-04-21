import { AppSidebar } from "./app-sidebar";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";

function Header() {
  return (
    <SidebarProvider className="w-fit">
      <AppSidebar variant="inset" />

      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center h-12 px-3 bg-background border-b border-border">
        <SidebarTrigger className="fixed" />
        <div className="w-full flex items-center justify-center gap-2">
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
          <span className="truncate font-medium">SriderDesk</span>
        </div>
      </div>
    </SidebarProvider>
  );
}

export { Header };
