import { useState } from "react";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { NativeSelect, NativeSelectOption } from "./ui/native-select";
import { AnimatePresence, motion } from "motion/react";
import { Trash } from "lucide-react";

type Task = {
  id: string;
  title: string;
};

type ColumnItem = {
  name: string;
  tasks: Task[];
};

type Column = {
  [key: string]: ColumnItem;
};
type DraggedItem = {
  columnId: string;
  taskId: string;
} | null;

export function Kanban() {
  const [columns, setColums] = useState<Column>({
    todo: {
      name: "To Do",
      tasks: [
        { id: "1", title: "Task 1" },
        { id: "2", title: "Task 2" },
      ],
    },
    inProgress: {
      name: "In Progress",
      tasks: [{ id: "3", title: "Task 3" }],
    },
    done: {
      name: "Done",
      tasks: [{ id: "4", title: "Task 4" }],
    },
  });
  const [newTask, setNewTasks] = useState<string>("");
  const [activeColumns, setActiveColumn] = useState<string>("todo");
  const [draggedItem, setDraggedItem] = useState<DraggedItem>(null);
  console.log("columns", draggedItem);

  const addNewTask = () => {
    if (newTask.trim() === "") return;
    const updatedColumns = { ...columns };
    updatedColumns[activeColumns].tasks.push({
      id: Date.now().toString(),
      title: newTask,
    });
    setColums(updatedColumns);
    setNewTasks("");
  };

  const handleDragStart = (columnId: string, taskId: string) => {
    setDraggedItem({ columnId, taskId });
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();

    if (!draggedItem) return;

    const { columnId: sourceColumnId, taskId: item } = draggedItem;

    if (sourceColumnId === columnId) return;

    const updatedColumns = { ...columns };

    const taskIndex = updatedColumns[sourceColumnId].tasks.findIndex(
      (task) => task.id === item,
    );
    const [movedTask] = updatedColumns[sourceColumnId].tasks.splice(
      taskIndex,
      1,
    );
    updatedColumns[columnId].tasks.push(movedTask);

    setColums(updatedColumns);
    setDraggedItem(null);
  };

  const removeTask = (columnId: string, taskId: string) => {
    const updatedColumns = { ...columns };
    updatedColumns[columnId].tasks = updatedColumns[columnId].tasks.filter(
      (task) => task.id !== taskId,
    );
    setColums(updatedColumns);
  };

  return (
    <div className="min-h-screen w-full ">
      <div className="flex flex-col gap-8 p-8">
        {/* Header Section */}
        <div className="flex flex-col gap-6 items-center">
          <div className="flex flex-col gap-2 items-center">
            <h1 className="text-5xl font-bold bg-clip-text ">Kanban Board</h1>
            <p className="text-sm">Organize your tasks efficiently</p>
          </div>

          {/* Add Task Section */}
          <Card className="w-full max-w-2xl p-6 shadow-lg border hover:border-none">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium mb-2 block">
                  Task Name
                </label>
                <Input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTasks(e.target.value)}
                  placeholder="Enter task title..."
                  className="h-11"
                  onKeyDown={(e) => e.key === "Enter" && addNewTask()}
                />
              </div>
              <div className="w-48">
                <label className="text-sm font-medium mb-2 block">Column</label>
                <NativeSelect
                  value={activeColumns}
                  onChange={(e) => setActiveColumn(e.target.value)}
                  className="h-11"
                >
                  {Object.entries(columns).map(([columnId, column]) => (
                    <NativeSelectOption
                      key={columnId}
                      value={columnId}
                      className="bg-card"
                    >
                      {column.name}
                    </NativeSelectOption>
                  ))}
                </NativeSelect>
              </div>
              <Button onClick={addNewTask} className="h-11 px-6 font-medium">
                Add Task
              </Button>
            </div>
          </Card>
        </div>

        {/* Kanban Columns */}
        <div className="flex gap-6 overflow-x-auto w-full px-4 pb-4 justify-center flex-wrap">
          {Object.entries(columns).map(([columnId, column]) => (
            <div
              key={columnId}
              className="min-w-[340px] flex-1 max-w-md p-5 overflow-hidden shadow-lg backdrop-blur bg-card rounded-lg border"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              {/* Column Header */}
              <div className="mb-5 pb-4 border-b">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  {column.name}
                  <span className="text-sm font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {column.tasks.length}
                  </span>
                </h2>
              </div>
              {/* Tasks */}
              <motion.div layout className="space-y-3 min-h-[200px]">
                <AnimatePresence mode="popLayout">
                  {column.tasks.length === 0 ? (
                    <div className="text-center py-8 text-sm">No tasks yet</div>
                  ) : (
                    column.tasks.map((task) => (
                      <Card
                        draggable
                        layoutId={task.id}
                        key={task.id}
                        className="p-4 shadow-sm hover:shadow-md cursor-move group border hover:border-none"
                        initial={{ y: -10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ x: "-100%", scale: 0.5, opacity: 0 }}
                        onDragStart={() => handleDragStart(columnId, task.id)}
                      >
                        <div className="flex gap-3 justify-between w-full  items-center">
                          <span className="font-medium flex-1">
                            {task.title}
                          </span>
                          <Button
                            onClick={() => removeTask(columnId, task.id)}
                            variant="destructive"
                          >
                            <Trash />
                          </Button>
                        </div>
                      </Card>
                    ))
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
