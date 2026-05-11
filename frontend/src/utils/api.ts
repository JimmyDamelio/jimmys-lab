import type { LabProgressRow, ProgressRow, QuizAttemptRow } from "../types";

const baseUrl = import.meta.env.VITE_API_URL ?? "";

export async function fetchProgress(): Promise<ProgressRow[]> {
  const response = await fetch(`${baseUrl}/api/progress`);
  if (!response.ok) return [];
  return response.json();
}

export async function saveProgress(lessonId: string, completed: boolean, score: number) {
  await fetch(`${baseUrl}/api/progress/${lessonId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed, score })
  });
}

export async function fetchQuizAttempts(lessonId: string): Promise<QuizAttemptRow[]> {
  const response = await fetch(`${baseUrl}/api/progress/${lessonId}/attempts`);
  if (!response.ok) return [];
  return response.json();
}

export async function saveQuizAttempt(lessonId: string, score: number, passed: boolean, answers: Record<number, number>) {
  await fetch(`${baseUrl}/api/progress/${lessonId}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ score, passed, answers })
  });
}

export async function fetchLabProgress(): Promise<LabProgressRow[]> {
  const response = await fetch(`${baseUrl}/api/progress/labs`);
  if (!response.ok) return [];
  return response.json();
}

export async function fetchProgressExport(): Promise<Record<string, unknown> | null> {
  const response = await fetch(`${baseUrl}/api/progress/export`);
  if (!response.ok) return null;
  return response.json();
}

export async function saveLabProgress(lessonId: string, completed: boolean, evidence: string) {
  await fetch(`${baseUrl}/api/progress/${lessonId}/lab`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed, evidence })
  });
}

export async function getNotes(lessonId: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/progress/${lessonId}/notes`);
  if (!response.ok) return "";
  const data = await response.json();
  return data.content ?? "";
}

export async function saveNotes(lessonId: string, content: string) {
  await fetch(`${baseUrl}/api/progress/${lessonId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });
}

export async function saveLabRun(lessonId: string, command: string, output: string) {
  await fetch(`${baseUrl}/api/progress/${lessonId}/lab-run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command, output })
  });
}
