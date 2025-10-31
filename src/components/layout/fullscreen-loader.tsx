import { Loader2 } from "lucide-react";

export const FullscreenLoader = () => (
  <div className="flex min-h-screen items-center justify-center">
    <div className="flex items-end justify-center gap-2">
      <Loader2 className="size-8 animate-spin" />
    </div>
  </div>
);
