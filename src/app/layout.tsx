import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AiAssistant } from "@/components/AiAssistant";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "@/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "AI.Next Portal | Rustomjee",
  description:
    "Centralized management platform for tracking and scaling AI initiatives across Rustomjee business units.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <Providers>
          <Navbar />
          <main className="min-h-[calc(100vh-4rem)]">{children}</main>
          <AiAssistant />
        </Providers>
      </body>
    </html>
  );
}
