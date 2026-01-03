import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/project/$projectID")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectID } = Route.useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!projectID) return;

    localStorage.setItem("project", projectID);
    navigate({
      to: "/project/dashboard/" + projectID,
    });
  }, [navigate]);

  if (!projectID) {
    return <div>loading</div>;
  }

  return null;
}
