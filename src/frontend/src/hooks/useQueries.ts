import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TodoId } from "../backend.d";
import { useActor } from "./useActor";

export function useGetTodos() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTodos();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.addTodo(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useToggleTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: TodoId) => {
      if (!actor) throw new Error("Not connected");
      return actor.toggle(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useDeleteTodo() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: TodoId) => {
      if (!actor) throw new Error("Not connected");
      return actor.delete_(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}

export function useClearCompleted() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.clearCompleted();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
    },
  });
}
