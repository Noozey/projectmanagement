import { createFileRoute } from "@tanstack/react-router";
import { Kanban } from "@/components/kanban";

export const Route = createFileRoute("/_authenticated/task/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-background my-5 h-screen rounded-2xl">
      <Kanban />
    </div>
  );
}
