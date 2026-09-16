"use client";

import { useState } from "react";

const MAX_NOTE_LENGTH = 14000;

const STYLE_OPTIONS = [
  "Clear & Structured",
  "Concise",
  "Academic",
  "Study Notes",
] as const;

type RefineResult = {
  refined_note: string;
  key_points: string[];
  citations_used: string[];
  uncertainties: string[];
  understanding: {
    main_topic: string;
    summary: string;
    context: string;
    key_concepts: string[];
  };
};

export default function NoteWorkspace() {
  const [note, setNote] = useState("");
  const [style, setStyle] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<RefineResult | null>(null);

  const hasNote = note.trim().length > 0;
  const characterCount = note.length;

  async function handleRefine(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!hasNote || isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: {
            note: note.trim(),
          },
          optional: {
            style: style.trim(),
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ?? "Failed to refine note.",
        );
      }

      const refineResult: RefineResult = data;

      setResult(refineResult);
      setShowResult(true);
    } catch (error) {
      console.error("Refine request failed:", error);
    } finally {
      setIsProcessing(false);
    }
  }

  function handleStartOver() {
    setNote("");
    setStyle("");
    setResult(null);
    setShowResult(false);
    setIsProcessing(false);
  }

  if (showResult && result) {
    return (
      <main className="flex flex-1 flex-col px-6 py-10 sm:px-8">
        <div className="mx-auto flex w-full max-w-4xl flex-col">
          <div className="mb-8">
            <p className="text-sm font-medium text-accent">
              AI-refined result
            </p>

            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Your refined notes
            </h1>

            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
              Your note has been refined by Notely AI.
            </p>
          </div>

          <section className="border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Refined note
            </h2>

            <div className="mt-4 rounded-md border border-border bg-surface px-5 py-5">
              <p className="text-base leading-8 text-foreground">
                {result.refined_note}
              </p>
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Key points
            </h2>

            <ul className="mt-4 space-y-3">
              {result.key_points.map((point) => (
                <li
                  key={point}
                  className="border-l-2 border-accent pl-4 text-base leading-relaxed text-foreground"
                >
                  {point}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Understanding
            </h2>

            <div className="mt-4 space-y-4 rounded-md border border-border bg-surface px-5 py-5">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Main topic
                </p>
                <p className="mt-1 text-base text-foreground">
                  {result.understanding.main_topic}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Summary
                </p>
                <p className="mt-1 text-base leading-relaxed text-foreground">
                  {result.understanding.summary}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted">
                  Context
                </p>
                <p className="mt-1 text-base leading-relaxed text-foreground">
                  {result.understanding.context}
                </p>
              </div>
            </div>
          </section>

          <section className="mt-10 border-t border-border pt-8">
            <h2 className="text-lg font-semibold text-foreground">
              Sources
            </h2>

            {result.citations_used.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {result.citations_used.map((citation) => (
                  <li
                    key={citation}
                    className="text-sm leading-relaxed text-foreground"
                  >
                    {citation}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Academic sources will appear here when evidence
                retrieval and verification are connected.
              </p>
            )}
          </section>

          {result.uncertainties.length > 0 && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="text-lg font-semibold text-foreground">
                Notes
              </h2>

              <ul className="mt-4 space-y-3">
                {result.uncertainties.map((uncertainty) => (
                  <li
                    key={uncertainty}
                    className="text-sm leading-relaxed text-muted"
                  >
                    {uncertainty}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-10 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
            <button
              type="button"
              onClick={handleStartOver}
              className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-foreground hover:bg-background"
            >
              Refine another note
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`flex flex-1 flex-col px-6 py-10 sm:px-8 ${
        hasNote ? "justify-start" : "justify-center"
      }`}
    >
      <form
        onSubmit={handleRefine}
        className="mx-auto flex w-full max-w-2xl flex-col"
      >
        {!hasNote ? (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Turn messy notes into clear notes.
            </h1>

            <p className="mt-3 text-base leading-relaxed text-muted">
              Paste or type your notes below. You can choose a style,
              then refine them when you are ready.
            </p>
          </div>
        ) : (
          <h1 className="sr-only">Note input</h1>
        )}

        <label htmlFor="note" className="sr-only">
          Raw notes
        </label>

        <textarea
          id="note"
          name="note"
          value={note}
          maxLength={MAX_NOTE_LENGTH}
          onChange={(event) => setNote(event.target.value)}
          disabled={isProcessing}
          placeholder="Paste or type your notes here."
          rows={hasNote ? 16 : 10}
          className="w-full resize-y rounded-md border border-border bg-surface px-4 py-3 text-base leading-relaxed text-foreground placeholder:text-muted/80 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
        />

        <div className="mt-2 flex justify-end">
          <p className="text-xs text-muted">
            {characterCount} / {MAX_NOTE_LENGTH}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex w-full flex-col gap-1.5 sm:max-w-xs">
            <label htmlFor="style" className="text-sm text-muted">
              Style <span className="text-muted/80">(optional)</span>
            </label>

            <select
              id="style"
              name="style"
              value={style}
              onChange={(event) => setStyle(event.target.value)}
              disabled={isProcessing}
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent disabled:cursor-not-allowed disabled:opacity-70"
            >
              <option value="">Choose a style</option>

              {STYLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!hasNote || isProcessing}
            className="w-full rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {isProcessing ? "Refining..." : "Refine notes"}
          </button>
        </div>

        {isProcessing && (
          <p
            className="mt-4 text-center text-sm text-muted"
            aria-live="polite"
          >
            Preparing your notes for refinement...
          </p>
        )}
      </form>
    </main>
  );
}