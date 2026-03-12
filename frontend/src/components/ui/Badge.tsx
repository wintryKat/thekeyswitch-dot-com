interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "accent" | "success" | "warning";
  className?: string;
}

const variantStyles: Record<string, string> = {
  default:
    "bg-[var(--surface)] border-[var(--surface-border)] text-[var(--muted)]",
  accent:
    "bg-[var(--accent)]/10 border-[var(--accent)]/20 text-[var(--accent-light)]",
  success:
    "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400",
  warning:
    "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
