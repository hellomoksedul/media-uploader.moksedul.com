# media-uploader (monorepo)

Home of **[`@hellomoksedul/media-uploader`](./packages/uploader)** — a headless,
customizable media management + uploader library for **React 18/19 + Next.js**.

## Packages

| Package | Description |
|---|---|
| [`packages/uploader`](./packages/uploader) | `@hellomoksedul/media-uploader` — the published library. See its [README](./packages/uploader/README.md) for full usage. |
| `demo` | Local demo app for developing the library. |

## Quick start

```bash
pnpm add @hellomoksedul/media-uploader
```

```tsx
import { MediaProvider } from "@hellomoksedul/media-uploader";

<MediaProvider
  adapter={{
    list: ({ page, limit, search }) => listMediaAction({ page, limit, search }),
    upload: (file, folder) => uploadMediaAction(file, folder),
    remove: (id) => deleteMediaAction(id),
    update: (id, patch) => updateMediaAction(id, patch.filename ?? ""),
  }}
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
  config={{ theme: { primary: "#588aff", radius: "0.625rem" } }}
>
  {children}
</MediaProvider>
```

Then use the exported components:

- `MediaUploadField` — inline upload field (`box` / `button` / `avatar` / `dropzone`)
- `MediaUploadDialog` — tabbed upload dialog with the built-in image editor
- `MediaPreviewDialog` — view / rename / delete / navigate + open the image editor
- `MediaEditImageDialog` — full-screen crop / adjust / filter editor for an existing item
- `SmartImage` — responsive `next/image` wrapper

> Styles auto-inject (scoped under `.media-uploader-scope`) when `MediaProvider`
> mounts — no CSS import required. Mount a `sonner` `<Toaster>` once for toasts.

Full API, theming, CORS proxy, and styling notes live in the
**[package README](./packages/uploader/README.md)**.

## Development

```bash
pnpm install

# build the library (emits dist/ + bundled scoped styles)
pnpm --filter @hellomoksedul/media-uploader build

# run the demo app
pnpm --filter demo dev
```

> Consumed elsewhere as a local `file:` dependency? Rebuild the package and
> reinstall in the consumer after every change to the library source.
