import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BarChart2, CheckSquare, Settings } from "lucide-react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetUserProfile } from "../hooks/useUserProfile";

interface AppHeaderProps {
  onOpenSettings: () => void;
  onSignOut: () => void;
  onOpenStats?: () => void;
}

export function AppHeader({
  onOpenSettings,
  onSignOut,
  onOpenStats,
}: AppHeaderProps) {
  const { login, clear, loginStatus, identity, isInitializing } =
    useInternetIdentity();
  const { data: profile } = useGetUserProfile();

  const principal = identity?.getPrincipal().toString();
  const shortPrincipal = principal
    ? `${principal.slice(0, 5)}...${principal.slice(-3)}`
    : null;

  const displayName = profile?.name || null;
  const displayLabel = displayName || shortPrincipal;
  const initials = displayName
    ? displayName.slice(0, 2).toUpperCase()
    : principal
      ? principal.slice(0, 2).toUpperCase()
      : "?";

  const isLoggedIn = !!identity;
  const isLoggingIn = loginStatus === "logging-in";

  const handleSignOut = () => {
    clear();
    onSignOut();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card shadow-xs">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <CheckSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            TaskFlow
          </span>
        </div>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {isInitializing ? (
            <div
              className="h-8 w-20 animate-pulse rounded-full bg-muted"
              data-ocid="auth.loading_state"
            />
          ) : isLoggedIn ? (
            <>
              <button
                type="button"
                onClick={handleSignOut}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:flex"
                data-ocid="auth.logout.button"
              >
                Sign out
              </button>
              {onOpenStats && (
                <button
                  type="button"
                  onClick={onOpenStats}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  aria-label="View stats"
                  data-ocid="stats.open_modal_button"
                >
                  <BarChart2 className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={onOpenSettings}
                className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                aria-label="Open settings"
                data-ocid="settings.open_modal_button"
              >
                <Settings className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium text-foreground sm:block">
                  {displayLabel}
                </span>
              </div>
            </>
          ) : (
            <Button
              size="sm"
              onClick={login}
              disabled={isLoggingIn}
              className="rounded-full"
              data-ocid="auth.signin.button"
            >
              {isLoggingIn ? "Signing in…" : "Sign In"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
