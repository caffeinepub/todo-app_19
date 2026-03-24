# TaskFlow

## Current State
TaskFlow is a privacy-focused to-do app with Internet Identity auth. Key files:
- `App.tsx` — view state machine: `"home"` | `"settings"`, renders `TodoSection` or `SettingsPage`
- `AppHeader.tsx` — sticky header with sign-in/out, settings gear icon, avatar
- `TodoSection.tsx` — main task UI with Active/Completed/All tabs + footer showing "N tasks remaining" and "Completed: N"
- `SettingsPage.tsx` — display name + theme toggle
- `useQueries.ts` — react-query hooks for getTodos, addTodo, toggle, delete_
- `backend.d.ts` — PersistedTodo has title, completed, timestamp (bigint nanoseconds)
- No historical task event tracking exists in the backend

## Requested Changes (Diff)

### Add
- StatsPage component with two recharts bar charts: tasks added per day (from timestamps) and completed per day (from localStorage snapshots), plus summary stat cards
- useDailySnapshot hook: on every todo fetch, writes today snapshot {active, completed} to localStorage. Returns 7-day history array and yesterday snapshot.
- Delta badges in TodoSection footer: show green up arrow or red down arrow + number vs yesterday for active and completed counts
- BarChart2 icon button in AppHeader next to Settings gear, triggers onOpenStats prop, only when logged in

### Modify
- App.tsx: add "stats" to View type, pass onOpenStats to AppHeader, render StatsPage
- AppHeader.tsx: accept onOpenStats prop, render BarChart2 button
- TodoSection.tsx: use useDailySnapshot, render delta badges in footer

### Remove
- Nothing

## Implementation Plan
1. Create useDailySnapshot.ts hook
2. Create StatsPage.tsx with charts and stat cards
3. Update TodoSection.tsx with delta badges
4. Update AppHeader.tsx with stats icon
5. Update App.tsx with stats view
