import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import Footer from "@/components/footer";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ApiLabs",
  description:
    "A full-featured API testing platform an open-source alternative to Postman with collections, environments, team collaboration, and mock servers.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="h-screen w-full flex flex-col overflow-hidden">
            <Navbar />
           
            <div className="flex flex-1 overflow-hidden">
              <div className=" border-r bg-background h-full hidden md:block ">
                <Sidebar />
              </div>

              <div className="flex-1 overflow-hidden">{children}</div>
            </div>
            <div className="hidden md:block ">
              <Footer />
            </div>
            <div className="block md:hidden">
              <Sidebar/>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
