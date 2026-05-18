"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";
import type { QuizPayload, WidgetAction } from "@/lib/types/widgets-typed";
import { ActionChips, WidgetHeader, WidgetShell } from "./shared";

/**
 * Quiz — multi-question form with local scoring. Stays in-React (no scripts
 * needed), tracks selected option per question, reveals correct answer +
 * explanation after the user submits.
 */
export function QuizWidget({ payload, actions }: { payload: QuizPayload; actions?: WidgetAction[] }) {
  const questions = payload?.questions ?? [];
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);

  const allAnswered = questions.every((q) => answers[q.id]);
  const score = questions.filter((q) => answers[q.id] === q.correctId).length;

  return (
    <WidgetShell>
      <WidgetHeader title={payload?.title ?? "Quiz"} subtitle={payload?.subtitle ?? `${questions.length} questions`} />

      <ol className="space-y-4 m-0 p-0 list-none">
        {questions.map((q, qi) => {
          const selected = answers[q.id];
          return (
            <li key={q.id} className="space-y-1.5">
              <div className="text-[13px] font-semibold leading-snug text-[var(--foreground)]">
                <span className="font-mono text-[var(--secondary)] mr-1.5">{qi + 1}.</span>
                {q.prompt}
              </div>
              <div className="space-y-1">
                {q.options.map((opt, oi) => {
                  const isPicked = selected === opt.id;
                  const isCorrect = revealed && opt.id === q.correctId;
                  const isWrongPick = revealed && isPicked && opt.id !== q.correctId;
                  return (
                    <label
                      key={opt.id}
                      className={
                        "flex items-center gap-2.5 rounded-md border px-3 py-1.5 text-[12.5px] cursor-pointer transition-colors " +
                        (isCorrect
                          ? "border-green-500 bg-green-500/10"
                          : isWrongPick
                            ? "border-red-500 bg-red-500/10"
                            : isPicked
                              ? "border-accent bg-accent/5"
                              : "border-[var(--border)] hover:border-accent/40")
                      }
                    >
                      <input
                        type="radio"
                        name={q.id}
                        checked={isPicked}
                        onChange={() => setAnswers((p) => ({ ...p, [q.id]: opt.id }))}
                        className="accent-accent"
                        disabled={revealed}
                      />
                      <span className="font-mono text-[var(--secondary)] text-[11px]">
                        {String.fromCharCode(97 + oi)})
                      </span>
                      <span className="text-[var(--foreground)] flex-1">{opt.label}</span>
                      {isCorrect && <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" strokeWidth={2.5} />}
                      {isWrongPick && <X className="h-3.5 w-3.5 text-red-600 dark:text-red-400" strokeWidth={2.5} />}
                    </label>
                  );
                })}
              </div>
              {revealed && q.explanation && (
                <div className="text-[11px] italic text-[var(--secondary)] leading-relaxed pl-5">
                  {q.explanation}
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
        {revealed ? (
          <div className="text-[13px] font-semibold">
            Score:{" "}
            <span
              className={
                score === questions.length
                  ? "text-green-600 dark:text-green-400"
                  : score >= questions.length / 2
                    ? "text-accent"
                    : "text-amber-600 dark:text-amber-400"
              }
            >
              {score} / {questions.length}
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-[var(--secondary)]">
            {Object.keys(answers).length} / {questions.length} answered
          </div>
        )}
        <div className="flex gap-2">
          {revealed && (
            <button
              type="button"
              onClick={() => {
                setAnswers({});
                setRevealed(false);
              }}
              className="rounded-md border border-[var(--border)] px-3 py-1.5 text-[12px] font-semibold text-[var(--foreground)] hover:border-accent cursor-pointer"
            >
              Retry
            </button>
          )}
          {!revealed && (
            <button
              type="button"
              disabled={!allAnswered}
              onClick={() => setRevealed(true)}
              className="rounded-md bg-accent text-white px-3.5 py-1.5 text-[12px] font-semibold cursor-pointer hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Check answers
            </button>
          )}
        </div>
      </div>

      <ActionChips actions={actions} />
    </WidgetShell>
  );
}
