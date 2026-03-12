"use client";

import React, { useState, useEffect } from "react";

// Obfuscated email — assembled at runtime so scrapers can't find it in HTML
function useObfuscatedEmail() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const parts = ["kat", "@", "thekeyswitch", ".", "com"];
    setEmail(parts.join(""));
  }, []);

  return email;
}

type FormStatus =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string };

export default function ContactPage() {
  const email = useObfuscatedEmail();
  const [status, setStatus] = useState<FormStatus>({ kind: "idle" });

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus({ kind: "submitting" });

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: data.get("name") as string,
      email: data.get("email") as string,
      message: data.get("message") as string,
      website: data.get("website") as string, // honeypot
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = (await res.json()) as { success: boolean; message: string };

      if (json.success) {
        setStatus({ kind: "success", message: json.message });
        form.reset();
      } else {
        setStatus({ kind: "error", message: json.message });
      }
    } catch {
      setStatus({
        kind: "error",
        message: "Something went wrong. Please try again.",
      });
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface)] px-4 py-2.5 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)]/50 focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)]";

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-[var(--foreground)]">
        Contact
      </h1>
      <p className="mb-10 text-[var(--muted)] leading-relaxed">
        Interested in working together or have a question? Reach out using the
        form below
        {email && (
          <>
            {" "}
            or email me directly at{" "}
            <a
              href={`mailto:${email}`}
              className="text-[var(--accent-light)] underline underline-offset-2 transition-colors hover:text-[var(--accent)]"
            >
              {email}
            </a>
          </>
        )}
        .
      </p>

      {/* Success state */}
      {status.kind === "success" && (
        <div className="mb-8 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-700 dark:text-emerald-300">
          {status.message}
        </div>
      )}

      {/* Error state */}
      {status.kind === "error" && (
        <div className="mb-8 rounded-lg border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-700 dark:text-red-300">
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Honeypot — invisible to real users, bots will fill it */}
        <div className="absolute left-[-9999px]" aria-hidden="true">
          <label htmlFor="website">Website</label>
          <input
            type="text"
            id="website"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

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
            placeholder="Your name"
            className={inputClasses}
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
            placeholder="you@example.com"
            className={inputClasses}
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
            placeholder="What would you like to discuss?"
            className={inputClasses}
          />
        </div>

        <button
          type="submit"
          disabled={status.kind === "submitting"}
          className="rounded-lg bg-[var(--accent)] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--accent)]/25 transition-all hover:bg-[var(--accent-light)] hover:shadow-[var(--accent)]/40 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status.kind === "submitting" ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}
