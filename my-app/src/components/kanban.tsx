import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { AnimatePresence, motion } from "motion/react";
import { Trash, Plus, LayoutPanelTop, AlignLeft, Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { api } from "@/lib/api";
import { useProject } from "@/context/project";
import { io } from "socket.io-client";
import { toast } from "sonner";

// Types
type User = {
  id: string;
  name: string;
  initial: string;
};

type Task = {
  id: string;
  title: string;
  description?: string;
  mentions?: string[];
};

type ColumnItem = {
  name: string;
  tasks: Task[];
};

type Column = {
  [key: string]: ColumnItem;
};

const socket = io("http://localhost:3001", {
  auth: {
    token: localStorage.getItem("token"),
  },
});

export function Kanban() {
  const { projectID } = useProject();
  const [columns, setColumns] = useState<Column>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form States
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [newColumnName, setNewColumnName] = useState("");
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isColumnDialogOpen, setIsColumnDialogOpen] = useState(false);
  const [draggedItem, setDraggedItem] = useState<{
    columnId: string;
    taskId: string;
  } | null>(null);

  const loadKanbanData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`kanban/${projectID}`);
      setColumns(res.data || {});
    } catch (err) {
      console.error("Error loading kanban:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const res = await api.get(`kanban/${projectID}/members`);
      setUsers(res.data || []);
    } catch (err) {
      console.error("Error loading users:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (!projectID) return;

    // 1. Connect and Join Room
    if (!socket.connected) {
      socket.connect();
    }
    socket.emit("join_project", projectID);

    // --- TASK HANDLERS ---
    const handleTaskUpdate = (updatedTask: any) => {
      setColumns((prev) => {
        const newColumns = { ...prev };
        const taskId = updatedTask.id || updatedTask.taskId;

        // Step 1: Remove the task from its current column (wherever it is)
        Object.keys(newColumns).forEach((colId) => {
          newColumns[colId].tasks = newColumns[colId].tasks.filter(
            (t) => t.id !== taskId,
          );
        });

        // Step 2: Add it to the target column (the backend sends column_id)
        const targetColId = updatedTask.column_id;
        if (newColumns[targetColId]) {
          newColumns[targetColId].tasks.push({
            id: taskId,
            title: updatedTask.title,
            description: updatedTask.description,
            mentions: updatedTask.mentions || [],
          });
        }
        return { ...newColumns };
      });
    };

    const handleTaskDelete = ({ taskId }: { taskId: string }) => {
      setColumns((prev) => {
        const newColumns = { ...prev };
        Object.keys(newColumns).forEach((colId) => {
          newColumns[colId].tasks = newColumns[colId].tasks.filter(
            (t) => t.id !== taskId,
          );
        });
        return { ...newColumns };
      });
    };

    // --- COLUMN HANDLERS ---
    const handleColumnCreate = (newCol: any) => {
      setColumns((prev) => ({
        ...prev,
        [newCol.id]: {
          name: newCol.name,
          tasks: [],
        },
      }));
    };

    const handleColumnDelete = ({ columnId }: { columnId: string }) => {
      setColumns((prev) => {
        const newColumns = { ...prev };
        delete newColumns[columnId];
        return { ...newColumns };
      });
    };

    // Register Listeners
    socket.on("kanban_task_created", handleTaskUpdate);
    socket.on("kanban_task_updated", handleTaskUpdate);
    socket.on("kanban_task_deleted", handleTaskDelete);
    socket.on("kanban_column_created", handleColumnCreate);
    socket.on("kanban_column_deleted", handleColumnDelete);

    // Cleanup
    return () => {
      socket.off("kanban_task_created", handleTaskUpdate);
      socket.off("kanban_task_updated", handleTaskUpdate);
      socket.off("kanban_task_deleted", handleTaskDelete);
      socket.off("kanban_column_created", handleColumnCreate);
      socket.off("kanban_column_deleted", handleColumnDelete);
    };
  }, [projectID]);

  useEffect(() => {
    if (!projectID) return;
    loadKanbanData();
    loadUsers();
  }, [projectID]);

  // Column Actions
  const addNewColumn = async () => {
    if (newColumnName.trim() === "") return;

    try {
      await api.post(`kanban/${projectID}/columns`, {
        name: newColumnName,
      });

      setNewColumnName("");
      setIsColumnDialogOpen(false);
      loadKanbanData();
    } catch (error) {
      toast("You dont have access to edit data");
      console.error("Error creating column:", error);
    }
  };

  const deleteColumn = async (columnId: string) => {
    try {
      await api.delete(`kanban/${projectID}/columns/${columnId}`);

      const updatedColumns = { ...columns };
      delete updatedColumns[columnId];
      setColumns(updatedColumns);
    } catch (error) {
      toast("You dont have access to edit data");
      console.error("Error deleting column:", error);
      loadKanbanData();
    }
  };

  // Task Actions
  const handleOpenAddDialog = (colId: string) => {
    setActiveColumnId(colId);
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskDesc("");
    setSelectedUsers([]);
    setIsTaskDialogOpen(true);
  };

  const handleOpenEditDialog = (colId: string, task: Task) => {
    setActiveColumnId(colId);
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDesc(task.description || "");
    setSelectedUsers(task.mentions || []);
    setIsTaskDialogOpen(true);
  };

  const saveTask = async () => {
    if (taskTitle.trim() === "" || !activeColumnId) return;

    try {
      if (editingTaskId) {
        await api.put(`kanban/${projectID}/tasks/${editingTaskId}`, {
          title: taskTitle,
          description: taskDesc,
          mentions: selectedUsers,
        });
      } else {
        await api.post(`kanban/${projectID}/tasks`, {
          columnId: activeColumnId,
          title: taskTitle,
          description: taskDesc,
          mentions: selectedUsers,
        });
      }

      setIsTaskDialogOpen(false);
      loadKanbanData();
    } catch (error) {
      toast("You dont have access to edit data");
      console.error("Error saving task:", error);
    }
  };

  const deleteTask = async (colId: string, taskId: string) => {
    try {
      await api.delete(`kanban/${projectID}/tasks/${taskId}`);

      const updated = { ...columns };
      updated[colId].tasks = updated[colId].tasks.filter(
        (t) => t.id !== taskId,
      );
      setColumns(updated);
    } catch (error) {
      console.error("Error deleting task:", error);
      toast("You dont have access to edit data");
      loadKanbanData();
    }
  };

  // Drag & Drop
  const handleDragStart = (columnId: string, taskId: string) =>
    setDraggedItem({ columnId, taskId });

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleDrop = async (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { columnId: sourceId, taskId } = draggedItem;
    if (sourceId === targetColumnId) return;

    try {
      const sourceTasks = [...columns[sourceId].tasks];
      const targetTasks = [...columns[targetColumnId].tasks];

      const taskIndex = sourceTasks.findIndex((t) => t.id === taskId);
      const [movedTask] = sourceTasks.splice(taskIndex, 1);
      targetTasks.push(movedTask);

      setColumns({
        ...columns,
        [sourceId]: { ...columns[sourceId], tasks: sourceTasks },
        [targetColumnId]: { ...columns[targetColumnId], tasks: targetTasks },
      });

      await api.put(`kanban/${projectID}/tasks/${taskId}/move`, {
        targetColumnId: targetColumnId,
      });
    } catch (error) {
      console.error("Error moving task:", error);
      toast("You dont have access to edit data");
      loadKanbanData();
    } finally {
      setDraggedItem(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading kanban board...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <LayoutPanelTop className="h-8 w-8" />
            Kanban Board
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your columns and tasks with ease
          </p>
        </div>

        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add New Column
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Column</DialogTitle>
            </DialogHeader>
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g. Backlog, QC..."
              onKeyDown={(e) => e.key === "Enter" && addNewColumn()}
            />
            <DialogFooter>
              <Button onClick={addNewColumn}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTaskId ? "Edit Task" : "New Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Title
              </label>
              <Input
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What's the task?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Description
              </label>
              <Textarea
                value={taskDesc}
                onChange={(e) => setTaskDesc(e.target.value)}
                placeholder="Describe the details..."
              />
            </div>

            {users.length > 0 && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-muted-foreground">
                  Mentions
                </label>
                <div className="flex gap-2 flex-wrap">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() =>
                        setSelectedUsers((prev) =>
                          prev.includes(user.id)
                            ? prev.filter((id) => id !== user.id)
                            : [...prev, user.id],
                        )
                      }
                      className={`h-8 w-auto px-2 rounded-full border text-xs font-bold transition-all ${
                        selectedUsers.includes(user.id)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border text-muted-foreground"
                      }`}
                      title={user.name}
                    >
                      {user.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button className="w-full" onClick={saveTask}>
              {editingTaskId ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kanban Scroll Area */}
      <div className="flex flex-row gap-6 pb-6 flex-wrap items-start justify-center">
        {Object.entries(columns).map(([columnId, column]) => (
          <div
            key={columnId}
            className="bg-secondary p-4 rounded-lg shadow-md border border-border min-w-[320px] max-w-[320px] flex-shrink-0"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, columnId)}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-foreground truncate max-w-[180px]">
                {column.name}
              </h2>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenAddDialog(columnId)}
                  className="h-8 w-8 hover:bg-accent"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteColumn(columnId)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-h-[100px]">
              <AnimatePresence mode="popLayout">
                {column.tasks.map((task) => (
                  <motion.div
                    draggable
                    layoutId={task.id}
                    key={task.id}
                    className="hover:shadow-md cursor-move group hover:border-none"
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ x: "-100%", scale: 0.5, opacity: 0 }}
                    onDragStart={() => handleDragStart(columnId, task.id)}
                  >
                    <Card className="p-4 bg-card border-border group relative cursor-grab">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-semibold pr-12">
                          {task.title}
                        </span>
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                            onClick={() => handleOpenEditDialog(columnId, task)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive"
                            onClick={() => deleteTask(columnId, task.id)}
                          >
                            <Trash className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      {task.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2 flex items-start gap-1">
                          <AlignLeft className="h-3 w-3 shrink-0 mt-0.5" />
                          {task.description}
                        </p>
                      )}
                      {task.mentions?.length && users.length > 0 ? (
                        <div className="flex -space-x-2 pt-2 border-t border-border mt-2">
                          {task.mentions.map((uId) => {
                            const user = users.find((u) => u.id === uId);
                            return user ? (
                              <div
                                key={uId}
                                className="h-6 w-6 rounded-full border-2 border-card bg-primary text-[10px] flex items-center justify-center font-bold text-primary-foreground"
                                title={user.name}
                              >
                                {user.initial}
                              </div>
                            ) : null;
                          })}
                        </div>
                      ) : null}
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
