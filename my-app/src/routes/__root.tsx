import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Header } from "../components/Header.tsx";

export const Route = createRootRoute({
  component: () => (
    <div className="bg-sidebar font-sans flex ">
      <Header />
      <div className="bg-sidebar w-screen h-screen">
        <Outlet />
      </div>
    </div>
  ),
});
