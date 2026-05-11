import type { Lesson, ProgressRow } from "../types";

interface Props {
  lessons: Lesson[];
  progress: ProgressRow[];
}

export default function ProgressTracker({ lessons, progress }: Props) {
  const progressMap = new Map(progress.map((row) => [row.lesson_id, row]));
  const done = lessons.filter((lesson) => progressMap.get(lesson.id)?.completed === 1).length;
  const percent = Math.round((done / lessons.length) * 100);
  const chartData = lessons.map((lesson) => ({
    name: lesson.id,
    score: progressMap.get(lesson.id)?.score ?? 0
  }));

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-[1fr_220px]">
      <div>
        <div className="flex items-center justify-between text-xs font-medium text-[var(--color-muted)]">
          <span>{done}/{lessons.length} lecons validees</span>
          <span>{percent}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full rounded-full bg-[var(--color-accent)] transition-all" style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="flex h-12 items-end gap-1 rounded-md border border-[var(--color-line)] bg-black/20 px-2 py-2">
        {chartData.map((item) => (
          <span
            key={item.name}
            className="min-h-1 flex-1 rounded-t bg-[var(--color-accent-soft)]/80"
            style={{ height: `${Math.max(6, item.score)}%` }}
            title={`${item.name}: ${item.score}%`}
          />
        ))}
      </div>
    </div>
  );
}
