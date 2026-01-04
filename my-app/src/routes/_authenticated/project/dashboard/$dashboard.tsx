import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Users, CheckCircle2, Clock } from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/project/dashboard/$dashboard",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const projects = [
    {
      id: 1,
      name: "Website Redesign",
      status: "In Progress",
      members: 5,
      tasks: 12,
      completed: 8,
    },
    {
      id: 2,
      name: "Mobile App Development",
      status: "In Progress",
      members: 8,
      tasks: 24,
      completed: 10,
    },
    {
      id: 3,
      name: "Marketing Campaign",
      status: "Completed",
      members: 4,
      tasks: 15,
      completed: 15,
    },
    {
      id: 4,
      name: "Product Launch",
      status: "Planning",
      members: 6,
      tasks: 8,
      completed: 2,
    },
  ];

  const stats = [
    {
      label: "Total Projects",
      value: "12",
      icon: Folder,
      color: "bg-gray-500",
    },
    {
      label: "Active Projects",
      value: "8",
      icon: Clock,
      color: "bg-gray-500",
    },
    {
      label: "Completed",
      value: "4",
      icon: CheckCircle2,
      color: "bg-gray-500",
    },
    { label: "Team Members", value: "24", icon: Users, color: "bg-gray-500" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Completed":
        return "bg-green-100 text-green-700";
      case "Planning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-background my-5 p-6 h-screen rounded-2xl">
      <div className="mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex flex-col w-full items-center">
            <h1 className="text-3xl font-bold">Projects</h1>
            <p>Manage and track your projects</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap max-width-7xl gap-8">
          {stats.map((stat, index) => (
            <Card key={index} className="flex-1">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1 text-center">
                      {stat.value}
                    </p>
                  </div>
                  <div
                    className={`${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}
                  >
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Projects List */}

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">All Projects</h2>
          </div>

          <div className="space-y-4 overflow-y-auto">
            {projects.map((project) => (
              <Card
                key={project.id}
                className="group transition-colors hover:bg-gray-50"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                      <Folder className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold">{project.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {project.members} members
                        </span>
                        <span>
                          {project.completed}/{project.tasks} tasks completed
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        project.status,
                      )}`}
                    >
                      {project.status}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      className="
                        transition-colors
                        group-hover:!bg-destructive
                        group-hover:!text-destructive-foreground
                        group-hover:!border-destructive
                      "
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
