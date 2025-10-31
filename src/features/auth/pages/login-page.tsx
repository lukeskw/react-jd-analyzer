import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { extractErrorMessage } from "@/lib/api/errors";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

const schema = z.object({
  email: z.email("Enter a valid email.").min(1, "Enter your email."),
  password: z
    .string()
    .min(1, "Enter your password.")
    .min(6, "Password must be at least 6 characters long."),
});

type FormValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const { login, status, token } = useAuth();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    document.title = "Sign in - JD Analyzer";
  }, []);

  useEffect(() => {
    if (token) {
      navigate("/app/job-descriptions", { replace: true });
    }
  }, [navigate, token]);

  const handleSubmit = async (values: FormValues) => {
    try {
      await login(values);
      navigate("/app/job-descriptions", { replace: true });
    } catch (error) {
      console.error("Login error", error);
      toast.error("Unable to sign in", {
        description: extractErrorMessage(error),
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">
            JD Analyzer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-medium">Sign in</h2>
            <p className="text-muted-foreground text-sm">
              Use your credentials to access the app
            </p>
          </div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={status === "loading"}
              >
                {status === "loading" ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};
