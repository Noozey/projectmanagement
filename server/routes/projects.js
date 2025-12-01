import express from "express";
import { supabase } from "../database/supabaseConfig.js";

const projectsRouter = express.Router();

projectsRouter.post("/", async (req, res) => {
  const { projectData } = req.body;
  console.log(projectData);
  const { data, err } = await supabase.from("projects").insert([
    {
      name: projectData.projectName,
      description: projectData.projectDescription,
      category: projectData.projectCategory,
      priority: projectData.projectPriority,
      manager: projectData.projectManager,
      users: projectData.teamMembers,
      duration: projectData.duration,
    },
  ]);

  if (err) {
    res.status(500).json({ message: "Error creating project", error: err });
  }
  res.status(200).json({ message: "Project created successfully" });
});

projectsRouter.get("/:email/:id?", async (req, res) => {
  const { id, email } = req.params;

  // If id is provided, check if user has access to that specific project
  if (id) {
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("uid", id)
      .single();

    if (projectError) {
      return res.status(400).json({ error: projectError });
    }

    if (!projectData) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Check if user is the manager or in the users array
    const isManager = projectData.manager === email;
    const isUser = projectData.users?.some((user) => user.email === email);

    if (!isManager && !isUser) {
      return res
        .status(403)
        .json({ error: "You don't have access to this project" });
    }

    return res.status(200).json({ message: [projectData] });
  }

  // If no id provided, return all projects the user has access to
  let managerQuery = supabase.from("projects").select("*").eq("manager", email);
  const { data: managerData, error: managerError } = await managerQuery;

  let usersQuery = supabase
    .from("projects")
    .select("*")
    .contains("users", `[{"email":"${email}"}]`);
  const { data: usersData, error: usersError } = await usersQuery;

  if (managerError || usersError) {
    return res.status(400).json({ error: managerError || usersError });
  }

  const merged = [...managerData, ...usersData].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
  );

  return res.status(200).json({ message: merged });
});

export { projectsRouter };
