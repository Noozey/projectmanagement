import express from "express";
import { supabase } from "../database/supabaseConfig.js";

const kanbanRouter = express.Router();

// GET all columns and tasks for a project
kanbanRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: columns, error: columnsError } = await supabase
      .from("kanban_columns")
      .select("*")
      .eq("project_id", id)
      .order("position", { ascending: true });

    if (columnsError) throw columnsError;

    const { data: tasks, error: tasksError } = await supabase
      .from("kanban_tasks")
      .select(
        `
        *,
        kanban_task_mentions (
          user_id,
          registration (uid, name)
        )
      `,
      )
      .in("column_id", columns?.map((c) => c.id) || [])
      .order("position", { ascending: true });

    if (tasksError) throw tasksError;

    const formattedColumns = columns?.reduce((acc, col) => {
      const columnTasks = tasks?.filter((t) => t.column_id === col.id) || [];

      acc[col.id] = {
        name: col.name,
        tasks: columnTasks.map((task) => ({
          id: task.id,
          title: task.title,
          description: task.description,
          mentions: task.kanban_task_mentions?.map((m) => m.user_id) || [],
        })),
      };
      return acc;
    }, {});

    res.json(formattedColumns || {});
  } catch (error) {
    console.error("Error fetching kanban:", error);
    res.status(500).json({ error: "Failed to fetch kanban data" });
  }
});

// GET project members
kanbanRouter.get("/:id/members", async (req, res) => {
  try {
    const { id } = req.params;

    const { data: users, error } = await supabase
      .from("registration")
      .select("uid, name");

    if (error) throw error;

    const formattedUsers =
      users?.map((user) => ({
        id: user.uid,
        name: user.name || "Unknown",
        initial: (user.name || "?").charAt(0).toUpperCase(),
      })) || [];

    res.json(formattedUsers);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// CREATE a new column
kanbanRouter.post("/:id/columns", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const { data: existingColumns } = await supabase
      .from("kanban_columns")
      .select("position")
      .eq("project_id", id)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition = existingColumns?.[0]?.position + 1 || 0;

    const { data, error } = await supabase
      .from("kanban_columns")
      .insert({
        project_id: id,
        name,
        position: newPosition,
      })
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error creating column:", error);
    res.status(500).json({ error: "Failed to create column" });
  }
});

// DELETE a column
kanbanRouter.delete("/:id/columns/:columnId", async (req, res) => {
  try {
    const { columnId } = req.params;

    const { error } = await supabase
      .from("kanban_columns")
      .delete()
      .eq("id", columnId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting column:", error);
    res.status(500).json({ error: "Failed to delete column" });
  }
});

// CREATE a new task
kanbanRouter.post("/:id/tasks", async (req, res) => {
  try {
    const { columnId, title, description, mentions } = req.body;

    const { data: existingTasks } = await supabase
      .from("kanban_tasks")
      .select("position")
      .eq("column_id", columnId)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition = existingTasks?.[0]?.position + 1 || 0;

    const { data: task, error: taskError } = await supabase
      .from("kanban_tasks")
      .insert({
        column_id: columnId,
        title,
        description,
        position: newPosition,
      })
      .select()
      .single();

    if (taskError) throw taskError;

    if (mentions && mentions.length > 0) {
      const mentionInserts = mentions.map((userId) => ({
        task_id: task.id,
        user_id: userId,
      }));

      const { error: mentionsError } = await supabase
        .from("kanban_task_mentions")
        .insert(mentionInserts);

      if (mentionsError) throw mentionsError;
    }

    res.json({ ...task, mentions: mentions || [] });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Failed to create task" });
  }
});

// UPDATE a task
kanbanRouter.put("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { title, description, mentions } = req.body;

    // Update task
    const { data: task, error: taskError } = await supabase
      .from("kanban_tasks")
      .update({
        title,
        description,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (taskError) throw taskError;

    await supabase.from("kanban_task_mentions").delete().eq("task_id", taskId);

    if (mentions && mentions.length > 0) {
      const mentionInserts = mentions.map((userId) => ({
        task_id: taskId,
        user_id: userId,
      }));

      const { error: mentionsError } = await supabase
        .from("kanban_task_mentions")
        .insert(mentionInserts);

      if (mentionsError) throw mentionsError;
    }

    res.json({ ...task, mentions: mentions || [] });
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE a task
kanbanRouter.delete("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;

    const { error } = await supabase
      .from("kanban_tasks")
      .delete()
      .eq("id", taskId);

    if (error) throw error;

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// MOVE task between columns
kanbanRouter.put("/:id/tasks/:taskId/move", async (req, res) => {
  try {
    const { taskId } = req.params;
    const { targetColumnId } = req.body;

    const { data: existingTasks } = await supabase
      .from("kanban_tasks")
      .select("position")
      .eq("column_id", targetColumnId)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition = existingTasks?.[0]?.position + 1 || 0;

    const { data, error } = await supabase
      .from("kanban_tasks")
      .update({
        column_id: targetColumnId,
        position: newPosition,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error("Error moving task:", error);
    res.status(500).json({ error: "Failed to move task" });
  }
});

export { kanbanRouter };
