import type { Metadata } from "next";
import { Bebas_Neue, JetBrains_Mono, Manrope } from "next/font/google";
import { SiteHeader } from "@/components/site/site-header";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const bebas = Bebas_Neue({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bike Hub | Bike Information and Comparison",
  description: "Bike specifications, comparison, and local showroom directory.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${bebas.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#fffaf1] text-slate-900">
        <div className="relative min-h-full overflow-x-clip">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_15%_5%,rgba(251,191,36,0.25),transparent_38%),radial-gradient(circle_at_90%_10%,rgba(34,197,94,0.18),transparent_30%),linear-gradient(180deg,#fffdf7_0%,#f7fbff_42%,#eef5ff_100%)]" />
          <SiteHeader />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
