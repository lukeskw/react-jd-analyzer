import { useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { EllipsisVertical, LogOut, SunMoon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

export const AppLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuReference = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleThemeChange = () => {
    toggleTheme();
    setIsMenuOpen(false);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    handleLogout();
  };

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const menuElement = menuReference.current;
      if (!menuElement) return;
      if (menuElement.contains(event.target as Node)) {
        return;
      }
      setIsMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/40 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <Link to="/app/job-descriptions" className="text-lg font-semibold">
            JD Analyzer
          </Link>
          <div className="flex items-center gap-3">
            {user && (
              <div className="text-sm text-muted-foreground">{user.name}</div>
            )}
            <div className="relative" ref={menuReference}>
              <Button
                variant="ghost"
                size="icon"
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-label="Abrir menu"
                onClick={() => setIsMenuOpen((open) => !open)}
                type="button"
              >
                <EllipsisVertical />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 z-10 mt-2 w-40 rounded-md border bg-card py-1 shadow-md">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none px-3 py-2 text-sm"
                    onClick={handleLogoutClick}
                    type="button"
                  >
                    <LogOut className="size-4" />
                    Logout
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start rounded-none px-3 py-2 text-sm"
                    onClick={handleThemeChange}
                    type="button"
                  >
                    <SunMoon className="size-4" />
                    Switch Theme
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};
