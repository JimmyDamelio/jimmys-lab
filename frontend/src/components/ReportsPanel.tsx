import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, FolderOpen, GraduationCap, ListChecks } from "lucide-react";
import { finalExam } from "../data/finalExam";
import { missions } from "../data/missions";
import type { ExamAttemptRow, Mission, MissionEvidenceRow } from "../types";
import { fetchExamAttempts } from "../utils/api";

interface Props {
  missionEvidence: MissionEvidenceRow[];
}

interface ReportItem {
  id: string;
  title: string;
  type: "Mission" | "Examen";
  status: "Brouillon" | "Termine" | "Valide";
  updatedAt: string;
  score?: number;
  progress: number;
  markdown: string;
}

function fileSafeName(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function missionStepComplete(row?: MissionEvidenceRow) {
  if (!row) return false;
  return Boolean(row.completed) || [row.observation, row.command, row.interpretation, row.risk, row.remediation].every((value) => value.trim().length >= 8);
}

function missionEvidenceFor(missionEvidence: MissionEvidenceRow[], mission: Mission, index: number) {
  return missionEvidence.find((row) => row.mission_id === mission.id && row.step_index === index);
}

function buildMissionMarkdown(mission: Mission, missionEvidence: MissionEvidenceRow[]) {
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

  mission.steps.forEach((step, index) => {
    const evidence = missionEvidenceFor(missionEvidence, mission, index);
    lines.push(
      "",
      `### Etape ${index + 1} - ${step.title}`,
      "",
      `**Objectif:** ${step.objective}`,
      "",
      `**Statut:** ${missionStepComplete(evidence) ? "Valide" : "A completer"}`,
      "",
      "| Champ | Contenu |",
      "| --- | --- |",
      `| Observation | ${evidence?.observation || "_A completer_"} |`,
      `| Commande ou source | ${evidence?.command || "_A completer_"} |`,
      `| Interpretation | ${evidence?.interpretation || "_A completer_"} |`,
      `| Risque | ${evidence?.risk || "_A completer_"} |`,
      `| Remediation | ${evidence?.remediation || "_A completer_"} |`
    );
  });

  lines.push(
    "",
    "## Remediations recommandees",
    "",
    ...mission.finalReport.remediation.map((item) => `- ${item}`),
    ""
  );

  return lines.join("\n");
}

function buildExamMarkdown(attempt: ExamAttemptRow) {
  return [
    `# ${finalExam.title}`,
    "",
    `**Tentative:** ${attempt.id}`,
    `**Score:** ${attempt.score}/100`,
    `**Statut:** ${attempt.passed ? "Valide" : "A retravailler"}`,
    `**Date:** ${new Date(attempt.created_at).toLocaleString()}`,
    "",
    "## Grille",
    "",
    `- Scope respecte: ${attempt.scope_score}/20`,
    `- Reconnaissance propre: ${attempt.recon_score}/20`,
    `- Preuves techniques: ${attempt.evidence_score}/20`,
    `- Analyse du risque: ${attempt.risk_score}/20`,
    `- Remediation et rapport: ${attempt.remediation_score}/20`,
    "",
    "## Rapport",
    "",
    attempt.report || "_Aucun rapport sauvegarde_",
    ""
  ].join("\n");
}

function downloadMarkdown(item: ReportItem) {
  const blob = new Blob([item.markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileSafeName(item.title)}.md`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPanel({ missionEvidence }: Props) {
  const [examAttempts, setExamAttempts] = useState<ExamAttemptRow[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    fetchExamAttempts().then(setExamAttempts);
  }, []);

  const reports = useMemo<ReportItem[]>(() => {
    const missionReports = missions.map<ReportItem>((mission) => {
      const completedSteps = mission.steps.filter((_step, index) => missionStepComplete(missionEvidenceFor(missionEvidence, mission, index))).length;
      const relatedRows = missionEvidence.filter((row) => row.mission_id === mission.id);
      const progress = Math.round((completedSteps / mission.steps.length) * 100);
      return {
        id: `mission:${mission.id}`,
        title: mission.title,
        type: "Mission",
        status: progress === 100 ? "Termine" : relatedRows.length > 0 ? "Brouillon" : "Brouillon",
        updatedAt: relatedRows.sort((a, b) => b.updated_at.localeCompare(a.updated_at))[0]?.updated_at ?? "",
        progress,
        markdown: buildMissionMarkdown(mission, missionEvidence)
      };
    });

    const examReports = examAttempts.map<ReportItem>((attempt) => ({
      id: `exam:${attempt.id}`,
      title: `${finalExam.title} #${attempt.id}`,
      type: "Examen",
      status: attempt.passed ? "Valide" : "Brouillon",
      updatedAt: attempt.created_at,
      score: attempt.score,
      progress: attempt.score,
      markdown: buildExamMarkdown(attempt)
    }));

    return [...examReports, ...missionReports].sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
  }, [examAttempts, missionEvidence]);

  const selected = reports.find((report) => report.id === selectedId) ?? reports[0];
  const missionCount = reports.filter((report) => report.type === "Mission").length;
  const examCount = reports.filter((report) => report.type === "Examen").length;
  const completedCount = reports.filter((report) => report.status === "Termine" || report.status === "Valide").length;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Rapports", String(reports.length)],
          ["Missions", String(missionCount)],
          ["Examens", String(examCount)],
          ["Termines", String(completedCount)]
        ].map(([label, value]) => (
          <article key={label} className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-accent-soft)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="panel p-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="text-[var(--color-accent-soft)]" size={20} />
            <h3 className="font-semibold">Livrables</h3>
          </div>
          <div className="mt-4 space-y-2">
            {reports.map((report) => (
              <button
                key={report.id}
                onClick={() => setSelectedId(report.id)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  selected?.id === report.id
                    ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15"
                    : "border-[var(--color-line)] bg-black/20 hover:border-[var(--color-accent-soft)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{report.title}</p>
                    <p className="mt-1 text-xs text-[var(--color-muted)]">{report.type} | {report.status}</p>
                  </div>
                  {report.type === "Examen" ? <GraduationCap size={17} className="shrink-0 text-[var(--color-accent-soft)]" /> : <ListChecks size={17} className="shrink-0 text-[var(--color-accent-soft)]" />}
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${Math.min(100, report.progress)}%` }} />
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selected && (
          <main className="space-y-5">
            <section className="panel p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="text-[var(--color-accent-soft)]" size={20} />
                    <h3 className="text-xl font-semibold">{selected.title}</h3>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded border border-[var(--color-line)] bg-black/25 px-2 py-1">{selected.type}</span>
                    <span className="inline-flex items-center gap-1 rounded border border-[var(--color-line)] bg-black/25 px-2 py-1">
                      <CheckCircle2 size={13} className="text-[var(--color-accent-soft)]" />
                      {selected.status}
                    </span>
                    {selected.score !== undefined && <span className="rounded border border-[var(--color-line)] bg-black/25 px-2 py-1">Score {selected.score}/100</span>}
                  </div>
                </div>
                <button
                  onClick={() => downloadMarkdown(selected)}
                  className="inline-flex items-center gap-2 rounded-md bg-[var(--color-accent)] px-4 py-2 text-sm font-semibold text-white"
                >
                  <Download size={16} />
                  Exporter Markdown
                </button>
              </div>
            </section>

            <section className="panel p-5">
              <pre className="max-h-[680px] overflow-auto rounded-md border border-[var(--color-line)] bg-black/45 p-4 text-sm leading-6 text-slate-100 whitespace-pre-wrap">
                {selected.markdown}
              </pre>
            </section>
          </main>
        )}
      </section>
    </div>
  );
}
