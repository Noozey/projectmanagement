import { useUser } from "@/context/user";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated")({
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const navigate = Route.useNavigate();
  const { isAuthenticate, isLoading } = useUser();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticate) {
      toast.warning("You need to login to visit the page");
      navigate({
        to: "/",
      });
    }
  }, [isAuthenticate, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticate) {
    return null;
  }

  return <Outlet />;
}
