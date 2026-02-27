import express from "express";
import { supabase } from "../database/supabaseConfig.js";

const kanbanRouter = express.Router();

// Helper for Socket Broadcasting
const broadcast = (req, projectId, event, data) => {
  const io = req.app.get("socketio");
  if (io && projectId) {
    io.to(projectId).emit(event, data);
  }
};

// GET all columns and tasks
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
    res.status(500).json({ error: "Failed to fetch kanban data" });
  }
});

// GET project members
kanbanRouter.get("/:id/members", async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from("projects")
      .select("users");

    if (error) throw error;

    const formattedUsers =
      users?.map((user) => ({
        id: user.uid,
        name: user.name || "Unknown",
        initial: (user.name || "?").charAt(0).toUpperCase(),
      })) || [];

    res.json(formattedUsers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

//CREATE Column
kanbanRouter.post("/:id/columns", async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const { data: existing } = await supabase
      .from("kanban_columns")
      .select("position")
      .eq("project_id", id)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition = existing?.[0]?.position + 1 || 0;

    const { data, error } = await supabase
      .from("kanban_columns")
      .insert({ project_id: id, name, position: newPosition })
      .select()
      .single();

    if (error) throw error;

    broadcast(req, id, "kanban_column_created", {
      id: data.id,
      name: data.name,
      tasks: [],
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to create column" });
  }
});

// DELETE Column
kanbanRouter.delete("/:id/columns/:columnId", async (req, res) => {
  try {
    const { id, columnId } = req.params;
    const { error } = await supabase
      .from("kanban_columns")
      .delete()
      .eq("id", columnId);
    if (error) throw error;

    broadcast(req, id, "kanban_column_deleted", { columnId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete column" });
  }
});

// CREATE Task
kanbanRouter.post("/:id/tasks", async (req, res) => {
  try {
    const { id } = req.params;
    const { columnId, title, description, mentions } = req.body;

    const { data: existing } = await supabase
      .from("kanban_tasks")
      .select("position")
      .eq("column_id", columnId)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition = existing?.[0]?.position + 1 || 0;

    const { data: task, error: taskError } = await supabase
      .from("kanban_tasks")
      .insert({
        column_id: columnId,
        project_id: id,
        title,
        description,
        position: newPosition,
      })
      .select()
      .single();

    if (taskError) throw taskError;

    // Handle Mentions
    if (mentions?.length > 0) {
      const inserts = mentions.map((uId) => ({
        task_id: task.id,
        user_id: uId,
      }));
      await supabase.from("kanban_task_mentions").insert(inserts);
    }

    broadcast(req, id, "kanban_task_created", {
      ...task,
      mentions: mentions || [],
    });

    res.json({ ...task, mentions: mentions || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to create task" });
  }
});

// UPDATE Task
kanbanRouter.put("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { title, description, mentions } = req.body;

    const { data: task, error: taskError } = await supabase
      .from("kanban_tasks")
      .update({ title, description, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single();

    if (taskError) throw taskError;

    await supabase.from("kanban_task_mentions").delete().eq("task_id", taskId);
    if (mentions?.length > 0) {
      const inserts = mentions.map((uId) => ({
        task_id: taskId,
        user_id: uId,
      }));
      await supabase.from("kanban_task_mentions").insert(inserts);
    }

    broadcast(req, id, "kanban_task_updated", {
      ...task,
      mentions: mentions || [],
    });

    res.json({ ...task, mentions: mentions || [] });
  } catch (error) {
    res.status(500).json({ error: "Failed to update task" });
  }
});

// DELETE Task
kanbanRouter.delete("/:id/tasks/:taskId", async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { error } = await supabase
      .from("kanban_tasks")
      .delete()
      .eq("id", taskId);
    if (error) throw error;

    broadcast(req, id, "kanban_task_deleted", { taskId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete task" });
  }
});

// MOVE Task
kanbanRouter.put("/:id/tasks/:taskId/move", async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { targetColumnId } = req.body;

    const { data: existing } = await supabase
      .from("kanban_tasks")
      .select("position")
      .eq("column_id", targetColumnId)
      .order("position", { ascending: false })
      .limit(1);

    const newPosition = existing?.[0]?.position + 1 || 0;

    const { data: task, error } = await supabase
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

    const { data: currentMentions } = await supabase
      .from("kanban_task_mentions")
      .select("user_id")
      .eq("task_id", taskId);

    const mentionsArr = currentMentions?.map((m) => m.user_id) || [];

    broadcast(req, id, "kanban_task_updated", {
      ...task,
      mentions: mentionsArr,
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ error: "Failed to move task" });
  }
});

export { kanbanRouter };
