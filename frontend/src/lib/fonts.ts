import { Geist, Geist_Mono } from "next/font/google";

// Font configuration with fallbacks
export const fontSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "'Segoe UI'",
    "Roboto",
    "'Helvetica Neue'",
    "Arial",
    "sans-serif"
  ],
});

export const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  fallback: [
    "ui-monospace",
    "'Cascadia Code'",
    "'Source Code Pro'",
    "Menlo",
    "Consolas",
    "'DejaVu Sans Mono'",
    "monospace"
  ],
});

// CSS class names for font utilities
export const fontClasses = {
  sans: fontSans.variable,
  mono: fontMono.variable,
} as const;

// Combined class for body
export const bodyFontClass = `${fontSans.variable} ${fontMono.variable}`;
