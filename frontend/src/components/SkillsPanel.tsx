import { Award, Brain, CheckCircle2, ClipboardCheck, Compass, FileText, Flame, Network, Shield, Target } from "lucide-react";
import { missions } from "../data/missions";
import type { LabProgressRow, Lesson, MissionEvidenceRow, ProgressRow } from "../types";
import type { LucideIcon } from "lucide-react";

interface Props {
  lessons: Lesson[];
  progress: ProgressRow[];
  labProgress: LabProgressRow[];
  missionEvidence: MissionEvidenceRow[];
}

interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  lessonMatch: (lesson: Lesson) => boolean;
  missionSkills: string[];
}

interface SkillScore {
  definition: SkillDefinition;
  percent: number;
  level: string;
  lessonPoints: number;
  labPoints: number;
  missionPoints: number;
  matchedLessons: Lesson[];
  completedLessons: number;
  completedLabs: number;
  completedMissionSteps: number;
  totalMissionSteps: number;
  nextAction: string;
}

const skillDefinitions: SkillDefinition[] = [
  {
    id: "l2-l3",
    name: "Reseau L2/L3",
    description: "Topologies, switching, routage, VLAN et diagnostic de base.",
    icon: Network,
    lessonMatch: (lesson) => ["1.1", "2.3", "2.4"].includes(lesson.moduleNumber),
    missionSkills: ["VLAN", "Routage"]
  },
  {
    id: "addressing",
    name: "Adressage IP",
    description: "IPv4, CIDR, VLSM, IPv6 et raisonnement subnet.",
    icon: Target,
    lessonMatch: (lesson) => ["1.3", "2.1", "3.1"].includes(lesson.moduleNumber),
    missionSkills: []
  },
  {
    id: "services",
    name: "Services reseau",
    description: "DNS, DHCP, HTTP, TLS, ports, transport et protocoles applicatifs.",
    icon: Compass,
    lessonMatch: (lesson) => ["1.2", "2.2", "3.3"].includes(lesson.moduleNumber),
    missionSkills: ["DNS"]
  },
  {
    id: "defense",
    name: "Defense et durcissement",
    description: "Firewall, segmentation, detection, logs et mesures defensives.",
    icon: Shield,
    lessonMatch: (lesson) => ["3.2", "3.4"].includes(lesson.moduleNumber),
    missionSkills: ["Firewall", "Detection", "Moindre privilege", "Remediation"]
  },
  {
    id: "recon",
    name: "Reconnaissance",
    description: "Scope, enumeration, lecture de resultats et priorisation.",
    icon: ClipboardCheck,
    lessonMatch: (lesson) => ["4.1", "4.4"].includes(lesson.moduleNumber),
    missionSkills: ["Scope", "Reconnaissance", "Enumeration", "Lecture Nmap"]
  },
  {
    id: "ethics",
    name: "Ethique et cadre",
    description: "Autorisation, limites, preuves minimales et comportement professionnel.",
    icon: Award,
    lessonMatch: (lesson) => lesson.level === 4,
    missionSkills: ["Scope", "Communication"]
  },
  {
    id: "reporting",
    name: "Reporting",
    description: "Findings, resume executif, impact, preuves et remediation.",
    icon: FileText,
    lessonMatch: (lesson) => lesson.theory.some((line) => line.toLowerCase().includes("preuve")),
    missionSkills: ["Rapport", "Reporting", "Risque", "Impact", "Remediation"]
  },
  {
    id: "pentest",
    name: "Pentest encadre",
    description: "Methodologie complete, exploitation simulee et synthese professionnelle.",
    icon: Flame,
    lessonMatch: (lesson) => lesson.level === 4,
    missionSkills: ["Pentest encadre", "Reconnaissance", "Reporting"]
  }
];

