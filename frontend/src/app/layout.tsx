import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/ui/Nav";
import Footer from "@/components/ui/Footer";
import ThemeProvider from "@/components/ui/ThemeProvider";
import ScrollReveal from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "Kat Aurelia | Senior Software Engineer",
  description:
    "Portfolio of Kat Aurelia — senior software engineer. Full-stack projects, mechanical keyboard tools, WebXR experiments, and technical writing.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://thekeyswitch.com"
  ),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Kat Aurelia | Senior Software Engineer",
    description:
      "Portfolio of Kat Aurelia — senior software engineer building full-stack projects and technical deep-dives.",
    siteName: "The Key Switch",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Key Switch — Kat Aurelia",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kat Aurelia | Senior Software Engineer",
    description:
      "Portfolio of Kat Aurelia — senior software engineer building full-stack projects and technical deep-dives.",
    images: ["/og-image.png"],
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
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark')}catch(e){}})()`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <ThemeProvider>
          <a href="#main-content" className="skip-to-content">
            Skip to content
          </a>
          <Nav />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <ScrollReveal />
        </ThemeProvider>
      </body>
    </html>
  );
}
