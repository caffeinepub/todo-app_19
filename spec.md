# TaskFlow

## Current State
The app uses an authorization module where `getUserRole` traps with "User is not registered" for any authenticated user not explicitly in the roles map. This causes `addTodo` (and all other authenticated calls) to fail for users who have never been explicitly assigned a role.

## Requested Changes (Diff)

### Add
- Nothing new.

### Modify
- `access-control.mo`: Change `getUserRole` to return `#user` for any non-anonymous principal with no assigned role, instead of trapping.

### Remove
- Nothing removed.

## Implementation Plan
1. Update `getUserRole` in `src/backend/authorization/access-control.mo` to return `#user` for authenticated principals with no explicit role.
