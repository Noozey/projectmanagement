import { CalendarUI } from "@/components/calendar-ui";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/calendar/$calendarID")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <CalendarUI />
    </div>
  );
}
