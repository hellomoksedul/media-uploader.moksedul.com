# @hellomoksedul/media-uploader

A powerful, customizable, and **headless** media management + uploader library for
**React 18/19 + Next.js**.

## Features

- **Headless Architecture** — bring your own backend (S3, R2, Cloudinary, custom API)
- **Built-in Image Editor** — crop, rotate, flip, adjust brightness/contrast/saturation, apply filters
- **Upload Dialog** — tabbed dialog (Upload / My Files) with search + pagination
- **Preview Dialog** — view, rename, delete, navigate, and open the image editor for existing files
- **4 Field Variants** — `box`, `button`, `avatar`, `dropzone`
- **Fully Customizable** — theme colors, radius, icons, borders via props/config
- **Scoped Styles** — all CSS is namespaced under `.media-uploader-scope`, so nothing leaks into your app
- **Dark Mode** — follows the `.dark` class on `<html>`
- **TypeScript** — complete type definitions included

---

## Requirements

| Peer dependency | Version |
|---|---|
| `react` | `^18` or `^19` |
| `react-dom` | `^18` or `^19` |
| `next` | `>=13` |

> Uses `next/image` internally (via `SmartImage`) — designed for **Next.js**.

---

## Installation

```bash
pnpm add @hellomoksedul/media-uploader
```

---

## Setup

### 1. Styling — zero config

Styles are **automatically injected** when `MediaProvider` mounts (scoped under
`.media-uploader-scope`). You do **not** need to import any CSS. A prebuilt
`@hellomoksedul/media-uploader/styles.css` is also shipped if you prefer to import
it manually.

### 2. Mount the Toaster once

The package uses [`sonner`](https://sonner.emilkowal.ski/) for toasts:

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

### 3. Wrap with `MediaProvider` (adapter API — recommended)

Hand the provider a few async **adapter** functions plus a `map`. The provider
then owns all the state (list, pagination, loading) and keeps it in sync on
upload / delete / update — no `useMemo` needed on your side.

```tsx
"use client";

import { MediaProvider } from "@hellomoksedul/media-uploader";

export function MediaProviderWrapper({ children }) {
  return (
    <MediaProvider
      adapter={{
        // Required — fetch a page of media.
        list: ({ page, limit, search }) => listMediaAction({ page, limit, search }),
        // Required — upload one file, return the created record.
        upload: (file, folder) => {
          const fd = new FormData();
          fd.append("file", file);
          fd.append("folder", folder);
          return uploadMediaAction(fd);
        },
        // Optional — omit and the delete UI becomes local-only.
        remove: (id) => deleteMediaAction(id),
        // Optional — omit and updates are applied locally.
        update: (id, patch) => updateMediaAction(id, patch.filename ?? ""),
      }}
      // Convert your backend record → the library's `ApiMedia` shape.
      map={(item) => ({
        id: item.id,
        url: item.url,
        filename: item.name,
        contentType: item.mimeType,
        sizeBytes: Number(item.size ?? 0),
        folder: item.mimeType?.startsWith("image/") ? "images" : "videos",
        width: null,
        height: null,
        createdAt: new Date(item.createdAt),
      })}
      pageSize={40}
      config={{
        theme: { primary: "#588aff", radius: "0.625rem" },
        // Rewrite CDN host for display / copy-URL
        resolveMediaUrl: (url) => url.replace("cdn.example.com", "media.example.com"),
        // Same-origin proxy so the editor's <canvas> isn't CORS-tainted while cropping
        resolveProxyUrl: (url) => `/api/media-proxy/${url.replace(/^https?:\/\/[^/]+\//, "")}`,
      }}
    >
      {children}
    </MediaProvider>
  );
}
```

**Adapter contracts**

```ts
list:   (params: { page: number; limit: number; search: string })
          => Promise<{ success: boolean; data?: any[];
                       meta?: { totalPages?: number; total?: number; hasMore?: boolean };
                       error?: string }>;
upload: (file: File, folder: string)
          => Promise<{ success: boolean; data?: any; error?: string }>;   // data → map()
remove?: (id: string) => Promise<{ success: boolean; error?: string }>;
update?: (id: string, patch: { filename?: string; folder?: string })
          => Promise<{ success: boolean; data?: any; error?: string }>;
```

> **Legacy `value` API:** you can instead pass a fully-built context object via
> `value={...}` (supplying `mediaFiles`, `uploadMedia`, `deleteMedia`, `updateMedia`,
> `isLoading`, `loadMore`, …). The `adapter` API above is recommended for new code.

---

## Components

### `MediaUploadField` — inline upload field

```tsx
import { MediaUploadField } from "@hellomoksedul/media-uploader";

