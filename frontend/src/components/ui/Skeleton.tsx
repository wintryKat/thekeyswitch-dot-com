interface SkeletonProps {
  className?: string;
  width?: string;
  height?: string;
}

export default function Skeleton({
  className = "",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded bg-[var(--surface-border)] ${className}`}
      style={{ width, height }}
    />
  );
}
