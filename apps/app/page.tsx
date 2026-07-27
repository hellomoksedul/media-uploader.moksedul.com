"use client";

import {
  ApiMedia,
  MediaProvider,
  MediaUploadDialog,
  MediaUploadField,
} from "@hellomoksedul/media-uploader";
import React, { useMemo, useRef, useState } from "react";

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [thumb, setThumb] = useState("");
  const [cover, setCover] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [attachment, setAttachment] = useState("");
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      setMounted(true);
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      const dark = stored === "dark" || (!stored && prefersDark);
      setIsDark(dark);
      document.documentElement.classList.toggle("dark", dark);
    });
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  // Mock in-memory backend adapter for the demo
  const store = useRef<ApiMedia[]>([]);
  const adapter = useMemo(
    () => ({
      list: async () => ({ success: true, data: store.current }),
      upload: async (file: File, folder: string) => {
        const media: ApiMedia = {
          id: Math.random().toString(36).slice(2, 11),
          url: URL.createObjectURL(file),
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
          folder: folder || "images",
          width: 800,
          height: 600,
          createdAt: new Date(),
        };
        store.current = [media, ...store.current];
        return { success: true, data: media };
      },
      remove: async (id: string) => {
        store.current = store.current.filter((m) => m.id !== id);
        return { success: true };
      },
      update: async (id: string, patch: { filename?: string }) => {
        store.current = store.current.map((m) =>
          m.id === id ? { ...m, ...patch } : m,
        );
        return { success: true, data: store.current.find((m) => m.id === id) };
      },
    }),
    [],
  );

  return (
    <MediaProvider
      adapter={adapter}
      config={{ theme: { primary: "#588aff", radius: "0.75rem" } }}
    >
      <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
            <div className="flex flex-col">
              <span className="font-bold text-base tracking-tight text-foreground">
                @hellomoksedul/media-uploader
              </span>
              <span className="text-xs text-muted-foreground">
                Zero-Config React Package Landing Page & Showcase
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted text-foreground transition-colors"
              >
                <span>{mounted && isDark ? "☀️ Light Mode" : "🌙 Dark Mode"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-14 sm:py-20 border-b border-border/40 bg-linear-to-b from-blue-500/5 via-transparent to-transparent">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-6">
              <span>✨ 100% Zero-Config — Just install `@hellomoksedul/media-uploader`</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              Zero Extra Packages Needed
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground leading-relaxed">
              Install only <code className="font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">pnpm add @hellomoksedul/media-uploader</code> and everything works out of the box with built-in cropper, filters, icons, and dialogs.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsUploadOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all active:scale-[0.98]"
              >
                Open Upload Modal Demo
              </button>
            </div>
          </div>
        </section>

        {/* Live Interactive Sandbox */}
        <section className="py-12 sm:py-16 border-b border-border/40">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10 space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">Component Variants</h2>
              <p className="text-xs text-muted-foreground">
                All variants below work with zero CSS imports and zero extra npm dependencies.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              {/* Box 1:1 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 uppercase">Box Variant (1:1)</span>
                  <span className="text-xs text-muted-foreground">1000 × 1000 px</span>
                </div>
                <div className="max-w-60 mx-auto pt-2">
                  <MediaUploadField
                    value={thumb}
                    onChange={setThumb}
                    variant="box"
                    aspectRatio={1}
                    outputWidth={1000}
                    outputHeight={1000}
                    outputFormat="webp"
                    fileType="image"
                    label="Click to upload"
                    hint="1000 × 1000 px"
                  />
                </div>
              </div>

              {/* Cover 16:9 */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 uppercase">Cover Variant (16:9)</span>
                  <span className="text-xs text-muted-foreground">Images & Videos</span>
                </div>
                <div className="pt-2">
                  <MediaUploadField
                    value={cover}
                    onChange={setCover}
                    variant="box"
                    aspectRatio={16 / 9}
                    fileType="all"
                    label="Click to upload banner"
                    hint="Image or video • 16:9"
                  />
                </div>
              </div>

              {/* Avatar Round */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-purple-600 uppercase">Avatar Variant</span>
                  <span className="text-xs text-muted-foreground">Round Profile Photo</span>
                </div>
                <div className="flex justify-center pt-2">
                  <MediaUploadField
                    value={avatar}
                    onChange={setAvatar}
                    variant="avatar"
                    aspectRatio={1}
                    outputWidth={512}
                    outputHeight={512}
                    fileType="image"
                    size={110}
                    title="Upload avatar"
                  />
                </div>
              </div>

              {/* Button Variant */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-600 uppercase">Button Variant</span>
                  <span className="text-xs text-muted-foreground">Compact Trigger</span>
                </div>
                <div className="flex items-center justify-center h-32 pt-2">
                  <MediaUploadField
                    value={banner}
                    onChange={setBanner}
                    variant="button"
                    aspectRatio={3 / 1}
                    fileType="image"
                    label="Upload Banner Media"
                  />
                </div>
              </div>

              {/* Dropzone Spanning Both Columns */}
              <div className="sm:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-blue-600 uppercase">Dropzone Variant</span>
                  <span className="text-xs text-muted-foreground">Drag & Drop Area</span>
                </div>
                <div className="pt-2">
                  <MediaUploadField
                    value={attachment}
                    onChange={setAttachment}
                    variant="dropzone"
                    fileType="all"
                    hint="Supports drag & drop images or videos up to 50MB"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8 space-y-1">
            <p>© {new Date().getFullYear()} @hellomoksedul/media-uploader. All rights reserved.</p>
            <p>Single package installation • Zero extra dependencies in app</p>
          </div>
        </footer>
      </div>

      {/* Standalone Full Upload Modal */}
      {isUploadOpen && (
        <MediaUploadDialog
          onClose={() => setIsUploadOpen(false)}
          onConfirm={(urls) => {
            setIsUploadOpen(false);
          }}
        />
      )}
    </MediaProvider>
  );
}
