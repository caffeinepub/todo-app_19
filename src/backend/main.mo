import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Types
  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Todo Types
  type TodoId = Nat;

  type PersistedTodo = {
    title : Text;
    completed : Bool;
    timestamp : Time.Time;
  };

  module PersistedTodo {
    public func compare(todo1 : PersistedTodo, todo2 : PersistedTodo) : Order.Order {
      Int.compare(todo1.timestamp, todo2.timestamp);
    };
  };

  type PersistedTodoList = {
    var nextId : TodoId;
    todos : Map.Map<TodoId, PersistedTodo>;
  };

  let todoLists = Map.empty<Principal, PersistedTodoList>();

  // Todo Id generation
  func getNextId(list : PersistedTodoList) : TodoId {
    let id = list.nextId;
    list.nextId += 1;
    id;
  };

  // Helper to find user's todo list or trap
  func findList(caller : Principal) : PersistedTodoList {
    switch (todoLists.get(caller)) {
      case (null) { Runtime.trap("Todo list not found") };
      case (?list) { list };
    };
  };

  // Helper to find todo or trap
  func findTodo(list : PersistedTodoList, todoId : TodoId) : PersistedTodo {
    switch (list.todos.get(todoId)) {
      case (null) { Runtime.trap("Todo not found") };
      case (?todo) { todo };
    };
  };

  // Delete todo list for test purposes
  public shared ({ caller }) func deleteAllTodos() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    todoLists.remove(caller);
  };

  // Create todo
  public shared ({ caller }) func addTodo(title : Text) : async TodoId {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    let todo : PersistedTodo = {
      title;
      completed = false;
      timestamp = Time.now();
    };
    let list = switch (todoLists.get(caller)) {
      case (null) {
        let newList : PersistedTodoList = { var nextId = 0; todos = Map.empty<TodoId, PersistedTodo>() };
        todoLists.add(caller, newList);
        newList;
      };
      case (?existingList) { existingList };
    };
    let todoId = getNextId(list);
    list.todos.add(todoId, todo);
    todoId;
  };

  // Toggle todo
  public shared ({ caller }) func toggle(todoId : TodoId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    let list = findList(caller);
    let todo = findTodo(list, todoId);
    let todoToggled = {
      todo with
      completed = not todo.completed;
    };
    list.todos.add(todoId, todoToggled);
  };

  // Delete todo
  public shared ({ caller }) func delete(todoId : TodoId) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    let list = findList(caller);
    ignore findTodo(list, todoId);
    list.todos.remove(todoId);
  };

  // Toggle all todos
  public shared ({ caller }) func toggleAll(completed : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    let list = findList(caller);
    let todos = list.todos;
    for ((id, todo) in todos.entries()) {
      let todoToggled = {
        todo with
        completed;
      };
      todos.add(id, todoToggled);
    };
  };

  // Complete all todos
  public shared ({ caller }) func completeAll() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    let list = findList(caller);
    let todos = list.todos;
    for ((id, todo) in todos.entries()) {
      let todoToggled = {
        todo with
        completed = true;
      };
      todos.add(id, todoToggled);
    };
  };

  // Clear completed todos
  public shared ({ caller }) func clearCompleted() : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    let list = findList(caller);
    let todos = list.todos;
    for ((id, todo) in todos.entries()) {
      if (todo.completed) { todos.remove(id) };
    };
  };

  // Get all todos
  public query ({ caller }) func getTodos() : async [(TodoId, PersistedTodo)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    switch (todoLists.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.todos.toArray().sort(
          func(todo1, todo2) { PersistedTodo.compare(todo1.1, todo2.1) }
        );
      };
    };
  };

  // Get active todos
  public query ({ caller }) func getActiveTodos() : async [(TodoId, PersistedTodo)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    switch (todoLists.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.todos.toArray().filter(
          func((_, todo)) { not todo.completed }
        ).sort(
          func(todo1, todo2) { PersistedTodo.compare(todo1.1, todo2.1) }
        );
      };
    };
  };

  // Get completed todos
  public query ({ caller }) func getCompletedTodos() : async [(TodoId, PersistedTodo)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) { Runtime.trap("Must be authenticated") };
    switch (todoLists.get(caller)) {
      case (null) { [] };
      case (?list) {
        list.todos.toArray().filter(
          func((_, todo)) { todo.completed }
        ).sort(
          func(todo1, todo2) { PersistedTodo.compare(todo1.1, todo2.1) }
        );
      };
    };
  };
};
