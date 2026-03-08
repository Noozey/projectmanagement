import { supabase } from "../database/supabaseConfig.js";

export const authorize = (allowedRoles) => {
  return async (req, res, next) => {
    const userId = req.user.uid;
    const projectId = req.params.id;

    const { data: project, error } = await supabase
      .from("projects")
      .select("users")
      .eq("uid", projectId)
      .single();

    if (error) return res.status(500).json({ error: error.message });

    const projectUsers =
      typeof project.users === "string"
        ? JSON.parse(project.users)
        : project.users;

    const projectUser = projectUsers.find((u) => u.uid === userId);

    if (!projectUser) {
      return res.status(403).json({ message: "Not part of project" });
    }

    if (!allowedRoles.includes(projectUser.role)) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    next();
  };
};
