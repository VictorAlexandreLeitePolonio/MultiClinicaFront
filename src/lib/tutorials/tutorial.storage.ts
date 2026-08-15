import type { TutorialModuleId } from "./tutorial.types";

const TUTORIAL_STORAGE_KEY = "multiclinica:tutorials:v1";

interface TutorialStorage {
  modules: Partial<Record<TutorialModuleId, { completed: boolean }>>;
  invitesSeen: Partial<Record<TutorialModuleId, boolean>>;
  tasks: Record<string, { completed: boolean }>;
}

const emptyStorage = (): TutorialStorage => ({ modules: {}, invitesSeen: {}, tasks: {} });

function isTutorialStorage(
  value: unknown,
): value is Pick<TutorialStorage, "modules" | "invitesSeen"> {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.modules === "object" &&
    candidate.modules !== null &&
    typeof candidate.invitesSeen === "object" &&
    candidate.invitesSeen !== null
  );
}

export function getTutorialStorage(): TutorialStorage {
  if (typeof window === "undefined") return emptyStorage();

  const raw = window.localStorage.getItem(TUTORIAL_STORAGE_KEY);
  if (!raw) return emptyStorage();

  try {
    const parsed = JSON.parse(raw);
    if (!isTutorialStorage(parsed)) return emptyStorage();
    // tasks was added later — older stored blobs won't have it yet.
    const tasks = (parsed as { tasks?: unknown }).tasks;
    return {
      ...parsed,
      tasks: typeof tasks === "object" && tasks !== null ? (tasks as TutorialStorage["tasks"]) : {},
    };
  } catch {
    return emptyStorage();
  }
}

function saveTutorialStorage(storage: TutorialStorage) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(storage));
}

export function isTutorialCompleted(moduleId: TutorialModuleId): boolean {
  return getTutorialStorage().modules[moduleId]?.completed ?? false;
}

export function markTutorialCompleted(moduleId: TutorialModuleId) {
  const storage = getTutorialStorage();
  storage.modules[moduleId] = { completed: true };
  saveTutorialStorage(storage);
}

function taskKey(moduleId: string, taskId: string): string {
  return `${moduleId}:${taskId}`;
}

export function isTaskCompleted(moduleId: string, taskId: string): boolean {
  return getTutorialStorage().tasks[taskKey(moduleId, taskId)]?.completed ?? false;
}

export function markTaskCompleted(moduleId: string, taskId: string) {
  const storage = getTutorialStorage();
  storage.tasks[taskKey(moduleId, taskId)] = { completed: true };
  saveTutorialStorage(storage);
}

export function hasSeenTutorialInvite(moduleId: TutorialModuleId): boolean {
  return getTutorialStorage().invitesSeen[moduleId] ?? false;
}

export function markTutorialInviteSeen(moduleId: TutorialModuleId) {
  const storage = getTutorialStorage();
  storage.invitesSeen[moduleId] = true;
  saveTutorialStorage(storage);
}
