import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Metrics | The Key Switch",
  description: "Live observability dashboards for infrastructure health.",
};

export default function MetricsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
