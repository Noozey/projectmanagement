import { createFileRoute } from "@tanstack/react-router";
import logo from "../../public/logo.png";

import { SignupForm } from "@/components/signup-form";

export const Route = createFileRoute("/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="bg-background my-5 h-screen rounded-2xl">
      <div className=" flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <img src={logo} alt="Logo" className="h-6 w-6" />
            </div>
            SriderDesk
          </a>
          <SignupForm />
        </div>
      </div>
    </div>
  );
}
