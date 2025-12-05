"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";

import { ThemeProvider } from "@/components/theme-provider";

export function Providers({ children, ...props }: React.ComponentProps<typeof ThemeProvider>) {
  return (
    <SessionProvider>
      <ThemeProvider {...props}>
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}