import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "InterviewAI Palestine — AI Mock Interview Platform",
    template: "%s | InterviewAI Palestine",
  },
  description:
    "Prepare for tech interviews with AI-powered mock sessions and real 1-on-1 coaching from senior Palestinian engineers. Audio AI, Video Avatar, and Human Mentorship tiers.",
  keywords: [
    "AI interview",
    "mock interview",
    "Palestine tech",
    "computer engineering",
    "career coaching",
    "Gemini AI",
    "technical interview prep",
  ],
  authors: [{ name: "InterviewAI Palestine" }],
  creator: "InterviewAI Palestine",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "InterviewAI Palestine",
    title: "InterviewAI Palestine — AI Mock Interview Platform",
    description:
      "AI-powered mock interviews and real human coaching tailored for the Palestinian tech job market.",
  },
  twitter: {
    card: "summary_large_image",
    title: "InterviewAI Palestine",
    description: "AI mock interviews + human coaching for Palestinian engineers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import SessionReminderChecker from "@/components/SessionReminderChecker";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-[#050608] text-[#F0F4F8] font-sans antialiased">
        <SessionReminderChecker />
        {children}
      </body>
    </html>
  );
}
