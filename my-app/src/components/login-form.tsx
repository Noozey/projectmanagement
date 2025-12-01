import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";

import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { useUser } from "@/context/user";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const { login } = useUser();

  const navigate = useNavigate();

  const handleSummit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api
        .post("/login", {
          email: email,
          password: password,
        })
        .then((res) => {
          const token = res.data.token;
          if ([200, 201, 202, 204].includes(res.status)) {
            toast.success(res.data.message);
            localStorage.setItem("token", res.data.token);
            login(token);
            navigate({ to: "/dashboard" });
          } else {
            toast.error(res.data.message);
          }
        });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription></CardDescription>
          <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
            Login with your account
          </FieldSeparator>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSummit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              <Field>
                <Button type="submit">Login</Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="/signup">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
