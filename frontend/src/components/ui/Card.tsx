interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-[var(--surface-border)] bg-[var(--surface)] p-6 ${className}`}
    >
      {children}
    </div>
  );
}
