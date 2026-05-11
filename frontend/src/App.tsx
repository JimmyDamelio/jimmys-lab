import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Award, BarChart3, BookOpen, Brain, ClipboardCheck, FlaskConical, Network, PanelLeftClose, PanelLeftOpen, ShieldCheck, Wrench } from "lucide-react";
import Dashboard from "./components/Dashboard";
import ProgressTracker from "./components/ProgressTracker";
import { lessons } from "./data/curriculum";
import { fetchLabProgress, fetchMissionEvidence, fetchProgress, saveProgress } from "./utils/api";
import type { LabProgressRow, MissionEvidenceRow, ProgressRow } from "./types";
import type { LucideIcon } from "lucide-react";

const LessonViewer = lazy(() => import("./components/LessonViewer"));
const NetworkSimulator = lazy(() => import("./components/NetworkSimulator"));
const LabEnvironment = lazy(() => import("./components/LabEnvironment"));
const QuizEngine = lazy(() => import("./components/QuizEngine"));
const ToolsPanel = lazy(() => import("./components/ToolsPanel"));
const StatsPanel = lazy(() => import("./components/StatsPanel"));
const MissionCenter = lazy(() => import("./components/MissionCenter"));
const SkillsPanel = lazy(() => import("./components/SkillsPanel"));
const ExamPanel = lazy(() => import("./components/ExamPanel"));

type View = "lesson" | "topology" | "lab" | "quiz" | "missions" | "skills" | "exam" | "tools" | "stats";
type NavItem = [View, LucideIcon, string];

function ViewLoader() {
  return (
    <div className="panel grid min-h-[360px] place-items-center p-8">
      <div className="w-full max-w-md">
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-[var(--color-accent)]" />
        </div>
        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">Chargement du module...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [activeLessonId, setActiveLessonId] = useState(lessons[0].id);
  const [view, setView] = useState<View>("lesson");
  const [sidebarCompact, setSidebarCompact] = useState(true);
  const [progress, setProgress] = useState<ProgressRow[]>([]);
  const [labProgress, setLabProgress] = useState<LabProgressRow[]>([]);
  const [missionEvidence, setMissionEvidence] = useState<MissionEvidenceRow[]>([]);

  const activeLesson = useMemo(
    () => lessons.find((lesson) => lesson.id === activeLessonId) ?? lessons[0],
    [activeLessonId]
  );

  useEffect(() => {
    fetchProgress().then(setProgress);
    fetchLabProgress().then(setLabProgress);
    fetchMissionEvidence().then(setMissionEvidence);
  }, []);

  async function handleQuizComplete(score: number) {
    await saveProgress(activeLesson.id, score >= 80, score);
    setProgress(await fetchProgress());
  }

  async function handleLessonComplete() {
    const currentScore = progress.find((row) => row.lesson_id === activeLesson.id)?.score ?? 0;
    await saveProgress(activeLesson.id, true, currentScore);
    setProgress(await fetchProgress());
  }

  return (
    <div className={`lab-grid min-h-screen bg-[var(--color-page)] text-slate-100 ${sidebarCompact ? "lab-grid-compact" : ""}`}>
      <aside className="sidebar-shell border-r border-[var(--color-line)] bg-[var(--color-sidebar)]">
        <div className="border-b border-[var(--color-line)] px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--color-accent)] text-white shadow-[0_0_24px_rgba(127,29,29,0.38)]">
                <Network size={22} />
              </div>
              {!sidebarCompact && (
                <div className="min-w-0">
                  <h1 className="text-xl font-semibold tracking-normal">Jimmy's Lab</h1>
                  <p className="truncate text-sm text-[var(--color-muted)]">Reseaux, defense et pentest ethique</p>
                </div>
              )}
            </div>
            <button
              onClick={() => setSidebarCompact((current) => !current)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[var(--color-line)] bg-white/5 text-[var(--color-muted)] transition hover:border-[var(--color-accent-soft)] hover:text-white"
              title={sidebarCompact ? "Agrandir la sidebar" : "Reduire la sidebar"}
            >
              {sidebarCompact ? <PanelLeftOpen size={17} /> : <PanelLeftClose size={17} />}
            </button>
          </div>
        </div>
        <Dashboard
          lessons={lessons}
          activeLessonId={activeLesson.id}
          progress={progress}
          labProgress={labProgress}
          compact={sidebarCompact}
          onSelect={(lessonId, targetView = "lesson") => {
            setActiveLessonId(lessonId);
            setView(targetView);
          }}
        />
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 border-b border-[var(--color-line)] bg-[var(--color-header)] px-5 py-3 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-accent-soft)]">Niveau {activeLesson.level} | {activeLesson.moduleNumber} | {activeLesson.module}</p>
              <h2 className="text-2xl font-semibold">{activeLesson.title}</h2>
            </div>
            <nav className="flex flex-wrap gap-2">
              {([
                ["lesson", BookOpen, "Lecon"],
                ["topology", Activity, "Topo"],
                ["lab", FlaskConical, "Lab"],
                ["quiz", ShieldCheck, "Quiz"],
                ["missions", ClipboardCheck, "Missions"],
                ["skills", Brain, "Competences"],
                ["exam", Award, "Examen"],
                ["tools", Wrench, "Outils"],
                ["stats", BarChart3, "Stats"]
              ] satisfies NavItem[]).map(([id, Icon, label]) => (
                <button
                  key={String(id)}
                  onClick={() => setView(id as View)}
                  className={`inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium ${
                    view === id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                      : "border-[var(--color-line)] bg-white/5 text-slate-100 hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </button>
              ))}
            </nav>
          </div>
          <ProgressTracker lessons={lessons} progress={progress} />
        </header>

        <motion.section
          key={`${activeLesson.id}-${view}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.18 }}
          className="p-5"
        >
          <Suspense fallback={<ViewLoader />}>
            {view === "lesson" && (
              <LessonViewer
                lesson={activeLesson}
                completed={progress.find((row) => row.lesson_id === activeLesson.id)?.completed === 1}
                onComplete={handleLessonComplete}
              />
            )}
            {view === "topology" && <NetworkSimulator lesson={activeLesson} />}
            {view === "lab" && (
              <LabEnvironment
                lesson={activeLesson}
                labProgress={labProgress}
                onLabProgressChange={async () => setLabProgress(await fetchLabProgress())}
              />
            )}
            {view === "quiz" && <QuizEngine lesson={activeLesson} onComplete={handleQuizComplete} />}
            {view === "missions" && <MissionCenter onEvidenceChange={async () => setMissionEvidence(await fetchMissionEvidence())} />}
            {view === "skills" && (
              <SkillsPanel
                lessons={lessons}
                progress={progress}
                labProgress={labProgress}
                missionEvidence={missionEvidence}
              />
            )}
            {view === "exam" && <ExamPanel />}
            {view === "tools" && <ToolsPanel />}
            {view === "stats" && <StatsPanel lessons={lessons} progress={progress} labProgress={labProgress} />}
          </Suspense>
        </motion.section>
      </main>
    </div>
  );
}
