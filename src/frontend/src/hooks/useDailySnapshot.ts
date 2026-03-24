const STORAGE_KEY = "taskflow_snapshots";

type SnapshotRecord = Record<string, { active: number; completed: number }>;

type SnapshotEntry = { date: string; active: number; completed: number };

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function getDateStr(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function loadSnapshots(): SnapshotRecord {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveSnapshots(data: SnapshotRecord): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function updateSnapshot(active: number, completed: number): void {
  const snapshots = loadSnapshots();
  snapshots[getToday()] = { active, completed };
  saveSnapshots(snapshots);
}

export function getYesterdaySnapshot(): {
  active: number;
  completed: number;
} | null {
  const snapshots = loadSnapshots();
  const yesterday = getDateStr(-1);
  return snapshots[yesterday] ?? null;
}

export function getSnapshotHistory(days: number): SnapshotEntry[] {
  const snapshots = loadSnapshots();
  const result: SnapshotEntry[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = getDateStr(-i);
    const snap = snapshots[date] ?? { active: 0, completed: 0 };
    result.push({ date, ...snap });
  }
  return result;
}
