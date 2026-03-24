import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart2, CheckCircle2, ListTodo } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PersistedTodo, TodoId } from "../backend.d";
import { getSnapshotHistory } from "../hooks/useDailySnapshot";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useGetTodos } from "../hooks/useQueries";

interface StatsPageProps {
  onBack: () => void;
}

function formatDateLabel(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" });
}

export function StatsPage({ onBack }: StatsPageProps) {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;
  const { data: todos = [] } = useGetTodos();

  const allTodos = todos as Array<[TodoId, PersistedTodo]>;
  const activeTodos = allTodos.filter(([, t]) => !t.completed);
  const completedTodos = allTodos.filter(([, t]) => t.completed);

  // Group added tasks per day (last 7 days)
  const last7Days = getSnapshotHistory(7).map((s) => s.date);
  const addedPerDay: Record<string, number> = {};
  for (const d of last7Days) addedPerDay[d] = 0;
  for (const [, todo] of allTodos) {
    const ms = Number(todo.timestamp / 1_000_000n);
    const dateStr = new Date(ms).toISOString().slice(0, 10);
    if (dateStr in addedPerDay) {
      addedPerDay[dateStr] = (addedPerDay[dateStr] ?? 0) + 1;
    }
  }

  const addedChartData = last7Days.map((date) => ({
    date: formatDateLabel(date),
    tasks: addedPerDay[date] ?? 0,
  }));

  const snapshotHistory = getSnapshotHistory(7);
  const completedChartData = snapshotHistory.map((s) => ({
    date: formatDateLabel(s.date),
    completed: s.completed,
  }));

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="mb-6 flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        data-ocid="stats.back.button"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to tasks
      </button>

      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <BarChart2 className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Stats
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your task activity over the last 7 days.
          </p>
        </div>
      </div>

      {!isLoggedIn ? (
        <div
          className="rounded-lg border border-primary/20 bg-primary/5 p-6 text-center text-sm text-muted-foreground"
          data-ocid="stats.signin.prompt"
        >
          Sign in to view your task statistics.
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="mb-6 grid grid-cols-3 gap-4" data-ocid="stats.panel">
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <div className="mb-1 flex justify-center">
                  <ListTodo className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {allTodos.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total Tasks
                </p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <div className="mb-1 flex justify-center">
                  <ListTodo className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">
                  {activeTodos.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Active</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-5 pb-4">
                <div className="mb-1 flex justify-center">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <p className="text-2xl font-bold text-emerald-500">
                  {completedTodos.length}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
          </div>

          {/* Tasks Added chart */}
          <Card className="mb-6" data-ocid="stats.added.card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tasks Added</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={addedChartData}
                  margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="tasks"
                    fill="hsl(var(--primary))"
                    radius={[4, 4, 0, 0]}
                    name="Added"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Tasks Completed chart */}
          <Card data-ocid="stats.completed.card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Tasks Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={completedChartData}
                  margin={{ top: 4, right: 8, bottom: 0, left: -20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-border"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    className="fill-muted-foreground"
                  />
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--chart-2, 142 71% 45%))"
                    radius={[4, 4, 0, 0]}
                    name="Completed"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
