import { useEffect, useMemo, useState } from "react";
import { Award, ClipboardCheck, Download, FileText, LockKeyhole, Save, ShieldCheck, Timer, Trophy } from "lucide-react";
import { finalExam } from "../data/finalExam";
import type { ExamAttemptRow } from "../types";
import { fetchExamAttempts, saveExamAttempt } from "../utils/api";

type ScoreKey = (typeof finalExam.criteria)[number]["key"];
type Scores = Record<ScoreKey, number>;
type Draft = {
  scope: string;
  recon: string;
  evidence: string;
  risks: string;
  remediation: string;
  executive: string;
};

const emptyDraft: Draft = {
  scope: "",
  recon: "",
  evidence: "",
  risks: "",
  remediation: "",
  executive: ""
};

const emptyScores = finalExam.criteria.reduce<Scores>((acc, item) => {
  acc[item.key] = 0;
  return acc;
}, {} as Scores);

function storageKey() {
  return `jimmys-lab:exam:${finalExam.id}:draft`;
}

function readDraft(): Draft {
  if (typeof window === "undefined") return emptyDraft;
  try {
    return { ...emptyDraft, ...JSON.parse(window.localStorage.getItem(storageKey()) ?? "{}") };
  } catch {
    return emptyDraft;
  }
}

function scoreText(value: string, max: number) {
  const length = value.trim().length;
  if (length >= 280) return max;
  if (length >= 180) return Math.round(max * 0.8);
  if (length >= 100) return Math.round(max * 0.6);
  if (length >= 45) return Math.round(max * 0.35);
  return 0;
}

function clampScore(value: number) {
  return Math.max(0, Math.min(20, Number(value) || 0));
}

function fileSafeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ExamPanel() {
  const [draft, setDraft] = useState<Draft>(() => readDraft());
  const [scores, setScores] = useState<Scores>(emptyScores);
  const [attempts, setAttempts] = useState<ExamAttemptRow[]>([]);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    fetchExamAttempts().then(setAttempts);
  }, []);

  useEffect(() => {
    const nextScores: Scores = {
      scope_score: scoreText(draft.scope, 20),
      recon_score: scoreText(draft.recon, 20),
      evidence_score: scoreText(draft.evidence, 20),
      risk_score: scoreText(draft.risks, 20),
      remediation_score: Math.round((scoreText(draft.remediation, 20) + scoreText(draft.executive, 20)) / 2)
    };
    setScores(nextScores);
    window.localStorage.setItem(storageKey(), JSON.stringify(draft));
  }, [draft]);

  const total = useMemo(() => Object.values(scores).reduce((sum, score) => sum + clampScore(score), 0), [scores]);
  const passed = total >= finalExam.passingScore;
  const report = useMemo(() => {
    return [
      `# ${finalExam.title}`,
      "",
      `**Score:** ${total}/100`,
      `**Statut:** ${passed ? "Valide" : "A retravailler"}`,
      `**Duree recommandee:** ${finalExam.duration}`,
      "",
      "## Resume executif",
      "",
      draft.executive || "_A completer_",
      "",
      "## Scope et limites",
      "",
      draft.scope || "_A completer_",
      "",
      "## Reconnaissance",
      "",
      draft.recon || "_A completer_",
      "",
      "## Preuves techniques",
      "",
      draft.evidence || "_A completer_",
      "",
      "## Analyse des risques",
      "",
      draft.risks || "_A completer_",
      "",
      "## Remediation priorisee",
      "",
      draft.remediation || "_A completer_",
      "",
      "## Grille de score",
      "",
      ...finalExam.criteria.map((item) => `- ${item.label}: ${scores[item.key]}/${item.max}`)
    ].join("\n");
  }, [draft, passed, scores, total]);

  function updateDraft(key: keyof Draft, value: string) {
    setDraft((current) => ({ ...current, [key]: value }));
    setSaveState("idle");
  }

  function updateScore(key: ScoreKey, value: number) {
    setScores((current) => ({ ...current, [key]: clampScore(value) }));
  }

  function downloadReport() {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileSafeName(finalExam.title)}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function submitAttempt() {
    setSaveState("saving");
    const saved = await saveExamAttempt(finalExam.id, {
      ...scores,
      report
    });
    if (!saved) {
      setSaveState("error");
      return;
    }
    setAttempts(await fetchExamAttempts());
    setSaveState("saved");
  }

  return (
    <div className="space-y-5">
      <section className="panel overflow-hidden">
        <div className="border-b border-[var(--color-line)] bg-black/20 p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-4xl">
              <div className="flex items-center gap-2 text-[var(--color-accent-soft)]">
                <Award size={20} />
                <p className="text-sm font-semibold">Examen final | {finalExam.duration} | sans indices mentor</p>
              </div>
              <h3 className="mt-2 text-2xl font-semibold">{finalExam.title}</h3>
              <p className="mt-3 leading-7 text-slate-100/80">{finalExam.scenario}</p>
            </div>
            <div className={`rounded-md border px-5 py-4 text-center ${passed ? "border-[var(--color-accent-soft)] bg-[var(--color-accent)]/15" : "border-[var(--color-line)] bg-black/25"}`}>
              <p className="text-sm text-[var(--color-muted)]">Score</p>
              <p className="mt-1 text-4xl font-semibold text-[var(--color-accent-soft)]">{total}</p>
              <p className="mt-1 text-xs text-[var(--color-muted)]">minimum {finalExam.passingScore}/100</p>
            </div>
          </div>
        </div>
        <div className="grid gap-4 p-5 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--color-accent-soft)]" />
              <h4 className="font-semibold">Scope</h4>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              {finalExam.scope.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <LockKeyhole size={18} className="text-[var(--color-accent-soft)]" />
              <h4 className="font-semibold">Interdits</h4>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              {finalExam.forbidden.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-[var(--color-accent-soft)]" />
              <h4 className="font-semibold">Taches</h4>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
              {finalExam.tasks.map((item) => <li key={item}>- {item}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <main className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="text-[var(--color-accent-soft)]" size={20} />
              <h4 className="text-lg font-semibold">Pack de preuves fourni</h4>
            </div>
            <div className="mt-4 space-y-2">
              {finalExam.evidencePack.map((item) => (
                <code key={item} className="block rounded bg-black/45 px-3 py-2 text-sm text-slate-100">
                  {item}
                </code>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <h4 className="text-lg font-semibold">Rapport final</h4>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                ["executive", "Resume executif", 4],
                ["scope", "Scope et limites", 4],
                ["recon", "Reconnaissance", 4],
                ["evidence", "Preuves techniques", 5],
                ["risks", "Analyse des risques", 5],
                ["remediation", "Remediation priorisee", 5]
              ].map(([key, label, rows]) => (
                <label key={String(key)} className={key === "remediation" || key === "risks" ? "md:col-span-2" : ""}>
                  <span className="text-sm font-medium">{String(label)}</span>
                  <textarea
                    value={draft[key as keyof Draft]}
                    onChange={(event) => updateDraft(key as keyof Draft, event.target.value)}
                    rows={Number(rows)}
                    className="mt-1 w-full resize-none rounded-md border border-[var(--color-line)] bg-black/30 px-3 py-2 text-sm leading-6 text-slate-50 outline-none focus:border-[var(--color-accent-soft)]"
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="panel p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <FileText className="text-[var(--color-accent-soft)]" size={20} />
                <h4 className="text-lg font-semibold">Apercu Markdown</h4>
              </div>
              <button onClick={downloadReport} className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white">
                <Download size={16} />
                Exporter
              </button>
            </div>
            <pre className="mt-4 max-h-[460px] overflow-auto rounded-md border border-[var(--color-line)] bg-black/45 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
              {report}
            </pre>
          </section>
        </main>

        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Trophy className="text-[var(--color-accent-soft)]" size={20} />
              <h4 className="font-semibold">Grille d'evaluation</h4>
            </div>
            <div className="mt-4 space-y-4">
              {finalExam.criteria.map((item) => (
                <label key={item.key} className="block rounded-md border border-[var(--color-line)] bg-black/25 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="font-mono text-[var(--color-accent-soft)]">{scores[item.key]}/20</span>
                  </div>
                  <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">{item.helper}</p>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={scores[item.key]}
                    onChange={(event) => updateScore(item.key, Number(event.target.value))}
                    className="mt-3 w-full"
                  />
                </label>
              ))}
            </div>
            <button
              onClick={submitAttempt}
              disabled={saveState === "saving"}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 font-semibold text-white disabled:opacity-60"
            >
              <Save size={16} />
              {saveState === "saving" ? "Enregistrement..." : saveState === "saved" ? "Tentative enregistree" : "Enregistrer tentative"}
            </button>
            {saveState === "error" && <p className="mt-3 text-sm text-amber-200">Sauvegarde impossible. Verifie que le backend est lance.</p>}
          </section>

          <section className="panel p-5">
            <h4 className="font-semibold">Historique</h4>
            <div className="mt-4 space-y-2">
              {(attempts.length ? attempts.slice(0, 6) : []).map((attempt) => (
                <div key={attempt.id} className="rounded-md border border-[var(--color-line)] bg-black/25 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={attempt.passed ? "text-[var(--color-accent-soft)]" : "text-amber-200"}>
                      {attempt.score}/100
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">{new Date(attempt.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
              {attempts.length === 0 && <p className="text-sm text-[var(--color-muted)]">Aucune tentative enregistree.</p>}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
