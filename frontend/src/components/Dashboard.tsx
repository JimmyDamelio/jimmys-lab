import { useMemo, useState } from "react";
import { ArrowRight, Award, CheckCircle2, Circle, Clock, FlaskConical, Gauge, LockKeyhole, Search, Sparkles, Trophy } from "lucide-react";
import type { LabProgressRow, Lesson, ProgressRow } from "../types";

interface Props {
  lessons: Lesson[];
  activeLessonId: string;
  progress: ProgressRow[];
  labProgress: LabProgressRow[];
  compact?: boolean;
  onSelect: (lessonId: string, targetView?: "lesson" | "lab") => void;
}

export default function Dashboard({ lessons, activeLessonId, progress, labProgress, compact = false, onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "todo" | "ready" | "done">("all");
  const progressMap = new Map(progress.map((row) => [row.lesson_id, row]));
  const labMap = new Map(labProgress.map((row) => [row.lesson_id, row]));
  const completed = lessons.filter((lesson) => progressMap.get(lesson.id)?.completed === 1).length;
  const labsDone = lessons.filter((lesson) => labMap.get(lesson.id)?.completed === 1).length;
  const xp = lessons.reduce((total, lesson) => total + (progressMap.get(lesson.id)?.completed ? lesson.xp : 0), 0);
  const rank = xp > 9000 ? "Guru" : xp > 5200 ? "Elite" : xp > 2600 ? "Hacker" : xp > 800 ? "Script Kiddie" : "Novice";
  const perfectQuizzes = progress.filter((row) => row.score === 100).length;
  const levelOneLabs = lessons.filter((lesson) => lesson.level === 1).every((lesson) => labMap.get(lesson.id)?.completed === 1);
  const badges = [
    completed > 0 && "First Blood",
    perfectQuizzes > 0 && "Quiz Master",
    levelOneLabs && "Network Architect",
    labsDone >= 10 && "Packet Wizard",
    lessons.filter((lesson) => lesson.level === 4).every((lesson) => progressMap.get(lesson.id)?.completed === 1) && "Pentester"
  ].filter(Boolean) as string[];
  const timeline = [...progress.map((row) => ({ type: "Quiz", lesson_id: row.lesson_id, at: row.updated_at, value: `${row.score}%` })), ...labProgress.map((row) => ({ type: "Lab", lesson_id: row.lesson_id, at: row.updated_at, value: row.completed ? "valide" : "en cours" }))]
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 5);
  const grouped = lessons.reduce<Record<number, Lesson[]>>((acc, lesson) => {
    acc[lesson.level] ??= [];
    acc[lesson.level].push(lesson);
    return acc;
  }, {});
  const isLocked = (lesson: Lesson) =>
    lesson.level > 1 && lessons.filter((item) => item.level === lesson.level - 1).some((item) => (progressMap.get(item.id)?.score ?? 0) < 80);
  const nextAction = lessons.find((lesson) => {
    if (isLocked(lesson)) return false;
    return progressMap.get(lesson.id)?.completed !== 1 || labMap.get(lesson.id)?.completed !== 1;
  });
  const nextActionTarget = nextAction && progressMap.get(nextAction.id)?.completed === 1 ? "lab" : "lesson";
  const filteredGrouped = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return Object.entries(grouped).reduce<Record<number, Lesson[]>>((acc, [level, items]) => {
      const filteredItems = items.filter((lesson) => {
        const row = progressMap.get(lesson.id);
        const labRow = labMap.get(lesson.id);
        const done = row?.completed === 1;
        const labDone = labRow?.completed === 1;
        const locked = isLocked(lesson);
        const matchesQuery =
          !normalizedQuery ||
          [lesson.id, lesson.title, lesson.module, lesson.levelName, lesson.difficulty, lesson.labType]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery);
        const matchesFilter =
          filter === "all" ||
          (filter === "todo" && (!done || !labDone)) ||
          (filter === "ready" && !locked && (!done || !labDone)) ||
          (filter === "done" && done && labDone);

        return matchesQuery && matchesFilter;
      });

      if (filteredItems.length > 0) acc[Number(level)] = filteredItems;
      return acc;
    }, {});
  }, [filter, grouped, labMap, progressMap, query]);
  const hasVisibleLessons = Object.values(filteredGrouped).some((items) => items.length > 0);

  if (compact) {
    return (
      <div className="space-y-3 p-3">
        <button
          onClick={() => nextAction && onSelect(nextAction.id, nextActionTarget)}
          className="grid w-full place-items-center rounded-md border border-[var(--color-line)] bg-[var(--color-panel)] p-3 text-[var(--color-accent-soft)] transition hover:border-[var(--color-accent-soft)]"
          title={nextAction ? `Prochaine action: ${nextAction.id}` : "Parcours termine"}
        >
          <Sparkles size={19} />
          <span className="mt-1 text-[11px] font-semibold">{completed}/{lessons.length}</span>
        </button>
        <div className="space-y-2">
          {lessons.map((lesson) => {
            const row = progressMap.get(lesson.id);
            const done = row?.completed === 1;
            const locked = isLocked(lesson);
            return (
              <button
                key={lesson.id}
                onClick={() => onSelect(lesson.id)}
                className={`grid h-11 w-full place-items-center rounded-md border text-xs font-semibold transition ${
                  activeLessonId === lesson.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                    : "border-[var(--color-line)] bg-white/[0.04] text-[var(--color-muted)] hover:border-[var(--color-accent-soft)] hover:text-white"
                }`}
                title={`${lesson.id} ${lesson.title}`}
              >
                {locked ? <LockKeyhole size={15} /> : done ? <CheckCircle2 size={16} /> : lesson.id}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="panel p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-50">Parcours</span>
          <Gauge size={18} className="text-[var(--color-accent-soft)]" />
        </div>
        <p className="mt-2 text-sm text-[var(--color-muted)]">{completed}/{lessons.length} lecons | {labsDone}/{lessons.length} labs | {xp} XP | Rang {rank}</p>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <span className="rounded border border-[var(--color-line)] bg-white/5 px-2 py-2"><Award size={14} className="inline" /> {badges.length} badges</span>
          <span className="rounded border border-[var(--color-line)] bg-white/5 px-2 py-2"><FlaskConical size={14} className="inline" /> Labs {Math.round((labsDone / lessons.length) * 100)}%</span>
        </div>
        {badges.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {badges.map((badge) => (
              <span key={badge} className="inline-flex items-center gap-1 rounded border border-[var(--color-accent-soft)]/40 bg-[var(--color-accent)]/15 px-2 py-1 text-[var(--color-accent-soft)]">
                <Trophy size={13} />
                {badge}
              </span>
            ))}
          </div>
        )}
        {timeline.length > 0 && (
          <div className="mt-4 border-t border-[var(--color-line)] pt-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Timeline</p>
            <div className="mt-2 space-y-2">
              {timeline.map((item) => (
                <div key={`${item.type}-${item.lesson_id}-${item.at}`} className="flex items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
                  <span>{item.type} {item.lesson_id}</span>
                  <span className="rounded bg-black/30 px-2 py-1">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {nextAction && (
        <button
          onClick={() => onSelect(nextAction.id, nextActionTarget)}
          className="panel flex w-full items-start gap-3 p-4 text-left transition hover:border-[var(--color-accent-soft)] hover:bg-[var(--color-accent)]/10"
        >
          <Sparkles className="mt-0.5 shrink-0 text-[var(--color-accent-soft)]" size={19} />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">Prochaine action</p>
            <h3 className="mt-1 truncate font-semibold">{nextAction.id} {nextAction.title}</h3>
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              {nextActionTarget === "lab" ? "Passer au lab pratique" : "Valider la lecon et viser 80% au quiz"}
            </p>
          </div>
          <ArrowRight className="mt-1 shrink-0 text-[var(--color-muted)]" size={18} />
        </button>
      )}

      <div className="panel p-3">
        <label className="flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-black/25 px-3 py-2">
          <Search size={16} className="shrink-0 text-[var(--color-muted)]" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Rechercher module, lecon, lab..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-50 outline-none placeholder:text-slate-400/50"
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          {[
            ["all", "Tout"],
            ["ready", "Pret"],
            ["todo", "A faire"],
            ["done", "Termine"]
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setFilter(id as typeof filter)}
              className={`rounded-md border px-2 py-2 font-semibold ${
                filter === id ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white" : "border-[var(--color-line)] bg-white/5 text-slate-100 hover:bg-white/10"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {!hasVisibleLessons && (
          <div className="rounded-md border border-[var(--color-line)] bg-black/25 p-4 text-sm text-[var(--color-muted)]">
            Aucun module ne correspond a ce filtre.
          </div>
        )}
        {Object.entries(filteredGrouped).map(([level, items]) => (
          <section key={level} className="space-y-2">
            <h2 className="px-1 text-xs font-bold uppercase tracking-wider text-[var(--color-accent-soft)]">
              Niveau {level} - {items[0].levelName}
            </h2>
            {items.map((lesson) => {
              const row = progressMap.get(lesson.id);
              const labRow = labMap.get(lesson.id);
              const done = row?.completed === 1;
              const labDone = labRow?.completed === 1;
              const locked = isLocked(lesson);
              return (
                <button
                  key={lesson.id}
                  onClick={() => onSelect(lesson.id)}
                  className={`w-full rounded-md border p-3 text-left transition ${
                    activeLessonId === lesson.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                      : "border-[var(--color-line)] bg-white/[0.04] hover:border-[var(--color-accent-soft)]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {done ? <CheckCircle2 className="mt-0.5 shrink-0 text-[var(--color-accent-soft)]" size={19} /> : locked ? <LockKeyhole className="mt-0.5 shrink-0 text-red-300" size={18} /> : <Circle className="mt-0.5 shrink-0 text-slate-300/50" size={19} />}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="truncate font-semibold">{lesson.id} {lesson.title}</h3>
                        <span className="shrink-0 rounded bg-black/30 px-2 py-1 text-xs text-slate-100">{row?.score ?? 0}%</span>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--color-muted)]">
                        <span>{lesson.difficulty}</span>
                        <span className="inline-flex items-center gap-1"><Clock size={13} />{lesson.duration}</span>
                        <span>{lesson.xp} XP</span>
                        {labDone && <span className="text-[var(--color-accent-soft)]">Lab OK</span>}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </section>
        ))}
      </div>
    </div>
  );
}
