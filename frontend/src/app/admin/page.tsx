export default function AdminPage() {
  return (
    <div>
      <h1 className="mb-6 text-3xl font-extrabold tracking-tight text-[var(--foreground)]">
        Dashboard
      </h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Published Posts", value: "--" },
          { label: "Draft Posts", value: "--" },
          { label: "Switch Entries", value: "--" },
          { label: "Contact Messages", value: "--" },
          { label: "Total Page Views", value: "--" },
          { label: "API Health", value: "Pending" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-5"
          >
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-[var(--muted)]">
              {stat.label}
            </p>
            <p className="text-2xl font-bold text-[var(--foreground)]">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6">
        <h2 className="mb-3 text-lg font-semibold text-[var(--foreground)]">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button
            disabled
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            New Blog Post
          </button>
          <button
            disabled
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] opacity-50"
          >
            Add Switch Data
          </button>
          <button
            disabled
            className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--foreground)] opacity-50"
          >
            View Logs
          </button>
        </div>
        <p className="mt-3 text-xs text-[var(--muted)]">
          Admin actions will be enabled once authentication and the GraphQL
          mutations are wired up.
        </p>
      </div>
    </div>
  );
}
