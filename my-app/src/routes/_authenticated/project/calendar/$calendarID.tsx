import { CalendarUI } from "@/components/calendar-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/project/calendar/$calendarID")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <CalendarUI />
    </div>
  );
}
