import express from "express";
import { supabase } from "../database/supabaseConfig.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const projectsRouter = express.Router();

projectsRouter.post("/", async (req, res) => {
  const { projectData } = req.body;

  const initialUsers = [
    {
      email: projectData.creator.email,
      uid: projectData.creator.uid,
      role: "Super",
    },
    {
      email: projectData.projectManager.email,
      uid: projectData.projectManager.uid,
      role: "Admin",
    },
    ...(projectData.teamMembers || []),
  ];

  const { data, error } = await supabase.from("projects").insert([
    {
      name: projectData.projectName,
      description: projectData.projectDescription,
      category: projectData.projectCategory,
      priority: projectData.projectPriority,
      manager: projectData.projectManager.email,
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
      creator: projectData.creator,
    },
  ]);

  if (error)
    return res.status(500).json({ message: "Error creating project", error });
  res.status(200).json({ message: "Project created successfully", data });
});

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

    const isUser = projectData.users?.some((user) => user.uid === email);
    if (!isUser) return res.status(403).json({ error: "Access denied" });

    return res.status(200).json({ message: [projectData] });
  }

  const { data: usersData } = await supabase
    .from("projects")
    .select("*")
    .contains("users", JSON.stringify([{ uid: email }]));

  console.log(usersData);

  const merged = [...(usersData || [])].filter(
    (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
  );
  return res.status(200).json({ message: merged });
});

projectsRouter.patch(
  "/:id",
  authMiddleware,
  authorize(["Admin", "Super"]),
  async (req, res) => {
    const { id } = req.params;
    const { name, description, category, priority, users, duration, status } =
      req.body;
    console.log(req.body);

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
      })
      .eq("uid", id)
      .select();
    console.log(error);

    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: "Updated successfully", data });
  },
);

projectsRouter.delete(
  "/:id",
  authMiddleware,
  authorize(["Admin", "Super"]),
  async (req, res) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("uid", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(200).json({ message: "Project deleted" });
  },
);

export { projectsRouter };
