import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | The Key Switch",
  description: "Get in touch for collaboration or inquiries.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        Contact
      </h1>
      <p className="mb-10 text-[var(--muted)] leading-relaxed">
        Interested in working together or have a question? Reach out using the
        form below or connect on social platforms.
      </p>

      <form className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <div>
          <label
            htmlFor="message"
            className="mb-1.5 block text-sm font-medium text-[var(--foreground)]"
          >
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition-all hover:bg-[var(--accent-light)] hover:shadow-[var(--accent)]/40 disabled:opacity-50"
        >
          Send Message
        </button>
        <p className="text-xs text-[var(--muted)]">
          Form submission will be handled by a server action once the API is
          connected.
        </p>
      </form>
    </div>
  );
}
