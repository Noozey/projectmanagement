import express from "express";
import { supabase } from "../database/supabaseConfig.js";

const projectsRouter = express.Router();

// --- CREATE PROJECT ---
projectsRouter.post("/", async (req, res) => {
  const { projectData } = req.body;

  // Preserve your logic but inject the manager as an Admin into the users array
  const initialUsers = [
    {
      email: projectData.projectManager,
      role: "Project Manager",
      permission: "admin",
    },
    ...(projectData.teamMembers || []),
  ];

  const { data, error } = await supabase.from("projects").insert([
    {
      name: projectData.projectName,
      description: projectData.projectDescription,
      category: projectData.projectCategory,
      priority: projectData.projectPriority,
      manager: projectData.projectManager,
      users: initialUsers, // Now includes manager with admin permission
      duration: projectData.duration,
      status: "active",
      // Your original default settings
      notifications: {
        taskAssigned: true,
        taskCompleted: true,
        memberJoined: false,
        deadlineReminder: true,
        statusChange: true,
        weeklyDigest: false,
      },
      permissions: {
        membersCanInvite: false,
        publicVisibility: false,
        editorsCanDelete: false,
        viewersCanComment: true,
      },
    },
  ]);

  if (error)
    return res.status(500).json({ message: "Error creating project", error });
  res.status(200).json({ message: "Project created successfully", data });
});

// --- GET PROJECTS ---
projectsRouter.get("/:email/:id?", async (req, res) => {
  const { id, email } = req.params;
  if (id && id !== "undefined" && id !== "settings") {
    const { data: projectData, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("uid", id)
      .single();

    if (projectError || !projectData)
      return res.status(404).json({ error: "Project not found" });

    const isManager = projectData.manager === email;
    const isUser = projectData.users?.some((user) => user.email === email);
    if (!isManager && !isUser)
      return res.status(403).json({ error: "Access denied" });

    return res.status(200).json({ message: [projectData] });
  }

  const { data: managerData } = await supabase
    .from("projects")
    .select("*")
    .eq("manager", email);
  const { data: usersData } = await supabase
    .from("projects")
    .select("*")
    .contains("users", JSON.stringify([{ email: email }]));

  const merged = [...(managerData || []), ...(usersData || [])].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
  );
  return res.status(200).json({ message: merged });
});

// --- UPDATE PROJECT ---
projectsRouter.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const {
    name,
    description,
    category,
    priority,
    users,
    duration,
    status,
    notifications,
    permissions,
  } = req.body;

  const { data, error } = await supabase
    .from("projects")
    .update({
      name,
      description,
      category,
      priority,
      users,
      duration,
      status,
      notifications,
      permissions,
    })
    .eq("uid", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Updated successfully", data });
});

// --- DELETE PROJECT ---
projectsRouter.delete("/:id", async (req, res) => {
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("uid", req.params.id);
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Project deleted" });
});

export { projectsRouter };
