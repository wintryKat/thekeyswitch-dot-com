import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";

export const metadata: Metadata = {
  title: "The Key Switch | Portfolio & Engineering Showcase",
  description:
    "Senior web engineering portfolio featuring full-stack projects, a mechanical keyboard switch comparison tool, weather dashboards, WebXR experiments, and technical blog posts.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://thekeyswitch.com"
  ),
  openGraph: {
    title: "The Key Switch | Portfolio & Engineering Showcase",
    description:
      "Senior web engineering portfolio featuring full-stack projects and technical deep-dives.",
    siteName: "The Key Switch",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
