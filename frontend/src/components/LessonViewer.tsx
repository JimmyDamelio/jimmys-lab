import { useMemo, useState } from "react";
import { Bookmark, CheckCircle2, ChevronRight, Eye, Highlighter, TerminalSquare, Target, Zap } from "lucide-react";
import type { Lesson } from "../types";

interface Props {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => Promise<void>;
}

function highlightText(text: string) {
  const keywords = [
    "switch",
    "routeur",
    "TCP",
    "UDP",
    "IP",
    "DNS",
    "DHCP",
    "VLAN",
    "NAT",
    "firewall",
    "preuve",
    "lab",
    "scope",
    "route",
    "adresse",
    "couche"
  ];
  const pattern = new RegExp(`\\b(${keywords.join("|")})\\b`, "gi");
  return text.split(pattern).map((part, index) =>
    keywords.some((keyword) => keyword.toLowerCase() === part.toLowerCase()) ? (
      <mark key={`${part}-${index}`} className="rounded bg-[var(--color-accent)]/25 px-1 text-[var(--color-accent-soft)]">
        {part}
      </mark>
    ) : (
      part
    )
  );
}

export default function LessonViewer({ lesson, completed, onComplete }: Props) {
  const [activeCard, setActiveCard] = useState(0);
  const [saving, setSaving] = useState(false);

  const cards = useMemo(
    () =>
      lesson.theory.map((paragraph, index) => {
        const [lead, ...rest] = paragraph.split(":");
        const titles = [
          "Explication simple",
          "Analogie",
          "Exemple reel",
          "Commandes a tester",
          "Erreur frequente",
          "Diagnostic guide",
          "Exercice",
          "Correction",
          "Mini challenge",
          "Validation",
          "Concept",
          "Points cles",
          "Pieges",
          "Procedure",
          "Preuve",
          "Cadre"
        ];
        return {
          title: titles[index] ?? "A retenir",
          lead: rest.length ? lead : paragraph.slice(0, 56),
          body: rest.length ? rest.join(":").trim() : paragraph
        };
      }),
    [lesson.theory]
  );

  async function completeLesson() {
    setSaving(true);
    await onComplete();
    setSaving(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <article className="space-y-5">
        <section className="panel overflow-hidden">
          <div className="border-b border-[var(--color-line)] bg-black/20 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <Target size={20} className="text-[var(--color-accent-soft)]" />
                  <h3 className="text-lg font-semibold">Objectifs</h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded bg-white/10 px-2 py-1">Niveau {lesson.level}</span>
                  <span className="rounded bg-white/10 px-2 py-1">{lesson.duration}</span>
                  <span className="rounded bg-white/10 px-2 py-1">{lesson.xp} XP</span>
                  <span className="rounded bg-white/10 px-2 py-1">{lesson.labType}</span>
                </div>
              </div>
              <button
                onClick={completeLesson}
                disabled={saving || completed}
                className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${
                  completed ? "bg-red-300 text-black" : "bg-[var(--color-accent)] text-white"
                } disabled:opacity-80`}
              >
                <CheckCircle2 size={16} />
                {completed ? "Lecon validee" : "Marquer comprise"}
              </button>
            </div>
          </div>
          <ul className="grid gap-3 p-5 md:grid-cols-3">
            {lesson.objectives.map((objective) => (
              <li key={objective} className="rounded-md border border-[var(--color-line)] bg-white/5 px-3 py-3 text-sm leading-6">
                <Zap size={16} className="mb-2 text-[var(--color-accent-soft)]" />
                {highlightText(objective)}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Highlighter size={19} className="text-[var(--color-accent-soft)]" />
            <h3 className="text-lg font-semibold">Cours interactif</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr]">
            <div className="space-y-2">
              {cards.map((card, index) => (
                <button
                  key={`${card.title}-${index}`}
                  onClick={() => setActiveCard(index)}
                  className={`flex w-full items-center justify-between rounded-md border px-3 py-3 text-left text-sm ${
                    activeCard === index ? "border-[var(--color-accent)] bg-[var(--color-accent)]/15 text-[var(--color-accent-soft)]" : "border-[var(--color-line)] bg-black/20 text-slate-50"
                  }`}
                >
                  <span>{card.title}</span>
                  <ChevronRight size={15} />
                </button>
              ))}
            </div>
            <div className="rounded-md border border-[var(--color-line)] bg-black/25 p-5">
              <p className="text-xs uppercase tracking-wider text-[var(--color-accent-soft)]">{cards[activeCard]?.title}</p>
              <h4 className="mt-2 text-xl font-semibold">{highlightText(cards[activeCard]?.lead ?? "")}</h4>
              <p className="mt-4 text-[15px] leading-8 text-slate-100/85">{highlightText(cards[activeCard]?.body ?? "")}</p>
            </div>
          </div>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Eye size={19} className="text-[var(--color-blue-soft)]" />
            <h3 className="text-lg font-semibold">Schema mental</h3>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-5">
            {["Concept", "Observation", "Commande", "Preuve", "Conclusion"].map((step, index) => (
              <div key={step} className="relative rounded-md border border-[var(--color-line)] bg-black/25 p-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">0{index + 1}</p>
                <p className="mt-2 text-sm font-semibold">{step}</p>
                {index < 4 && (
                  <span className="absolute -right-3 top-1/2 hidden h-px w-6 bg-[var(--color-accent-soft)]/60 md:block" />
                )}
              </div>
            ))}
          </div>
        </section>
      </article>

      <aside className="space-y-5">
        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <TerminalSquare size={19} className="text-[var(--color-blue-soft)]" />
            <h3 className="font-semibold">Commandes a maitriser</h3>
          </div>
          <div className="mt-4 space-y-2">
            {lesson.commands.map((command) => (
              <code key={command} className="block rounded-md bg-black/50 px-3 py-2 font-mono text-sm text-[#00ff41]">
                {command}
              </code>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <h3 className="font-semibold">Mission pratique</h3>
          <p className="mt-3 text-sm leading-6 text-slate-100/75">{highlightText(lesson.labPrompt)}</p>
        </section>

        <section className="panel p-5">
          <div className="flex items-center gap-2">
            <Bookmark size={18} className="text-red-300" />
            <h3 className="font-semibold">Ressources</h3>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-100/75">
            {lesson.resources.map((resource) => (
              <li key={resource} className="rounded border border-[var(--color-line)] bg-black/20 px-3 py-2">
                {resource}
              </li>
            ))}
          </ul>
        </section>
      </aside>
    </div>
  );
}
