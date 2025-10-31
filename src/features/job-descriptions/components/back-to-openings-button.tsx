import type { ComponentProps } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utilities";

type BackToOpeningsButtonProperties = Omit<
  ComponentProps<typeof Button>,
  "children" | "asChild"
> & {
  to?: string;
  label?: string;
  linkClassName?: string;
};

export const BackToOpeningsButton = ({
  to = "/app/job-descriptions",
  label = "Back to openings",
  linkClassName,
  variant = "ghost",
  ...buttonProperties
}: BackToOpeningsButtonProperties) => (
  <Button {...buttonProperties} variant={variant} asChild>
    <Link
      to={to}
      className={cn(
        "inline-flex items-center gap-2 underline-offset-2 hover:underline",
        linkClassName,
      )}
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  </Button>
);
