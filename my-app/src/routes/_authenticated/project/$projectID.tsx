import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/_authenticated/project/$projectID")({
  loader: ({ params, navigate }) => {
    const { projectID } = params;

    localStorage.setItem("project", projectID);

    throw navigate({
      to: "/project/dashboard/$projectID",
      params: { projectID },
      replace: true,
    });
  },
  component: () => null,
});
