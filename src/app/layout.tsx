import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Director's Cut - Bria FIBO",
  description: "Agentic Storyboard Generation using Bria FIBO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.className, "min-h-screen antialiased bg-background text-foreground")} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
