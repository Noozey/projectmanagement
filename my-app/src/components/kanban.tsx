import { useState } from "react";
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

// Types
type User = { id: string; name: string; initial: string };
type Task = {
  id: string;
  title: string;
  description?: string;
  mentions?: string[];
};
type ColumnItem = { name: string; tasks: Task[] };
type Column = { [key: string]: ColumnItem };

const MOCK_USERS: User[] = [
  { id: "u1", name: "Alice", initial: "A" },
  { id: "u2", name: "Bob", initial: "B" },
  { id: "u3", name: "Charlie", initial: "C" },
];

export function Kanban() {
  const [columns, setColums] = useState<Column>({
    todo: {
      name: "To Do",
      tasks: [
        {
          id: "1",
          title: "Setup Project",
          description: "Initial setup with Vite",
          mentions: ["u1"],
        },
      ],
    },
    inProgress: { name: "In Progress", tasks: [] },
    done: { name: "Done", tasks: [] },
  });

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

  // --- Column Actions ---
  const addNewColumn = () => {
    if (newColumnName.trim() === "") return;
    const id = Date.now().toString(); // Use timestamp for unique ID
    setColums({ ...columns, [id]: { name: newColumnName, tasks: [] } });
    setNewColumnName("");
    setIsColumnDialogOpen(false);
  };

  const deleteColumn = (columnId: string) => {
    const updatedColumns = { ...columns };
    delete updatedColumns[columnId];
    setColums(updatedColumns);
  };

  // --- Task Actions ---
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

  const saveTask = () => {
    if (taskTitle.trim() === "" || !activeColumnId) return;
    const updatedColumns = { ...columns };

    if (editingTaskId) {
      updatedColumns[activeColumnId].tasks = updatedColumns[
        activeColumnId
      ].tasks.map((t) =>
        t.id === editingTaskId
          ? {
              ...t,
              title: taskTitle,
              description: taskDesc,
              mentions: selectedUsers,
            }
          : t,
      );
    } else {
      updatedColumns[activeColumnId].tasks.push({
        id: Date.now().toString(),
        title: taskTitle,
        description: taskDesc,
        mentions: selectedUsers,
      });
    }
    setColums(updatedColumns);
    setIsTaskDialogOpen(false);
  };

  const deleteTask = (colId: string, taskId: string) => {
    const updated = { ...columns };
    updated[colId].tasks = updated[colId].tasks.filter((t) => t.id !== taskId);
    setColums(updated);
  };

  // --- Drag & Drop ---
  const handleDragStart = (columnId: string, taskId: string) =>
    setDraggedItem({ columnId, taskId });
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    if (!draggedItem) return;
    const { columnId: sourceId, taskId } = draggedItem;
    if (sourceId === targetColumnId) return;

    const sourceTasks = [...columns[sourceId].tasks];
    const targetTasks = [...columns[targetColumnId].tasks];
    const taskIndex = sourceTasks.findIndex((t) => t.id === taskId);
    const [movedTask] = sourceTasks.splice(taskIndex, 1);
    targetTasks.push(movedTask);

    setColums({
      ...columns,
      [sourceId]: { ...columns[sourceId], tasks: sourceTasks },
      [targetColumnId]: { ...columns[targetColumnId], tasks: targetTasks },
    });
    setDraggedItem(null);
  };

  return (
    <div className="p-8 bg-background min-h-screen text-foreground font-sans">
      <header className="mb-10 flex flex-col items-center gap-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">Kanban Board</h1>
          <p className="text-muted-foreground">
            Manage your columns and tasks with ease
          </p>
        </div>

        <Dialog open={isColumnDialogOpen} onOpenChange={setIsColumnDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-primary text-primary hover:bg-primary/10"
            >
              <LayoutPanelTop className="h-4 w-4" /> Add New Column
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-popover border-border">
            <DialogHeader>
              <DialogTitle>Create New Column</DialogTitle>
            </DialogHeader>
            <Input
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g. Backlog, QC..."
            />
            <DialogFooter>
              <Button onClick={addNewColumn}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {/* Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent className="bg-popover border-border max-w-md text-foreground">
          <DialogHeader>
            <DialogTitle>
              {editingTaskId ? "Edit Task" : "New Task"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-muted-foreground">
                Mentions
              </label>
              <div className="flex gap-2">
                {MOCK_USERS.map((user) => (
                  <button
                    key={user.id}
                    onClick={() =>
                      setSelectedUsers((prev) =>
                        prev.includes(user.id)
                          ? prev.filter((id) => id !== user.id)
                          : [...prev, user.id],
                      )
                    }
                    className={`h-8 w-8 rounded-full border text-xs font-bold transition-all ${selectedUsers.includes(user.id) ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border text-muted-foreground"}`}
                  >
                    {user.initial}
                  </button>
                ))}
              </div>
            </div>
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
                {/* Delete Column Button */}
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

                      {task.mentions?.length ? (
                        <div className="flex -space-x-2 pt-2 border-t border-border mt-2">
                          {task.mentions.map((uId) => (
                            <div
                              key={uId}
                              className="h-6 w-6 rounded-full border-2 border-card bg-primary text-[10px] flex items-center justify-center font-bold text-primary-foreground"
                            >
                              {MOCK_USERS.find((u) => u.id === uId)?.initial}
                            </div>
                          ))}
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
