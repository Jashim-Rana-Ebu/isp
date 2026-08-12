import type { Metadata } from "next";
import { Hanken_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hankenGrotesk = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken-grotesk",
  weight: ["400", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ultimate ISP — Complete ISP Management Platform",
  description:
    "Blazing fast fiber optic internet management with 99.9% uptime guarantee. Automate billing, monitor networks, and scale your ISP operations from a single command center.",
  keywords: ["ISP", "internet service provider", "network management", "CRM", "billing", "Mikrotik"],
  openGraph: {
    title: "Ultimate ISP — Complete ISP Management Platform",
    description: "Automate billing, monitor networks, and scale your ISP operations from a single command center.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${hankenGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="bg-background text-on-surface font-inter min-h-screen overflow-x-hidden antialiased selection:bg-primary-container selection:text-white">
        {children}
      </body>
    </html>
  );
}
