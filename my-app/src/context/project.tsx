import { createContext, useState, useEffect, useContext } from "react";
import { useUser } from "./user";
import { api } from "@/lib/api";

export const ProjectContext = createContext({
  currentProject: "",
});

export const useProject = () => {
  return useContext(ProjectContext);
};

export const ProjectProvider = ({ children }) => {
  const [currentProject, setCurrentProject] = useState<string>("Personal");
  const { user } = useUser();

  useEffect(() => {
    if (!user?.email) return;

    const loadProject = async () => {
      const projectID = localStorage.getItem("project");
      if (!projectID) return;

      const res = await api.get(`/project/${user.email}/${projectID}`);
      setCurrentProject(res.data.message[0].name);
    };

    loadProject();
  }, [user?.email]);

  return (
    <ProjectContext.Provider value={{ currentProject }}>
      {children}
    </ProjectContext.Provider>
  );
};
