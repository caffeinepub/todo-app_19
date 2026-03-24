import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { PersistedTodo, TodoId } from "../backend.d";
import {
  getYesterdaySnapshot,
  updateSnapshot,
} from "../hooks/useDailySnapshot";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAddTodo,
  useDeleteTodo,
  useGetTodos,
  useToggleTodo,
} from "../hooks/useQueries";

type TodoEntry = [TodoId, PersistedTodo];

function formatDate(timestamp: bigint) {
  const ms = Number(timestamp / 1_000_000n);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(ms));
}

function DeltaBadge({
  current,
  yesterday,
}: { current: number; yesterday: number | null }) {
  if (yesterday === null) return null;
  const delta = current - yesterday;
  if (delta > 0) {
    return (
      <span className="ml-1.5 inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
        ▲ {delta}
      </span>
    );
  }
  if (delta < 0) {
    return (
      <span className="ml-1.5 inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-600 dark:text-red-400">
        ▼ {Math.abs(delta)}
      </span>
    );
  }
  return (
    <span className="ml-1.5 inline-block text-xs font-semibold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">
      = 0
    </span>
  );
}

function TodoRow({
  entry,
  index,
  onToggle,
  onDelete,
  isToggling,
  isDeleting,
}: {
  entry: TodoEntry;
  index: number;
  onToggle: (id: TodoId) => void;
  onDelete: (id: TodoId) => void;
  isToggling: boolean;
  isDeleting: boolean;
}) {
  const [id, todo] = entry;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ duration: 0.18 }}
      className="group flex items-center gap-3 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-secondary/60"
      data-ocid={`todo.item.${index + 1}`}
    >
      <Checkbox
        checked={todo.completed}
        onCheckedChange={() => onToggle(id)}
        disabled={isToggling}
        className="shrink-0"
        data-ocid={`todo.checkbox.${index + 1}`}
        aria-label={todo.completed ? "Mark as active" : "Mark as complete"}
      />
      <div className="min-w-0 flex-1">
        <p
          className={`truncate text-sm font-medium ${
            todo.completed
              ? "text-muted-foreground line-through"
              : "text-foreground"
          }`}
        >
          {todo.title}
        </p>
        {todo.completed && (
          <span className="text-xs text-muted-foreground">Completed</span>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <span className="hidden text-xs text-muted-foreground sm:block">
          {formatDate(todo.timestamp)}
        </span>
        {isDeleting ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <button
            type="button"
            onClick={() => onDelete(id)}
            className="rounded p-1 text-muted-foreground opacity-0 transition-all hover:text-destructive focus:opacity-100 group-hover:opacity-100"
            aria-label="Delete task"
            data-ocid={`todo.delete_button.${index + 1}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="flex flex-col items-center gap-2 py-12 text-muted-foreground"
      data-ocid="todo.empty_state"
    >
      <svg
        className="h-10 w-10 opacity-30"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <title>Empty tasks</title>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
        />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

export function TodoSection() {
  const { identity } = useInternetIdentity();
  const isLoggedIn = !!identity;

  const [taskInput, setTaskInput] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [pendingToggle, setPendingToggle] = useState<TodoId | null>(null);
  const [pendingDelete, setPendingDelete] = useState<TodoId | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: todos = [], isLoading } = useGetTodos();
  const addTodo = useAddTodo();
  const toggleTodo = useToggleTodo();
  const deleteTodo = useDeleteTodo();

  const allTodos: TodoEntry[] = todos as TodoEntry[];
  const activeTodos = allTodos.filter(([, t]) => !t.completed);
  const completedTodos = allTodos.filter(([, t]) => t.completed);

  const activeCount = activeTodos.length;
  const completedCount = completedTodos.length;

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      updateSnapshot(activeCount, completedCount);
    }
  }, [activeCount, completedCount, isLoading, isLoggedIn]);

  const yesterdaySnap = getYesterdaySnapshot();

  async function handleAddTask(e: FormEvent) {
    e.preventDefault();
    const title = taskInput.trim();
    if (!title) return;
    try {
      await addTodo.mutateAsync(title);
      setTaskInput("");
      inputRef.current?.focus();
      toast.success("Task added!");
    } catch {
      toast.error("Failed to add task");
    }
  }

  async function handleToggle(id: TodoId) {
    setPendingToggle(id);
    try {
      await toggleTodo.mutateAsync(id);
    } catch {
      toast.error("Failed to update task");
    } finally {
      setPendingToggle(null);
    }
  }

  async function handleDelete(id: TodoId) {
    setPendingDelete(id);
    try {
      await deleteTodo.mutateAsync(id);
      toast.success("Task deleted");
    } catch {
      toast.error("Failed to delete task");
    } finally {
      setPendingDelete(null);
    }
  }

  const tabTodos: TodoEntry[] =
    activeTab === "all"
      ? allTodos
      : activeTab === "active"
        ? activeTodos
        : completedTodos;

  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-2xl">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <h1 className="mb-3 text-5xl font-bold leading-tight tracking-tight text-foreground">
            Organize your day, <span className="text-primary">simply.</span>
          </h1>
          <p className="mx-auto max-w-md text-base text-muted-foreground">
            Keep track of your tasks, stay focused, and get things done &mdash;
            one checkmark at a time.
          </p>
        </motion.div>

        {/* Input row */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          onSubmit={handleAddTask}
          className="mb-6 flex gap-3"
        >
          <Input
            ref={inputRef}
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Add a new task…"
            disabled={!isLoggedIn || addTodo.isPending}
            className="h-11 flex-1 border-border bg-card text-sm shadow-xs"
            aria-label="New task title"
            data-ocid="todo.input"
          />
          <Button
            type="submit"
            disabled={!isLoggedIn || !taskInput.trim() || addTodo.isPending}
            className="h-11 shrink-0 px-5 font-semibold"
            data-ocid="todo.add_button"
          >
            {addTodo.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding…
              </>
            ) : (
              "+ Add Task"
            )}
          </Button>
        </motion.form>

        {/* Sign-in prompt */}
        {!isLoggedIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4 text-center text-sm text-muted-foreground"
            data-ocid="auth.signin.prompt"
          >
            Sign in to start managing your tasks.
          </motion.div>
        )}

        {/* Todo card — only visible when authenticated */}
        {isLoggedIn && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="overflow-hidden rounded-xl border border-border bg-card shadow-card"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="border-b border-border px-5">
                <TabsList className="h-12 gap-0 bg-transparent p-0">
                  <TabsTrigger
                    value="all"
                    className="h-12 rounded-none bg-transparent px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary"
                    data-ocid="todo.filter.tab"
                  >
                    All Tasks ({allTodos.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="active"
                    className="h-12 rounded-none bg-transparent px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary"
                    data-ocid="todo.active.tab"
                  >
                    Active ({activeTodos.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="completed"
                    className="h-12 rounded-none bg-transparent px-4 text-sm font-medium data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none data-[state=active]:text-primary"
                    data-ocid="todo.completed.tab"
                  >
                    Completed ({completedTodos.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              {["all", "active", "completed"].map((tab) => (
                <TabsContent
                  key={tab}
                  value={tab}
                  className="mt-0 focus-visible:ring-0"
                >
                  {isLoading ? (
                    <div
                      className="flex justify-center py-12"
                      data-ocid="todo.loading_state"
                    >
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : tabTodos.length === 0 ? (
                    <EmptyState
                      message={
                        tab === "completed"
                          ? "No completed tasks yet"
                          : tab === "active"
                            ? "No active tasks \u2014 you\u2019re all caught up! \uD83C\uDF89"
                            : "No tasks yet. Add one above!"
                      }
                    />
                  ) : (
                    <AnimatePresence initial={false}>
                      {tabTodos.map((entry, i) => (
                        <TodoRow
                          key={entry[0].toString()}
                          entry={entry}
                          index={i}
                          onToggle={handleToggle}
                          onDelete={handleDelete}
                          isToggling={pendingToggle === entry[0]}
                          isDeleting={pendingDelete === entry[0]}
                        />
                      ))}
                    </AnimatePresence>
                  )}
                </TabsContent>
              ))}
            </Tabs>

            {/* Footer summary with delta badges */}
            <div className="flex items-center justify-between border-t border-border bg-secondary/30 px-5 py-3 text-xs text-muted-foreground">
              <span className="flex items-center">
                {activeCount} task{activeCount !== 1 ? "s" : ""} remaining
                <DeltaBadge
                  current={activeCount}
                  yesterday={yesterdaySnap?.active ?? null}
                />
              </span>
              <span className="flex items-center">
                Completed: {completedCount}
                <DeltaBadge
                  current={completedCount}
                  yesterday={yesterdaySnap?.completed ?? null}
                />
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
}
