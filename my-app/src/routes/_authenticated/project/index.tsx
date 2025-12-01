import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FolderPlus, Users, FileText, X } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/project/")({
  component: RouteComponent,
});

function RouteComponent() {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [projectPriority, setProjectPriority] = useState("");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("");
  const [email, setEmail] = useState("");

  const [projectManager, setProjectManager] = useState("");
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, email: "", role: "" },
  ]);

  const [users, setUsers] = useState();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (email) {
        api.post("/user/profile", { email }).then((res) => {
          if ([200, 201, 202, 204].includes(res.status)) {
            setUsers(res.data.message);
          }
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [email]);

  const addTeamMember = () => {
    setTeamMembers([...teamMembers, { id: Date.now(), email: "", role: "" }]);
  };

  const removeTeamMember = (id) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((member) => member.id !== id));
    }
  };

  const updateTeamMember = (id, field, value) => {
    setTeamMembers(
      teamMembers.map((member) =>
        member.id === id ? { ...member, [field]: value } : member,
      ),
    );
  };

  const handleSubmit = async () => {
    const projectData = {
      projectName,
      projectDescription,
      projectCategory,
      projectPriority,
      duration: { value: durationValue, unit: durationUnit },
      projectManager,
      teamMembers,
    };

    await api.post("/project", { projectData }).then((res) => {
      if ([200, 201, 202, 204].includes(res.status)) {
        toast(res.data.message);
        setProjectName("");
        setProjectDescription("");
        setProjectCategory("");
        setProjectPriority("");
        setDurationValue("");
        setDurationUnit("");
        setProjectManager("");
        setTeamMembers([{ id: 1, email: "", role: "" }]);
      } else {
        toast(res.data.message);
      }
    });
  };

  const handleCancel = () => {
    setProjectName("");
    setProjectDescription("");
    setProjectCategory("");
    setProjectPriority("");
    setDurationValue("");
    setDurationUnit("");
    setProjectManager("");
    setTeamMembers([{ id: 1, email: "", role: "" }]);
  };

  return (
    <div className="bg-background my-5 h-screen rounded-2xl p-6">
      <div>
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderPlus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Create New Project</h1>
              <p>Fill in the details to get started</p>
            </div>
          </div>
        </div>

        <Card className="shadow-lg">
          <CardContent className="p-8">
            <div className="space-y-8">
              {/* Project Basic Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <FileText className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Project Information</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    placeholder="Enter project name"
                    className="text-lg"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-description">
                    Project Description
                  </Label>
                  <Textarea
                    id="project-description"
                    placeholder="Describe your project goals and objectives..."
                    className="min-h-[120px] resize-none"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-category">Category</Label>
                    <Input
                      id="project-category"
                      placeholder="e.g., Development, Marketing, Design"
                      value={projectCategory}
                      onChange={(e) => setProjectCategory(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-priority">Priority</Label>
                    <Input
                      id="project-priority"
                      placeholder="e.g., High, Medium, Low"
                      value={projectPriority}
                      onChange={(e) => setProjectPriority(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">Project Duration</Label>
                  <div className="flex gap-2">
                    <Input
                      id="duration"
                      type="number"
                      placeholder="0"
                      className="w-32"
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                    />
                    <Input
                      placeholder="days/weeks/months"
                      className="flex-1"
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Team Members */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b">
                  <Users className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Team Members</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project-manager">Project Manager *</Label>
                  <Input
                    id="project-manager"
                    placeholder="Select or enter project manager"
                    value={projectManager}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setProjectManager(e.target.value);
                    }}
                  />

                  {users && email && projectManager === email && (
                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                      {Array.isArray(users) && users.length > 0 ? (
                        users.map((user, index) => (
                          <div
                            key={index}
                            className="px-4 py-2 cursor-pointer"
                            onClick={() => {
                              setProjectManager(user.email);
                              setEmail("");
                              setUsers(null);
                            }}
                          >
                            <div className="font-medium">
                              {user.name || user.email || user}
                            </div>
                            {user.email && user.name && (
                              <div className="text-sm text-gray-500">
                                {user.email}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-gray-500">
                          No users found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>Team Members</Label>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="space-y-2">
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <Input
                              placeholder="Enter email or name"
                              className="flex-1"
                              value={member.email}
                              onChange={(e) => {
                                updateTeamMember(
                                  member.id,
                                  "email",
                                  e.target.value,
                                );
                                setEmail(e.target.value);
                              }}
                            />
                            {users && email && member.email === email && (
                              <div className="absolute z-10 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                                {Array.isArray(users) && users.length > 0 ? (
                                  users.map((user, index) => (
                                    <div
                                      key={index}
                                      className="px-4 py-2 cursor-pointer"
                                      onClick={() => {
                                        updateTeamMember(
                                          member.id,
                                          "email",
                                          user.email || user,
                                        );
                                        setEmail("");
                                        setUsers(null);
                                      }}
                                    >
                                      <div className="font-medium">
                                        {user.name || user.email || user}
                                      </div>
                                      {user.email && user.name && (
                                        <div className="text-sm text-gray-500">
                                          {user.email}
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="px-4 py-2 text-gray-500">
                                    No users found
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          <Input
                            placeholder="Role"
                            className="w-40"
                            value={member.role}
                            onChange={(e) =>
                              updateTeamMember(
                                member.id,
                                "role",
                                e.target.value,
                              )
                            }
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="shrink-0 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                            onClick={() => removeTeamMember(member.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={addTeamMember}
                  >
                    + Add Team Member
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  size="lg"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button className="flex-1" size="lg" onClick={handleSubmit}>
                  Create Project
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
