import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
// IMPORTANT: import the app's own Tailwind FIRST, then the package stylesheet
// LAST. Both emit an `@layer utilities` block that merges by name, and within a
// layer the later source wins — so the package CSS must come last, otherwise the
// app's utilities (e.g. `flex-col`) override the package's responsive ones
// (`md:flex-row`) and the dialog/editor collapse into the mobile layout.
import "./globals.css";
import "@hellomoksedul/media-uploader/styles.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Uploader Sandbox",
  description: "A sandbox environment for @hellomoksedul/media-uploader",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
