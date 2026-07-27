# @hellomoksedul/media-uploader

A powerful, customizable, and headless media management and uploader library for **React 18/19 + Next.js** applications.

## Features

- **Headless Architecture** — Bring your own backend (S3, R2, Cloudinary, etc.)
- **Built-in Image Editor** — Crop, rotate, flip, adjust brightness/contrast/saturation, apply filters
- **Unsplash Integration** — Search and import stock photos directly
- **4 Field Variants** — `box`, `button`, `avatar`, `dropzone`
- **Fully Customizable** — Override icons, borders, overlays, colors, and radius via props
- **Dark Mode** — Full dark/light mode support via `.dark` class
- **TypeScript** — Complete type definitions included

---

## Requirements

| Peer Dependency | Version |
|----------------|---------|
| `react` | `^18` or `^19` |
| `react-dom` | `^18` or `^19` |
| `next` | `>=13` |

> **Note:** This package uses `next/image` internally. It is designed for **Next.js** projects.

---

## Installation

```bash
pnpm add @hellomoksedul/media-uploader
```

---

## Setup

### 1. Import the stylesheet

In your root `layout.tsx` (or equivalent), import the package styles **after** your own global CSS:

```tsx
// layout.tsx (or in globals.css)
import "./globals.css";
import "@hellomoksedul/media-uploader/styles.css";

// In Tailwind CSS v4 (globals.css):
// @import "@hellomoksedul/media-uploader/styles.css" layer(utilities);
```

> ⚠️ Order matters. The package CSS must come **last** so its utilities don't get overridden.

### 2. Add the Toaster

