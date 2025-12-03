import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import Footer from "@/components/footer";

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
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
         <div className="h-screen w-full flex flex-col overflow-hidden">
          {/* NAVBAR */}
          <Navbar />

          {/* FRAME: SIDEBAR + PAGE CONTENT */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* LEFT FIXED SIDEBAR */}
            <div className=" border-r bg-background h-full ">
          <Sidebar />
        </div>

            {/* PAGE CONTENT (each page manages its own layout) */}
            <div className="flex-1 overflow-hidden">
              {children}
            </div>

          </div>
  <Footer />
  </div> 
        </ThemeProvider>
      </body>
    </html>
  );
}
