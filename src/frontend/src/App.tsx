import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppFooter } from "./components/AppFooter";
import { AppHeader } from "./components/AppHeader";
import { TodoSection } from "./components/TodoSection";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-1">
          <TodoSection />
        </main>
        <AppFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
