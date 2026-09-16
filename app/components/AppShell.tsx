export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="border-b border-border bg-surface">
        <div className="flex w-full flex-col gap-1 px-6 py-5 sm:px-8">
          <p className="text-lg font-semibold tracking-tight text-accent">
            Notely
          </p>
          <p className="text-sm text-muted">Your messy notes. Made clear.</p>
        </div>
      </header>
      {children}
    </div>
  );
}
