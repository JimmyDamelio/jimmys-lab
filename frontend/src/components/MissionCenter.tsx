import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  Lightbulb,
  LockKeyhole,
  PlayCircle,
  Save,
  ShieldCheck,
  Target,
  TerminalSquare
} from "lucide-react";
import { missions } from "../data/missions";
import type { MissionEvidenceRow } from "../types";
import { fetchMissionEvidence, saveMissionEvidence } from "../utils/api";

type EvidenceKey = "observation" | "command" | "interpretation" | "risk" | "remediation";
type EvidenceDraft = Record<EvidenceKey, string>;
type EvidenceByMission = Record<string, Record<number, EvidenceDraft>>;

const evidenceFields: Array<[EvidenceKey, string]> = [
  ["observation", "Observation"],
  ["command", "Commande ou source"],
  ["interpretation", "Interpretation"],
  ["risk", "Risque"],
  ["remediation", "Remediation"]
];

const emptyEvidence: EvidenceDraft = {
  observation: "",
  command: "",
  interpretation: "",
  risk: "",
  remediation: ""
};

function storageKey(missionId: string, stepIndex: number) {
  return `jimmys-lab:mission:${missionId}:step:${stepIndex}`;
}

function readLocalEvidence(missionId: string, stepIndex: number): EvidenceDraft {
  if (typeof window === "undefined") return { ...emptyEvidence };
  try {
    return { ...emptyEvidence, ...JSON.parse(window.localStorage.getItem(storageKey(missionId, stepIndex)) ?? "{}") };
  } catch {
    return { ...emptyEvidence };
  }
}

function writeLocalEvidence(missionId: string, stepIndex: number, evidence: EvidenceDraft) {
  window.localStorage.setItem(storageKey(missionId, stepIndex), JSON.stringify(evidence));
}

function evidenceFromRow(row: MissionEvidenceRow): EvidenceDraft {
  return {
    observation: row.observation,
    command: row.command,
    interpretation: row.interpretation,
    risk: row.risk,
    remediation: row.remediation
  };
}

function isEvidenceComplete(evidence: EvidenceDraft) {
  return evidenceFields.every(([key]) => evidence[key].trim().length >= 8);
}

function evidencePercent(evidence: EvidenceDraft) {
  const completed = evidenceFields.filter(([key]) => evidence[key].trim()).length;
  return Math.round((completed / evidenceFields.length) * 100);
}

function fileSafeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function buildInitialEvidence(): EvidenceByMission {
  return missions.reduce<EvidenceByMission>((acc, mission) => {
    acc[mission.id] = mission.steps.reduce<Record<number, EvidenceDraft>>((steps, _step, index) => {
      steps[index] = readLocalEvidence(mission.id, index);
      return steps;
    }, {});
    return acc;
  }, {});
}