<MediaUploadField
  value={imageUrl}
  onChange={setImageUrl}
  variant="box"            // "box" | "button" | "avatar" | "dropzone"
  aspectRatio={1}
  outputWidth={1000}
  outputFormat="webp"
  fileType="image"         // "all" | "image" | "video"
  label="Click to upload"
  hint="1000 × 1000 px"
/>
```

### `MediaUploadDialog` — tabbed upload dialog

```tsx
import { MediaUploadDialog } from "@hellomoksedul/media-uploader";

{isOpen && (
  <MediaUploadDialog
    onClose={() => setIsOpen(false)}
    onConfirm={(urls) => setIsOpen(false)}
    fileType="image"       // "all" | "image" | "video"
    imageRatio={16 / 9}    // optional aspect-ratio constraint
    isMultiple={false}
  />
)}
```

### `MediaPreviewDialog` — view / rename / delete / edit

A standalone preview for an existing item. Renders image / video / audio / generic
files, prev-next navigation, inline rename, delete (with confirm), copy-URL,
download, and a pencil button that opens the image editor. Rename/delete go through
the provider's `updateMedia` / `deleteMedia`.

```tsx
import { MediaPreviewDialog, type ApiMedia } from "@hellomoksedul/media-uploader";

const [preview, setPreview] = useState<ApiMedia | null>(null);

<MediaPreviewDialog
  previewItem={preview}
  setPreviewItem={setPreview}
  items={mediaList}                 // optional — for prev/next; defaults to the provider list
  onRefresh={() => refetch()}       // called after rename / delete / edit
  // onDelete={(id) => ...}         // optional — override the built-in confirm+delete
/>
```

### `MediaEditImageDialog` — full-screen image editor

Crop / adjust / filter an existing image; on save it re-encodes the canvas and
uploads through the provider's `uploadMedia`. `MediaPreviewDialog` opens this for
you, but you can use it directly too.

```tsx
import { MediaEditImageDialog } from "@hellomoksedul/media-uploader";

<MediaEditImageDialog
  isOpen={open}
  onClose={() => setOpen(false)}
  imageUrl={item.url}               // plain URL — CORS proxying uses config.resolveProxyUrl
  fileName={item.filename}
  aspectRatio={1}                   // optional
  outputWidth={1920}                // optional
  onSaveComplete={() => setOpen(false)}
/>
```

### `SmartImage`

Responsive `next/image` wrapper used internally; exported for convenience.

---

## `ApiMedia` shape

```ts
interface ApiMedia {
  id: string;
  url: string;
  folder: string;          // "images" | "videos" | "documents"
  filename: string;
  contentType: string;     // MIME type
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
}
```

Your backend records are converted to this via the provider's `map`.

---

## Theming

Set colors + radius via `config.theme`. **Values are plain CSS colors / lengths**
(e.g. `#588aff`, `oklch(...)`, `0.625rem`) — **not** bare HSL triplets.

```tsx
config: {
  theme: {
    primary: "#10b981",
    radius: "1rem",
    background: "#ffffff",
    foreground: "#111111",
    border: "#e5e7eb",
    muted: "#f3f4f6",
    mutedForeground: "#6b7280",
  },
}
```

### CDN rewriting & CORS proxy

```tsx
config: {
  // Display / copy-URL host rewrite
  resolveMediaUrl: (url) => url.replace("cdn.example.com", "media.example.com"),
  // Same-origin proxy the image editor uses so its <canvas> stays untainted
  resolveProxyUrl: (url) => `/api/media-proxy/${url.replace(/^https?:\/\/[^/]+\//, "")}`,
}
```

---

## Styling & scope (good to know)

All package CSS is prefixed with `.media-uploader-scope` and wrapped in an isolated
cascade layer, so it never leaks into (or inherits unexpectedly from) the host app.
Every package dialog/root already carries the class. Two implications if you build
your own wrappers around the primitives:

1. Package components must render **under** a `media-uploader-scope` ancestor for the
   styles (including the cropper stylesheet) to apply.
2. Utilities are emitted as **descendant** rules (`.media-uploader-scope .h-\[90vh\]`),
   so an arbitrary-value size class on the **same** element as `media-uploader-scope`
   won't apply — use inline `style` for critical dialog dimensions.

---

## Dark Mode

Toggle the `.dark` class on `<html>`:

```tsx
document.documentElement.classList.toggle("dark", isDark);
```

---

## Known Limitations

- Requires **Next.js** (`next/image` is used in `SmartImage`).
- `react-mobile-cropper` has unofficial React 19 support (works in practice; emits a
  peer-dependency warning).
