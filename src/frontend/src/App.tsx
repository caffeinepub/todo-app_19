import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { SettingsPage } from "./components/SettingsPage";
import { StatsPage } from "./components/StatsPage";
import { TodoSection } from "./components/TodoSection";
import { useTheme } from "./hooks/useTheme";

const queryClient = new QueryClient();

type View = "home" | "settings" | "stats";

export default function App() {
  const [view, setView] = useState<View>("home");
  useTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader
          onOpenSettings={() => setView("settings")}
          onSignOut={() => setView("home")}
          onOpenStats={() => setView("stats")}
        />
        <main className="flex-1">
          {view === "settings" ? (
            <SettingsPage onBack={() => setView("home")} />
          ) : view === "stats" ? (
            <StatsPage onBack={() => setView("home")} />
          ) : (
            <TodoSection />
          )}
        </main>
        <AppFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