export default function MissionCenter() {
  const [missionId, setMissionId] = useState(missions[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(1);
  const [evidenceByMission, setEvidenceByMission] = useState<EvidenceByMission>(() => buildInitialEvidence());
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "offline">("idle");

  const mission = missions.find((item) => item.id === missionId) ?? missions[0];
  const step = mission.steps[stepIndex] ?? mission.steps[0];
  const evidence = evidenceByMission[mission.id]?.[stepIndex] ?? { ...emptyEvidence };

  useEffect(() => {
    fetchMissionEvidence()
      .then((rows) => {
        if (rows.length === 0) return;
        setEvidenceByMission((current) => {
          const next = { ...current };
          rows.forEach((row) => {
            next[row.mission_id] ??= {};
            next[row.mission_id][row.step_index] = evidenceFromRow(row);
            writeLocalEvidence(row.mission_id, row.step_index, evidenceFromRow(row));
          });
          return next;
        });
      })
      .catch(() => setSaveState("offline"));
  }, []);

  const missionProgress = useMemo(() => {
    return missions.reduce<Record<string, { completeSteps: number; percent: number }>>((acc, item) => {
      const completeSteps = item.steps.filter((_step, index) => isEvidenceComplete(evidenceByMission[item.id]?.[index] ?? { ...emptyEvidence })).length;
      acc[item.id] = {
        completeSteps,
        percent: Math.round((completeSteps / item.steps.length) * 100)
      };
      return acc;
    }, {});
  }, [evidenceByMission]);

  const completion = evidencePercent(evidence);
  const stepComplete = isEvidenceComplete(evidence);
  const activeMissionProgress = missionProgress[mission.id] ?? { completeSteps: 0, percent: 0 };

  const mentorFeedback = useMemo(() => {
    const missing = evidenceFields.filter(([key]) => !evidence[key].trim());
    if (missing.length === 0) return "La preuve est complete. Relis maintenant la coherence entre observation, risque et remediation.";
    const [, label] = missing[0];
    if (label === "Observation") return "Commence par un fait brut observable avant toute interpretation.";
    if (label === "Risque") return "Ajoute l'impact possible: confidentialite, disponibilite, exposition ou contournement.";
    if (label === "Remediation") return "Termine par une action verifiable, pas seulement une intention generale.";
    return `Complete d'abord: ${label}.`;
  }, [evidence]);

  const report = useMemo(() => buildMarkdownReport(), [evidenceByMission, mission]);

  function buildMarkdownReport() {
    const lines = [
      `# Rapport - ${mission.title}`,
      "",
      `**Niveau:** ${mission.level}`,
      `**Duree estimee:** ${mission.duration}`,
      "",
      "## Resume executif",
      "",
      mission.finalReport.executiveSummary,
      "",
      "## Scenario",
      "",
      mission.scenario,
      "",
      "## Scope autorise",
      "",
      ...mission.scope.map((item) => `- ${item}`),
      "",
      "## Regles d'engagement",
      "",
      ...mission.rules.map((item) => `- ${item}`),
      "",
      "## Preuves par etape"
    ];

    mission.steps.forEach((item, index) => {
      const stepEvidence = evidenceByMission[mission.id]?.[index] ?? { ...emptyEvidence };
      lines.push(
        "",
        `### Etape ${index + 1} - ${item.title}`,
        "",
        `**Objectif:** ${item.objective}`,
        "",
        `**Validation attendue:** ${item.validation}`,
        "",
        `**Statut:** ${isEvidenceComplete(stepEvidence) ? "Valide" : "A completer"}`,
        "",
        "| Champ | Contenu |",
        "| --- | --- |",
        ...evidenceFields.map(([key, label]) => `| ${label} | ${(stepEvidence[key] || "_A completer_").replace(/\n/g, "<br>")} |`)
      );
    });

    lines.push(
      "",
      "## Findings techniques de reference",
      "",
      ...mission.finalReport.technicalFindings.map((item) => `- ${item}`),
      "",
      "## Remediations recommandees",
      "",
      ...mission.finalReport.remediation.map((item) => `- ${item}`),
      ""
    );

    return lines.join("\n");
  }

  function selectMission(nextMissionId: string) {
    const nextMission = missions.find((item) => item.id === nextMissionId) ?? missions[0];
    setMissionId(nextMission.id);
    setStepIndex(0);
    setHintLevel(1);
    setSaveState("idle");
  }

  function selectStep(nextIndex: number) {
    setStepIndex(nextIndex);
    setHintLevel(1);
    setSaveState("idle");
  }

  function updateEvidence(key: EvidenceKey, value: string) {
    setEvidenceByMission((current) => {
      const nextEvidence = { ...(current[mission.id]?.[stepIndex] ?? emptyEvidence), [key]: value };
      writeLocalEvidence(mission.id, stepIndex, nextEvidence);
      return {
        ...current,
        [mission.id]: {
          ...(current[mission.id] ?? {}),
          [stepIndex]: nextEvidence
        }
      };
    });
    setSaveState("idle");
  }

  async function saveCurrentStep() {
    setSaveState("saving");
    try {
      const saved = await saveMissionEvidence(mission.id, stepIndex, {
        ...evidence,
        completed: isEvidenceComplete(evidence) ? 1 : 0
      });
      if (!saved) {
        setSaveState("offline");
        return;
      }
      writeLocalEvidence(mission.id, stepIndex, evidenceFromRow(saved));
      setEvidenceByMission((current) => ({
        ...current,
        [mission.id]: {
          ...(current[mission.id] ?? {}),
          [stepIndex]: evidenceFromRow(saved)
        }
      }));
      setSaveState("saved");
    } catch {
      setSaveState("offline");
    }
  }

  function downloadReport() {
    const blob = new Blob([report], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileSafeName(mission.title)}-rapport.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <section className="panel p-4">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="text-[var(--color-accent-soft)]" size={20} />
            <h3 className="font-semibold">Missions encadrees</h3>
          </div>
          <div className="mt-4 space-y-2">
            {missions.map((item) => {
              const progress = missionProgress[item.id] ?? { completeSteps: 0, percent: 0 };
              return (
                <button
                  key={item.id}
                  onClick={() => selectMission(item.id)}
                  className={`w-full rounded-md border p-3 text-left transition ${
                    mission.id === item.id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                      : "border-[var(--color-line)] bg-black/20 hover:border-[var(--color-accent-soft)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{item.title}</p>
                      <p className="mt-1 text-xs text-[var(--color-muted)]">{item.level} | {item.duration}</p>
                    </div>
                    <span className="shrink-0 rounded bg-black/30 px-2 py-1 text-xs text-[var(--color-accent-soft)]">
                      {progress.percent}%
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${progress.percent}%` }} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="panel p-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-[var(--color-blue-soft)]" size={19} />
            <h3 className="font-semibold">Competences</h3>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {mission.skills.map((skill) => (
              <span key={skill} className="rounded border border-[var(--color-line)] bg-white/5 px-2 py-1 text-xs text-slate-100">
                {skill}
              </span>
            ))}
          </div>
        </section>
      </aside>

      <main className="space-y-5">
        <section className="panel overflow-hidden">
          <div className="border-b border-[var(--color-line)] bg-black/20 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-4xl">
                <p className="text-sm font-semibold text-[var(--color-accent-soft)]">{mission.level} | {mission.duration}</p>
                <h3 className="mt-1 text-2xl font-semibold">{mission.title}</h3>
                <p className="mt-3 leading-7 text-slate-100/80">{mission.scenario}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border border-[var(--color-line)] bg-black/25 px-4 py-3 text-sm">
                  <p className="text-[var(--color-muted)]">Etape courante</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-accent-soft)]">{completion}%</p>
                </div>
                <div className="rounded-md border border-[var(--color-line)] bg-black/25 px-4 py-3 text-sm">
                  <p className="text-[var(--color-muted)]">Mission</p>
                  <p className="mt-1 text-2xl font-semibold text-[var(--color-accent-soft)]">
                    {activeMissionProgress.completeSteps}/{mission.steps.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid gap-4 p-5 lg:grid-cols-3">
            <div>
              <div className="flex items-center gap-2">
                <Target size={18} className="text-[var(--color-accent-soft)]" />
                <h4 className="font-semibold">Scope</h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                {mission.scope.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <LockKeyhole size={18} className="text-[var(--color-accent-soft)]" />
                <h4 className="font-semibold">Regles</h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                {mission.rules.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-[var(--color-accent-soft)]" />
                <h4 className="font-semibold">Assets</h4>
              </div>
              <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
                {mission.assets.map((item) => <li key={item}>- {item}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="panel p-3">
            <div className="space-y-2">
              {mission.steps.map((item, index) => {
                const itemEvidence = evidenceByMission[mission.id]?.[index] ?? { ...emptyEvidence };
                const complete = isEvidenceComplete(itemEvidence);
                return (
                  <button
                    key={item.title}
                    onClick={() => selectStep(index)}
                    className={`w-full rounded-md border p-3 text-left text-sm ${
                      stepIndex === index
                        ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                        : "border-[var(--color-line)] bg-black/20 hover:bg-white/5"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
                      Etape {index + 1}
                      {complete && <CheckCircle2 size={15} className="text-[var(--color-accent-soft)]" />}
                    </span>
                    <p className="mt-1 font-semibold">{item.title}</p>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="space-y-5">
            <section className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <PlayCircle className="text-[var(--color-accent-soft)]" size={20} />
                    <h4 className="text-lg font-semibold">{step.title}</h4>
                  </div>
                  <p className="mt-2 leading-7 text-slate-100/80">{step.objective}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setHintLevel((current) => Math.min(3, current + 1))}
                    className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white/5 px-3 py-2 text-sm font-semibold hover:border-[var(--color-accent-soft)]"
                  >
                    <Lightbulb size={16} />
                    Indice {hintLevel}/3
                  </button>
                  <button
                    onClick={saveCurrentStep}
                    disabled={saveState === "saving"}
                    className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    <Save size={16} />
                    {saveState === "saving" ? "Sauvegarde..." : saveState === "saved" ? "Sauvegarde" : "Sauver"}
                  </button>
                </div>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-[var(--color-line)] bg-black/25 p-4">
                  <h5 className="font-semibold">Mentor</h5>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-muted)]">
                    {step.mentorHints.slice(0, hintLevel).map((hint) => <p key={hint}>{hint}</p>)}
                    <p className="rounded border border-[var(--color-line)] bg-black/30 p-3 text-slate-100/80">{mentorFeedback}</p>
                  </div>
                </div>
                <div className="rounded-md border border-[var(--color-line)] bg-black/25 p-4">
                  <div className="flex items-center gap-2">
                    <TerminalSquare size={17} className="text-[var(--color-blue-soft)]" />
                    <h5 className="font-semibold">Commandes suggerees</h5>
                  </div>
                  <div className="mt-3 space-y-2">
                    {step.commands.map((command) => (
                      <code key={command} className="block rounded bg-black/50 px-3 py-2 font-mono text-sm text-[#00ff41]">
                        {command}
                      </code>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-amber-300/30 bg-amber-300/10 p-4">
                  <div className="flex items-center gap-2 text-amber-100">
                    <AlertTriangle size={17} />
                    <h5 className="font-semibold">Erreur classique</h5>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-amber-50/80">{step.commonMistake}</p>
                </div>
                <div className="rounded-md border border-[var(--color-accent-soft)]/30 bg-[var(--color-accent)]/10 p-4">
                  <div className="flex items-center gap-2 text-[var(--color-accent-soft)]">
                    <CheckCircle2 size={17} />
                    <h5 className="font-semibold">{stepComplete ? "Etape valide" : "Validation attendue"}</h5>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-100/80">{step.validation}</p>
                </div>
              </div>
              {saveState === "offline" && (
                <p className="mt-4 rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-50">
                  Sauvegarde backend indisponible. La preuve reste conservee localement dans ce navigateur.
                </p>
              )}
            </section>

            <section className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-lg font-semibold">Preuve structuree</h4>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">{step.expectedEvidence}</p>
                </div>
                <span className="rounded-md border border-[var(--color-line)] bg-black/25 px-3 py-2 text-sm text-[var(--color-muted)]">
                  {completion}% rempli
                </span>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {evidenceFields.map(([key, label]) => (
                  <label key={key} className={key === "remediation" ? "md:col-span-2" : ""}>
                    <span className="text-sm font-medium">{label}</span>
                    <textarea
                      value={evidence[key]}
                      onChange={(event) => updateEvidence(key, event.target.value)}
                      rows={key === "remediation" ? 4 : 3}
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
                  <h4 className="text-lg font-semibold">Rapport Markdown</h4>
                </div>
                <button
                  onClick={downloadReport}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-3 py-2 text-sm font-semibold text-white"
                >
                  <Download size={16} />
                  Exporter
                </button>
              </div>
              <pre className="mt-4 max-h-[520px] overflow-auto rounded-md border border-[var(--color-line)] bg-black/45 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
                {report}
              </pre>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
