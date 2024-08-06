import { ThemeProvider } from "@/components/theme-provider";
import { Ubuntu_Mono as FontSans } from "next/font/google"
import { Analytics } from '@vercel/analytics/react';
import type { Metadata } from "next";
import { cn } from "@/lib/utils"
import "./globals.css";

const fontSans = FontSans({
  subsets: ['latin'],
  variable: "--font-sans",
  weight: ["400", "700"]
})

export const metadata: Metadata = {
  title: "Broken llama",
  description: "gerardPolloRebozado web for the vercel hackathon 2024, my app is about a series of broken chatbots using llama3 from groq",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/vercel.svg" sizes="any" />
      </head>
      <body
        className={cn(
          "min-h-screen min-w-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