The package uses [`sonner`](https://sonner.emilkowal.ski/) for toast notifications. You must mount `<Toaster>` once in your app (typically in `layout.tsx`):

```tsx
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
```

> If you already have `<Toaster>` mounted, do **not** add a second one — duplicate toasts will appear.

### 3. Wrap with MediaProvider

Wrap the part of your app that uses the uploader in `<MediaProvider>`. This is where you inject your backend API handlers and theme.

```tsx
"use client";

import { MediaProvider, ApiMedia } from "@hellomoksedul/media-uploader";
import { useState } from "react";

export function MediaProviderWrapper({ children }) {
  const [mediaFiles, setMediaFiles] = useState<ApiMedia[]>([]);

  return (
    <MediaProvider
      value={{
        // ── Required: upload handler ────────────────────────────────────────
        uploadMedia: async (file, folder) => {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", folder);
          const res = await fetch("/api/upload", { method: "POST", body: formData });
          const data = await res.json();
          if (!data.success) return { success: false, error: data.error };
          setMediaFiles((prev) => [data.media, ...prev]);
          return { success: true, data: data.media };
        },

        // ── Required: delete handler ────────────────────────────────────────
        deleteMedia: async (id) => {
          await fetch(`/api/media/${id}`, { method: "DELETE" });
          setMediaFiles((prev) => prev.filter((m) => m.id !== id));
          return { success: true };
        },

        // ── Required: update handler ────────────────────────────────────────
        updateMedia: async (id, updates) => {
          const res = await fetch(`/api/media/${id}`, {
            method: "PATCH",
            body: JSON.stringify(updates),
          });
          return res.json();
        },

        // ── Required: Unsplash search (return empty array to disable) ───────
        searchUnsplash: async (query, page) => {
          const res = await fetch(`/api/unsplash?q=${query}&page=${page}`);
          return res.json();
          // To disable Unsplash: return { success: true, data: [] }
        },

        // ── Required: media list ────────────────────────────────────────────
        mediaFiles,
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        loadMore: () => {},

        // ── Optional: theme ─────────────────────────────────────────────────
        config: {
          theme: {
            primary: "#588aff",   // brand color (any CSS color)
            radius: "0.625rem",   // border radius
          },
          // Rewrite CDN URLs for display:
          resolveMediaUrl: (url) =>
            url.replace("s3.amazonaws.com/bucket", "cdn.yourdomain.com"),
          // Proxy for CORS-safe image cropping:
          resolveProxyUrl: (url) => `/api/proxy?url=${encodeURIComponent(url)}`,
        },

        // ── Optional: billing / storage limits ──────────────────────────────
        isLimitError: (err) => err.includes("storage_limit"),
        onLimitExceeded: () => router.push("/billing"),
      }}
    >
      {children}
    </MediaProvider>
  );
}
```

---

## Usage

### `MediaUploadField` — Inline upload field

```tsx
import { MediaUploadField } from "@hellomoksedul/media-uploader";

// Box variant (default)
<MediaUploadField
  value={imageUrl}
  onChange={setImageUrl}
  variant="box"
  aspectRatio={1}
  outputWidth={1000}
  outputHeight={1000}
  outputFormat="webp"
  fileType="image"
  label="Click to upload"
  hint="1000 × 1000 px"
/>

// Avatar variant
<MediaUploadField
  value={avatarUrl}
  onChange={setAvatarUrl}
  variant="avatar"
  aspectRatio={1}
  size={96}
  fileType="image"
/>

// Dropzone variant
<MediaUploadField
  value={fileUrl}
  onChange={setFileUrl}
  variant="dropzone"
  fileType="all"
  hint="Image or video, up to 50MB"
/>

// Button variant
<MediaUploadField
  value={bannerUrl}
  onChange={setBannerUrl}
  variant="button"
  fileType="image"
  label="Upload banner"
/>
```

### `MediaUploadDialog` — Full dialog

```tsx
import { MediaUploadDialog } from "@hellomoksedul/media-uploader";

{isOpen && (
  <MediaUploadDialog
    onClose={() => setIsOpen(false)}
    onConfirm={(urls) => {
      console.log("Selected:", urls);
      setIsOpen(false);
    }}
    fileType="image"       // "all" | "image" | "video"
    imageRatio={16 / 9}    // optional aspect ratio constraint
    isMultiple={false}     // allow selecting multiple files
  />
)}
```

---

## Customization Props (`MediaUploadField`)

```tsx
<MediaUploadField
  // Icons
  icon={<MyUploadIcon />}           // empty state icon
  changeIcon={<RefreshIcon />}      // hover overlay icon (filled state)
  removeIcon={<TrashIcon />}        // remove button icon
  uploadIcon={<CloudIcon />}        // avatar / dropzone upload icon

  // Border
  borderVariant="dashed"            // "dashed" | "solid" | "none"
  borderClass="border-2 border-blue-500"  // full override (ignores borderVariant)

  // State-specific classes
  emptyClassName="bg-blue-50 text-blue-600"
  filledClassName="ring-2 ring-primary"

  // Overlay & labels
  changeLabel="Replace"             // text in hover overlay (default "Change")
  dropzoneLabel="Drop files here"   // dropzone-specific label

  // Behaviour
  showChangeOverlay={true}          // show/hide hover overlay (default true)
  showRemoveButton={true}           // show/hide remove × button (default true)
  removeButtonClassName="bg-red-600 hover:bg-red-700"
/>
```

---

## Theming

Override the design system via `config.theme` in `MediaProvider`:

```tsx
config: {
  theme: {
    primary: "#10b981",        // brand color — any CSS color
    radius: "1rem",            // border radius
    background: "#ffffff",
    foreground: "#111111",
    border: "#e5e7eb",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
  }
}
```

---

## Dark Mode

Add the `.dark` class to the `<html>` element to activate dark mode:

```tsx
document.documentElement.classList.toggle("dark", isDark);
```

---

## Known Limitations

- Requires **Next.js** (`next/image` is used internally in `SmartImage`)
- `react-mobile-cropper` has unofficial React 19 support (works in practice, but shows a peer dependency warning)
