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
      config={{ theme: { primary: "#588aff", radius: "0.625rem" } }}
    >
      <div className="min-h-screen bg-slate-50/50 dark:bg-zinc-950 text-foreground selection:bg-blue-500/20">
        {/* Navigation */}
        <header className="sticky top-0 z-30 border-b border-zinc-200/40 dark:border-zinc-800/40 bg-background/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white font-mono text-xs font-bold shadow-xs">
                MU
              </div>
              <span className="text-sm font-semibold tracking-tight text-foreground">
                @hellomoksedul/media-uploader
              </span>
            </div>

            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-lg border border-zinc-200/50 dark:border-zinc-800/50 bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer shadow-xs"
            >
              {mounted && isDark ? "☀️ Light" : "🌙 Dark"}
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-5xl px-6 py-10 space-y-10">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-zinc-200/40 dark:border-zinc-800/40">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Media Uploader Sandbox
              </h1>
              <p className="text-sm text-muted-foreground">
                Zero-config React component suite with built-in cropper, filters, and dialogs.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer shrink-0"
            >
              Open Full Dialog
            </button>
          </div>

          {/* Component Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Box 1:1 */}
            <div className="rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-background p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Box Variant (1:1)
                </span>
                <span className="text-xs text-muted-foreground">1000 × 1000 px</span>
              </div>
              <div className="max-w-52 mx-auto pt-1">
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
            <div className="rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-background p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Cover Variant (16:9)
                </span>
                <span className="text-xs text-muted-foreground">Image or Video</span>
              </div>
              <div className="pt-1">
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
            <div className="rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-background p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Avatar Variant
                </span>
                <span className="text-xs text-muted-foreground">Round Profile</span>
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
                  size={100}
                  title="Upload avatar"
                />
              </div>
            </div>

            {/* Button Variant */}
            <div className="rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-background p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Button Variant
                </span>
                <span className="text-xs text-muted-foreground">Trigger Button</span>
              </div>
              <div className="flex items-center justify-center h-28 pt-1">
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
            <div className="sm:col-span-2 rounded-2xl border border-zinc-200/40 dark:border-zinc-800/40 bg-background p-6 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                  Dropzone Variant
                </span>
                <span className="text-xs text-muted-foreground">Drag & Drop Area</span>
              </div>
              <div className="pt-1">
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
        </main>

        {/* Footer */}
        <footer className="mx-auto max-w-5xl px-6 py-6 border-t border-zinc-200/40 dark:border-zinc-800/40 text-xs text-muted-foreground flex items-center justify-between">
          <span>@hellomoksedul/media-uploader</span>
          <span>Zero-config React Package</span>
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
