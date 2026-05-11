import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Lightbulb,
  LockKeyhole,
  PlayCircle,
  ShieldCheck,
  Target,
  TerminalSquare
} from "lucide-react";
import { missions } from "../data/missions";

type Evidence = Record<string, string>;

const evidenceFields = [
  ["observation", "Observation"],
  ["command", "Commande ou source"],
  ["interpretation", "Interpretation"],
  ["risk", "Risque"],
  ["remediation", "Remediation"]
] as const;

function storageKey(missionId: string, stepIndex: number) {
  return `jimmys-lab:mission:${missionId}:step:${stepIndex}`;
}

function readEvidence(missionId: string, stepIndex: number): Evidence {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(storageKey(missionId, stepIndex)) ?? "{}") as Evidence;
  } catch {
    return {};
  }
}

function writeEvidence(missionId: string, stepIndex: number, evidence: Evidence) {
  window.localStorage.setItem(storageKey(missionId, stepIndex), JSON.stringify(evidence));
}

export default function MissionCenter() {
  const [missionId, setMissionId] = useState(missions[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(1);
  const [evidence, setEvidence] = useState<Evidence>(() => readEvidence(missions[0].id, 0));
  const mission = missions.find((item) => item.id === missionId) ?? missions[0];
  const step = mission.steps[stepIndex] ?? mission.steps[0];

  const completion = useMemo(() => {
    const values = evidenceFields.map(([key]) => evidence[key]?.trim() ?? "");
    return Math.round((values.filter(Boolean).length / values.length) * 100);
  }, [evidence]);

  const report = useMemo(() => {
    const lines = [
      `Mission: ${mission.title}`,
      `Scenario: ${mission.scenario}`,
      "",
      "Scope autorise:",
      ...mission.scope.map((item) => `- ${item}`),
      "",
      `Etape: ${step.title}`,
      `Objectif: ${step.objective}`,
      "",
      "Preuve fournie:",
      ...evidenceFields.map(([key, label]) => `- ${label}: ${evidence[key] ?? ""}`),
      "",
      `Validation attendue: ${step.validation}`,
      "",
      "Synthese mentor:",
      mission.finalReport.executiveSummary,
      "",
      "Remediations recommandees:",
      ...mission.finalReport.remediation.map((item) => `- ${item}`)
    ];
    return lines.join("\n");
  }, [evidence, mission, step]);

  function selectMission(nextMissionId: string) {
    const nextMission = missions.find((item) => item.id === nextMissionId) ?? missions[0];
    setMissionId(nextMission.id);
    setStepIndex(0);
    setHintLevel(1);
    setEvidence(readEvidence(nextMission.id, 0));
  }

  function selectStep(nextIndex: number) {
    setStepIndex(nextIndex);
    setHintLevel(1);
    setEvidence(readEvidence(mission.id, nextIndex));
  }

  function updateEvidence(key: string, value: string) {
    const nextEvidence = { ...evidence, [key]: value };
    setEvidence(nextEvidence);
    writeEvidence(mission.id, stepIndex, nextEvidence);
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
            {missions.map((item) => (
              <button
                key={item.id}
                onClick={() => selectMission(item.id)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  mission.id === item.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                    : "border-[var(--color-line)] bg-black/20 hover:border-[var(--color-accent-soft)]"
                }`}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">{item.level} | {item.duration}</p>
              </button>
            ))}
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
              <div className="rounded-md border border-[var(--color-line)] bg-black/25 px-4 py-3 text-sm">
                <p className="text-[var(--color-muted)]">Preuve completee</p>
                <p className="mt-1 text-2xl font-semibold text-[var(--color-accent-soft)]">{completion}%</p>
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
              {mission.steps.map((item, index) => (
                <button
                  key={item.title}
                  onClick={() => selectStep(index)}
                  className={`w-full rounded-md border p-3 text-left text-sm ${
                    stepIndex === index
                      ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                      : "border-[var(--color-line)] bg-black/20 hover:bg-white/5"
                  }`}
                >
                  <span className="text-xs text-[var(--color-muted)]">Etape {index + 1}</span>
                  <p className="mt-1 font-semibold">{item.title}</p>
                </button>
              ))}
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
                <button
                  onClick={() => setHintLevel((current) => Math.min(3, current + 1))}
                  className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white/5 px-3 py-2 text-sm font-semibold hover:border-[var(--color-accent-soft)]"
                >
                  <Lightbulb size={16} />
                  Indice {hintLevel}/3
                </button>
              </div>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className="rounded-md border border-[var(--color-line)] bg-black/25 p-4">
                  <h5 className="font-semibold">Mentor</h5>
                  <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--color-muted)]">
                    {step.mentorHints.slice(0, hintLevel).map((hint) => <p key={hint}>{hint}</p>)}
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
                    <h5 className="font-semibold">Validation</h5>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-100/80">{step.validation}</p>
                </div>
              </div>
            </section>

            <section className="panel p-5">
              <h4 className="text-lg font-semibold">Preuve structuree</h4>
              <p className="mt-2 text-sm text-[var(--color-muted)]">{step.expectedEvidence}</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {evidenceFields.map(([key, label]) => (
                  <label key={key} className={key === "remediation" ? "md:col-span-2" : ""}>
                    <span className="text-sm font-medium">{label}</span>
                    <textarea
                      value={evidence[key] ?? ""}
                      onChange={(event) => updateEvidence(key, event.target.value)}
                      rows={key === "remediation" ? 4 : 3}
                      className="mt-1 w-full resize-none rounded-md border border-[var(--color-line)] bg-black/30 px-3 py-2 text-sm leading-6 text-slate-50 outline-none focus:border-[var(--color-accent-soft)]"
                    />
                  </label>
                ))}
              </div>
            </section>

            <section className="panel p-5">
              <div className="flex items-center gap-2">
                <FileText className="text-[var(--color-accent-soft)]" size={20} />
                <h4 className="text-lg font-semibold">Rapport genere</h4>
              </div>
              <pre className="mt-4 max-h-[420px] overflow-auto rounded-md border border-[var(--color-line)] bg-black/45 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
                {report}
              </pre>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
