import { useEffect, useMemo, useState } from "react";
import { Check, Divide, GitCompareArrows, ListChecks, RotateCcw, ToggleLeft, X } from "lucide-react";
import type { Lesson, QuizAttemptRow, QuizQuestion } from "../types";
import { fetchQuizAttempts, saveQuizAttempt } from "../utils/api";

interface Props {
  lesson: Lesson;
  onComplete: (score: number) => void;
}

const typeMeta = {
  mcq: { label: "QCM", Icon: ListChecks },
  true_false: { label: "Vrai/Faux", Icon: ToggleLeft },
  matching: { label: "Matching", Icon: GitCompareArrows },
  calculation: { label: "Calcul", Icon: Divide }
};

function getType(question: QuizQuestion) {
  return question.type ?? "mcq";
}

export default function QuizEngine({ lesson, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [attempts, setAttempts] = useState<QuizAttemptRow[]>([]);
  const score = useMemo(() => {
    const correct = lesson.quiz.filter((question, index) => answers[index] === question.answer).length;
    return Math.round((correct / lesson.quiz.length) * 100);
  }, [answers, lesson.quiz]);
  const passed = score >= 80;

  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    fetchQuizAttempts(lesson.id).then(setAttempts);
  }, [lesson.id]);

  async function submit() {
    setSubmitted(true);
    await saveQuizAttempt(lesson.id, score, passed, answers);
    await onComplete(score);
    setAttempts(await fetchQuizAttempts(lesson.id));
  }

  function retry() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <section className="panel p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold">Validation</h3>
            <p className="text-sm text-[var(--color-muted)]">80% minimum. Chaque tentative est stockee localement pour suivre ta progression.</p>
          </div>
          <div className={`rounded-md px-4 py-2 font-semibold ${submitted && passed ? "bg-red-300 text-black" : submitted ? "bg-amber-300 text-black" : "bg-white/10 text-slate-50"}`}>
            {submitted ? `Score ${score}% ${passed ? "valide" : "retry conseille"}` : `${Object.keys(answers).length}/${lesson.quiz.length} reponses`}
          </div>
        </div>
        {attempts.length > 0 && (
          <div className="mt-4 grid gap-2 md:grid-cols-5">
            {attempts.slice(0, 5).map((attempt) => (
              <div key={attempt.id} className="rounded border border-[var(--color-line)] bg-black/25 p-2 text-xs">
                <p className={attempt.passed ? "text-[var(--color-accent-soft)]" : "text-amber-200"}>{attempt.score}%</p>
                <p className="text-[var(--color-muted)]">{new Date(attempt.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {lesson.quiz.map((question, index) => {
        const selected = answers[index];
        const meta = typeMeta[getType(question)];
        const Icon = meta.Icon;
        return (
          <section key={question.question} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h4 className="font-semibold">{index + 1}. {question.question}</h4>
              <span className="inline-flex items-center gap-1 rounded border border-[var(--color-line)] bg-black/25 px-2 py-1 text-xs text-[var(--color-muted)]">
                <Icon size={14} />
                {meta.label}
              </span>
            </div>

            {getType(question) === "matching" && (
              <p className="mt-3 text-sm text-[var(--color-muted)]">Choisis l'element qui correspond au risque, concept ou controle demande.</p>
            )}
            {getType(question) === "calculation" && (
              <p className="mt-3 text-sm text-[var(--color-muted)]">Calcule mentalement ou utilise l'outil integre avant de repondre.</p>
            )}

            <div className={`mt-4 grid gap-2 ${question.options.length === 2 ? "md:grid-cols-2" : ""}`}>
              {question.options.map((option, optionIndex) => {
                const isCorrect = submitted && optionIndex === question.answer;
                const isWrong = submitted && selected === optionIndex && selected !== question.answer;
                return (
                  <button
                    key={option}
                    onClick={() => !submitted && setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                    className={`flex min-h-12 items-center justify-between rounded-md border px-3 py-3 text-left ${
                      selected === optionIndex ? "border-[var(--color-blue-soft)] bg-blue-400/10" : "border-[var(--color-line)] bg-white/5 hover:bg-white/10"
                    } ${isCorrect ? "border-[var(--color-accent-soft)] bg-[var(--color-accent)]/15" : ""} ${isWrong ? "border-red-400 bg-red-500/10" : ""}`}
                  >
                    <span>{option}</span>
                    {isCorrect && <Check size={18} className="text-[var(--color-accent-soft)]" />}
                    {isWrong && <X size={18} className="text-red-400" />}
                  </button>
                );
              })}
            </div>
            {submitted && (
              <div className="mt-4 rounded border border-[var(--color-line)] bg-black/25 p-3 text-sm leading-6 text-slate-100/75">
                {answers[index] === question.answer ? "Correct. " : "Incorrect. "}
                {question.explanation}
              </div>
            )}
          </section>
        );
      })}

      <div className="flex flex-wrap gap-3">
        <button
          onClick={submit}
          disabled={Object.keys(answers).length !== lesson.quiz.length || submitted}
          className="rounded-md bg-[var(--color-accent)] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-white"
        >
          Valider
        </button>
        <button
          onClick={retry}
          className="inline-flex items-center gap-2 rounded-md border border-[var(--color-line)] bg-white/5 px-4 py-2 font-medium text-slate-50"
        >
          <RotateCcw size={16} />
          Refaire
        </button>
      </div>
    </div>
  );
}
