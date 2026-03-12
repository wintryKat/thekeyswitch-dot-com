import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WebXR Lab | The Key Switch",
  description:
    "Immersive 3D mechanical keyboard workshop built with WebXR and Three.js.",
};

export default function XRLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
