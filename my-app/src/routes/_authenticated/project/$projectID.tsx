import { useUser } from "@/context/user";
import { api } from "@/lib/api";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/project/$projectID")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectID } = Route.useParams();
  const [projectData, setProjectData] = useState();
  const { user, setCurrentProject } = useUser();
  console.log(projectData);

  const getProjectInfo = async () => {
    await api.get(`/project/${user.email}/${projectID}`).then((res) => {
      setProjectData(res.data.message[0]);
    });
  };

  useEffect(() => {
    getProjectInfo();
  }, []);

  if (!projectData) {
    return <div>loading</div>;
  }
  setCurrentProject(projectData.name);

  return <div>Project ID{projectData.name}</div>;
}
