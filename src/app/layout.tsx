"use client";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import React from "react";
import { ThemeProvider } from '@/contexts/ThemeContext';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
