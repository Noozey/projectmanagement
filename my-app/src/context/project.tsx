import { createContext, useState, useEffect, useContext } from "react";
import { useUser } from "./user";
import { api } from "@/lib/api";

type ProjectContextType = {
  currentProject: string;
  projectID: string;
  switchProject: (id: string) => void;
};

export const ProjectContext = createContext<ProjectContextType>({
  currentProject: "",
  projectID: "",
  switchProject: () => {},
});

export const useProject = () => useContext(ProjectContext);

export const ProjectProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentProject, setCurrentProject] = useState<string>("Personal");
  const [projectID, setProjectID] = useState<string>("");
  const { user } = useUser();

  const loadProject = async (id: string) => {
    if (!user?.uid || !id) return;
    try {
      const res = await api.get(`/project/${user.uid}/${id}`);
      setCurrentProject(res.data.message[0].name);
      setProjectID(res.data.message[0].uid);
    } catch (err) {
      console.error("Failed to load project:", err);
    }
  };

  const switchProject = (id: string) => {
    localStorage.setItem("project", id);
    loadProject(id);
  };

  useEffect(() => {
    if (!user?.email) return;
    const savedID = localStorage.getItem("project");
    if (!savedID) return;
    loadProject(savedID);
  }, [user?.email]);

  return (
    <ProjectContext.Provider
      value={{ currentProject, projectID, switchProject }}
    >
      {children}
    </ProjectContext.Provider>
  );
};
