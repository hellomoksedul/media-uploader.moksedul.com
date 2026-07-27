"use client";

import {
  MediaProvider as _MediaProvider,
  MediaUploadDialog as _MediaUploadDialog,
  MediaUploadField as _MediaUploadField,
  ApiMedia,
} from "@hellomoksedul/media-uploader";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";

// Loose casts to keep the sandbox decoupled from the library's exact prop types.
const MediaProvider = _MediaProvider as unknown as (
  props: React.ComponentProps<typeof _MediaProvider>,
) => React.ReactNode;
const MediaUploadDialog = _MediaUploadDialog as unknown as (
  props: React.ComponentProps<typeof _MediaUploadDialog>,
) => React.ReactNode;
const MediaUploadField = _MediaUploadField as unknown as (
  props: React.ComponentProps<typeof _MediaUploadField>,
) => React.ReactNode;

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Home() {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [thumb, setThumb] = useState("");
  const [cover, setCover] = useState("");
  const [avatar, setAvatar] = useState("");
  const [banner, setBanner] = useState("");
  const [attachment, setAttachment] = useState("");
  // Lazy initializer runs only on client — avoids setState inside an effect
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // In-memory mock "backend" for the sandbox. A real app would call server
  // actions / fetch here instead — the shape below is all the provider needs.
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
        toast.success(`Uploaded ${file.name}`);
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
      <main className="min-h-screen bg-background text-foreground p-8 transition-colors duration-300">
        <div className="mx-auto w-full max-w-4xl space-y-10">
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight">
                Media Uploader — variants
              </h1>
              <p className="text-sm text-muted-foreground">
                One field, four variants. Each opens the dialog + image editor
                and takes ratio / size / file-type props.
              </p>
            </div>

            {/* Dark / Light mode toggle */}
            <button
              id="theme-toggle"
              type="button"
              onClick={toggleTheme}
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted"
            >
              {mounted && isDark ? <SunIcon /> : <MoonIcon />}
              <span>{mounted ? (isDark ? "Light" : "Dark") : "Theme"}</span>
            </button>
          </header>

          <div className="grid gap-8 sm:grid-cols-2">
            {/* Box — square thumbnail, fixed output size */}
            <section className="space-y-2">
              <p className="text-sm font-medium">Box · 1:1 · 1000×1000</p>
              <div className="max-w-60">
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
            </section>

            {/* Box — 16:9 cover, images + video */}
            <section className="space-y-2">
              <p className="text-sm font-medium">Box · 16:9 · image + video</p>
              <MediaUploadField
                value={cover}
                onChange={setCover}
                variant="box"
                aspectRatio={16 / 9}
                fileType="all"
                label="Click to upload"
                hint="Image or video · 16:9"
              />
            </section>

            {/* Avatar — round */}
            <section className="space-y-2">
              <p className="text-sm font-medium">Avatar · round · 1:1</p>
              <MediaUploadField
                value={avatar}
                onChange={setAvatar}
                variant="avatar"
                aspectRatio={1}
                outputWidth={512}
                outputHeight={512}
                fileType="image"
                size={96}
                title="Upload avatar"
              />
            </section>

            {/* Button */}
            <section className="space-y-2">
              <p className="text-sm font-medium">Button</p>
              <MediaUploadField
                value={banner}
                onChange={setBanner}
                variant="button"
                aspectRatio={3 / 1}
                fileType="image"
                label="Upload banner"
              />
            </section>

            {/* Dropzone — full width, spans both columns */}
            <section className="space-y-2 sm:col-span-2">
              <p className="text-sm font-medium">Dropzone · drag & drop</p>
              <MediaUploadField
                value={attachment}
                onChange={setAttachment}
                variant="dropzone"
                fileType="all"
                hint="Image or video, up to 50MB"
              />
            </section>
          </div>

          {/* ── Customization showcase ────────────────────────────── */}
          <section className="space-y-6 border-t border-border pt-8">
            <div className="space-y-1">
              <p className="text-sm font-semibold">Customization showcase</p>
              <p className="text-xs text-muted-foreground">
                Same component — different icons, borders, and styles via props.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {/* Solid border + custom icon */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  solid border · custom icon
                </p>
                <div className="max-w-45">
                  <MediaUploadField
                    value={thumb}
                    onChange={setThumb}
                    variant="box"
                    aspectRatio={1}
                    fileType="image"
                    borderVariant="solid"
                    icon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    }
                    label="Drop image"
                    hint="Custom icon"
                  />
                </div>
              </div>

              {/* No border + custom overlay */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  no border · custom overlay
                </p>
                <div className="max-w-45">
                  <MediaUploadField
                    value={cover}
                    onChange={setCover}
                    variant="box"
                    aspectRatio={1}
                    fileType="image"
                    borderVariant="none"
                    emptyClassName="bg-primary/10 text-primary hover:bg-primary/15 rounded-2xl"
                    changeLabel="Replace"
                    changeIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 2v6h-6" />
                        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                        <path d="M3 22v-6h6" />
                        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                      </svg>
                    }
                    label="Choose photo"
                    hint="No border style"
                  />
                </div>
              </div>

              {/* Avatar — large + no remove button */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  avatar · no remove button
                </p>
                <MediaUploadField
                  value={avatar}
                  onChange={setAvatar}
                  variant="avatar"
                  aspectRatio={1}
                  fileType="image"
                  size={96}
                  borderVariant="dashed"
                  showRemoveButton={false}
                  showChangeOverlay={true}
                  uploadIcon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                    </svg>
                  }
                />
              </div>
            </div>
          </section>

          {/* Full dialog trigger */}
          <section className="space-y-2 border-t border-border pt-8">
            <p className="text-sm font-medium">Full upload dialog (direct)</p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Open upload dialog
            </button>
          </section>
        </div>
      </main>

      {isUploadOpen && (
        <MediaUploadDialog
          onClose={() => setIsUploadOpen(false)}
          onConfirm={(urls) => {
            console.log("Uploaded via dialog:", urls);
            setIsUploadOpen(false);
          }}
        />
      )}
    </MediaProvider>
  );
}