function getLevel(percent: number) {
  if (percent >= 90) return "Expert";
  if (percent >= 70) return "Solide";
  if (percent >= 45) return "En progression";
  if (percent >= 20) return "Base";
  return "A demarrer";
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function missionStepComplete(row: MissionEvidenceRow) {
  return Boolean(row.completed) || [row.observation, row.command, row.interpretation, row.risk, row.remediation].every((value) => value.trim().length >= 8);
}

export default function SkillsPanel({ lessons, progress, labProgress, missionEvidence }: Props) {
  const progressMap = new Map(progress.map((row) => [row.lesson_id, row]));
  const labMap = new Map(labProgress.map((row) => [row.lesson_id, row]));
  const evidenceMap = new Map(missionEvidence.map((row) => [`${row.mission_id}:${row.step_index}`, row]));

  const scores: SkillScore[] = skillDefinitions.map((definition) => {
    const matchedLessons = lessons.filter(definition.lessonMatch);
    const lessonScores = matchedLessons.map((lesson) => {
      const row = progressMap.get(lesson.id);
      const score = row?.score ?? 0;
      return row?.completed === 1 ? Math.max(score, 80) : score;
    });
    const lessonPoints = matchedLessons.length
      ? lessonScores.reduce((total, score) => total + score, 0) / matchedLessons.length
      : 0;
    const completedLessons = matchedLessons.filter((lesson) => progressMap.get(lesson.id)?.completed === 1).length;
    const completedLabs = matchedLessons.filter((lesson) => labMap.get(lesson.id)?.completed === 1).length;
    const labPoints = matchedLessons.length ? (completedLabs / matchedLessons.length) * 100 : 0;

    const relatedMissions = missions.filter((mission) =>
      mission.skills.some((skill) => definition.missionSkills.includes(skill)) ||
      definition.missionSkills.includes(mission.level)
    );
    const totalMissionSteps = relatedMissions.reduce((total, mission) => total + mission.steps.length, 0);
    const completedMissionSteps = relatedMissions.reduce((total, mission) => {
      return total + mission.steps.filter((_step, index) => {
        const row = evidenceMap.get(`${mission.id}:${index}`);
        return row ? missionStepComplete(row) : false;
      }).length;
    }, 0);
    const missionPoints = totalMissionSteps ? (completedMissionSteps / totalMissionSteps) * 100 : 0;
    const percent = clamp(lessonPoints * 0.45 + labPoints * 0.25 + missionPoints * 0.3);

    const nextAction =
      completedLessons < matchedLessons.length
        ? `Valider ${matchedLessons.find((lesson) => progressMap.get(lesson.id)?.completed !== 1)?.id ?? "une lecon"}`
        : completedLabs < matchedLessons.length
          ? `Terminer le lab ${matchedLessons.find((lesson) => labMap.get(lesson.id)?.completed !== 1)?.id ?? ""}`.trim()
          : completedMissionSteps < totalMissionSteps
            ? `Completer une mission: ${relatedMissions.find((mission) => mission.steps.some((_step, index) => !missionStepComplete(evidenceMap.get(`${mission.id}:${index}`) ?? {
                mission_id: mission.id,
                step_index: index,
                observation: "",
                command: "",
                interpretation: "",
                risk: "",
                remediation: "",
                completed: 0,
                updated_at: ""
              })) )?.title ?? "preuve structuree"}`
            : "Maintenir le niveau avec un rapport complet";

    return {
      definition,
      percent,
      level: getLevel(percent),
      lessonPoints: clamp(lessonPoints),
      labPoints: clamp(labPoints),
      missionPoints: clamp(missionPoints),
      matchedLessons,
      completedLessons,
      completedLabs,
      completedMissionSteps,
      totalMissionSteps,
      nextAction
    };
  });

  const average = clamp(scores.reduce((total, score) => total + score.percent, 0) / scores.length);
  const strongest = [...scores].sort((a, b) => b.percent - a.percent)[0];
  const weakest = [...scores].sort((a, b) => a.percent - b.percent)[0];
  const completedSkills = scores.filter((score) => score.percent >= 70).length;

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-4">
        {[
          ["Maitrise globale", `${average}%`],
          ["Domaines solides", `${completedSkills}/${scores.length}`],
          ["Point fort", strongest?.definition.name ?? "-"],
          ["Priorite", weakest?.definition.name ?? "-"]
        ].map(([label, value]) => (
          <article key={label} className="panel p-4">
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--color-accent-soft)]">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-4 lg:grid-cols-2">
          {scores.map((score) => {
            const Icon = score.definition.icon;
            return (
              <article key={score.definition.id} className="panel p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-[var(--color-accent)]/15 text-[var(--color-accent-soft)]">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold">{score.definition.name}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">{score.definition.description}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-md border border-[var(--color-line)] bg-black/30 px-3 py-2 text-sm font-semibold text-[var(--color-accent-soft)]">
                    {score.percent}%
                  </span>
                </div>

                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--color-accent)]" style={{ width: `${score.percent}%` }} />
                </div>

                <div className="mt-4 grid gap-2 text-xs md:grid-cols-3">
                  <span className="rounded border border-[var(--color-line)] bg-black/20 px-2 py-2">Cours {score.lessonPoints}%</span>
                  <span className="rounded border border-[var(--color-line)] bg-black/20 px-2 py-2">Labs {score.labPoints}%</span>
                  <span className="rounded border border-[var(--color-line)] bg-black/20 px-2 py-2">Missions {score.missionPoints}%</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 rounded border border-[var(--color-accent-soft)]/40 bg-[var(--color-accent)]/15 px-2 py-1 text-[var(--color-accent-soft)]">
                    <CheckCircle2 size={13} />
                    {score.level}
                  </span>
                  <span className="rounded border border-[var(--color-line)] bg-black/20 px-2 py-1 text-[var(--color-muted)]">
                    {score.completedLessons}/{score.matchedLessons.length} lecons
                  </span>
                  <span className="rounded border border-[var(--color-line)] bg-black/20 px-2 py-1 text-[var(--color-muted)]">
                    {score.completedMissionSteps}/{score.totalMissionSteps} etapes mission
                  </span>
                </div>

                <p className="mt-4 rounded-md border border-[var(--color-line)] bg-black/25 p-3 text-sm text-slate-100/80">
                  Prochaine action: {score.nextAction}
                </p>
              </article>
            );
          })}
        </div>

        <aside className="space-y-5">
          <section className="panel p-5">
            <div className="flex items-center gap-2">
              <Brain className="text-[var(--color-accent-soft)]" size={20} />
              <h3 className="font-semibold">Lecture du score</h3>
            </div>
            <div className="mt-4 space-y-3 text-sm leading-6 text-[var(--color-muted)]">
              <p>Le score combine 45% cours et quiz, 25% labs valides et 30% preuves de missions.</p>
              <p>Un domaine solide commence a 70%. Sous 45%, il faut revenir aux bases puis produire une preuve de mission.</p>
            </div>
          </section>

          <section className="panel p-5">
            <h3 className="font-semibold">Plan d'entrainement</h3>
            <div className="mt-4 space-y-3">
              {[...scores].sort((a, b) => a.percent - b.percent).slice(0, 4).map((score, index) => (
                <div key={score.definition.id} className="rounded-md border border-[var(--color-line)] bg-black/25 p-3">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">Priorite {index + 1}</p>
                  <p className="mt-1 font-semibold">{score.definition.name}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{score.nextAction}</p>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </div>
  );
}
