import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Download, Trophy } from "lucide-react";
import type { LabProgressRow, Lesson, ProgressRow } from "../types";
import { fetchProgressExport } from "../utils/api";

interface Props {
  lessons: Lesson[];
  progress: ProgressRow[];
  labProgress: LabProgressRow[];
}

export default function StatsPanel({ lessons, progress, labProgress }: Props) {
  const [exportData, setExportData] = useState<Record<string, unknown> | null>(null);
  const progressMap = useMemo(() => new Map(progress.map((row) => [row.lesson_id, row])), [progress]);
  const labMap = useMemo(() => new Map(labProgress.map((row) => [row.lesson_id, row])), [labProgress]);

  useEffect(() => {
    fetchProgressExport().then(setExportData);
  }, [progress.length, labProgress.length]);

  const byLevel = [1, 2, 3, 4].map((level) => {
    const levelLessons = lessons.filter((lesson) => lesson.level === level);
    const quizDone = levelLessons.filter((lesson) => progressMap.get(lesson.id)?.completed === 1).length;
    const labsDone = levelLessons.filter((lesson) => labMap.get(lesson.id)?.completed === 1).length;
    const avgScore = Math.round(
      levelLessons.reduce((total, lesson) => total + (progressMap.get(lesson.id)?.score ?? 0), 0) / levelLessons.length
    );
    return {
      level: `N${level}`,
      quiz: Math.round((quizDone / levelLessons.length) * 100),
      labs: Math.round((labsDone / levelLessons.length) * 100),
      score: avgScore
    };
  });

  const bestScores = lessons
    .map((lesson) => ({ name: lesson.id, score: progressMap.get(lesson.id)?.score ?? 0 }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const completedLessons = lessons.filter((lesson) => progressMap.get(lesson.id)?.completed === 1).length;
  const completedLabs = lessons.filter((lesson) => labMap.get(lesson.id)?.completed === 1).length;
  const xp = lessons.reduce((total, lesson) => total + (progressMap.get(lesson.id)?.completed ? lesson.xp : 0), 0);
  const rank = xp > 9000 ? "Guru" : xp > 5200 ? "Elite" : xp > 2600 ? "Hacker" : xp > 800 ? "Script Kiddie" : "Novice";

  function downloadExport() {
    const payload = JSON.stringify(exportData ?? {}, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `jimmys-lab-progress-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Lecons", `${completedLessons}/${lessons.length}`],
          ["Labs", `${completedLabs}/${lessons.length}`],
          ["XP", String(xp)],
          ["Rang", rank]
        ].map(([label, value]) => (
          <article key={label} className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-accent-soft)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="panel p-5">
          <h3 className="font-semibold">Progression par niveau</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byLevel}>
                <CartesianGrid stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="level" stroke="#cbd5e1" />
                <YAxis domain={[0, 100]} stroke="#cbd5e1" />
                <Tooltip contentStyle={{ background: "#050817", border: "1px solid rgba(127,29,29,.55)" }} />
                <Bar dataKey="quiz" fill="#7f1d1d" radius={[4, 4, 0, 0]} />
                <Bar dataKey="labs" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="panel p-5">
          <h3 className="font-semibold">Score moyen par niveau</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={byLevel}>
                <CartesianGrid stroke="rgba(148,163,184,0.18)" />
                <XAxis dataKey="level" stroke="#cbd5e1" />
                <YAxis domain={[0, 100]} stroke="#cbd5e1" />
                <Tooltip contentStyle={{ background: "#050817", border: "1px solid rgba(127,29,29,.55)" }} />
                <Line type="monotone" dataKey="score" stroke="#f87171" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <article className="panel p-5">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[var(--color-accent-soft)]" />
            <h3 className="font-semibold">Meilleurs scores</h3>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {(bestScores.length ? bestScores : [{ name: "Aucun quiz", score: 0 }]).map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded border border-[var(--color-line)] bg-black/20 px-3 py-2 text-sm">
                <span>{item.name}</span>
                <span className="font-mono text-[var(--color-accent-soft)]">{item.score}%</span>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-5">
          <h3 className="font-semibold">Export local</h3>
          <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
            Exporte progression, labs, notes, tentatives de quiz et commandes de lab en JSON local.
          </p>
          <button
            onClick={downloadExport}
            disabled={!exportData}
            className="mt-4 inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 font-semibold text-white disabled:bg-slate-500 disabled:text-white"
          >
            <Download size={16} />
            Exporter JSON
          </button>
          <code className="mt-4 block rounded bg-black/40 p-3 text-xs text-slate-100">
            /api/progress/export
          </code>
        </article>
      </section>
    </div>
  );
}
