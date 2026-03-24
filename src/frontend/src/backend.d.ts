import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface PersistedTodo {
    title: string;
    completed: boolean;
    timestamp: Time;
}
export interface UserProfile {
    name: string;
}
export type TodoId = bigint;
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addTodo(title: string): Promise<TodoId>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    clearCompleted(): Promise<void>;
    completeAll(): Promise<void>;
    delete_(todoId: TodoId): Promise<void>;
    deleteAllTodos(): Promise<void>;
    getActiveTodos(): Promise<Array<[TodoId, PersistedTodo]>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCompletedTodos(): Promise<Array<[TodoId, PersistedTodo]>>;
    getTodos(): Promise<Array<[TodoId, PersistedTodo]>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggle(todoId: TodoId): Promise<void>;
    toggleAll(completed: boolean): Promise<void>;
}
