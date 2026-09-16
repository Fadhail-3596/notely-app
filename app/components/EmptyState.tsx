export default function EmptyState() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-8">
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Turn messy notes into clear notes.
        </h1>
        <p className="mt-3 max-w-md text-base leading-relaxed text-muted">
          Refine your notes into a clearer, more structured version with
          academic sources.
        </p>
        <div
          className="mt-10 w-full min-h-48 rounded-md border border-dashed border-border bg-surface px-6 py-10 sm:min-h-56"
          aria-hidden="true"
        >
          <p className="text-sm text-muted">
            Your notes will appear here.
          </p>
        </div>
      </div>
    </main>
  );
}
