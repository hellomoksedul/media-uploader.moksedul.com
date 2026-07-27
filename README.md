# @moksedul/media-uploader

A powerful, customizable, and headless media management and uploader library for React and Next.js applications.

## Features

- **Headless Architecture:** Bring your own backend storage (S3, R2, Cloudinary, etc.)
- **Built-in Image Editor:** Crop, rotate, and adjust images before uploading.
- **Unsplash Integration:** Search and import high-quality stock photos directly.
- **Highly Customizable:** Override themes, domain names, and layouts effortlessly.

## Installation

```bash
pnpm add @moksedul/media-uploader
```

Ensure you have the required peer dependencies installed:

```bash
pnpm add react react-dom lucide-react sonner
```

> **Note:** The UI components are styled using Tailwind CSS. You must import the package styles in your global CSS or root layout:
>
> ```tsx
> import "@moksedul/media-uploader/styles.css";
> ```

---

## Getting Started

### 1. Setup the Media Provider

Wrap your application (or the part of the app that uses the uploader) in `<MediaProvider>`. This is where you inject your custom configuration, backend API handlers, and design theme.

```tsx
import { MediaProvider, ApiMedia } from "@moksedul/media-uploader";
import "@moksedul/media-uploader/styles.css";

export default function App({ children }) {
  // Example state for tracking files
  const [mediaFiles, setMediaFiles] = useState<ApiMedia[]>([]);

  const handleUpload = async (file: File, folder: string) => {
    // Implement your actual upload logic here (e.g., fetch to /api/upload)
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url; // Return the final URL
  };

  const handleDelete = async (id: string) => {
    // Implement your delete logic here
    await fetch(`/api/media/${id}`, { method: "DELETE" });
  };

  return (
    <MediaProvider
      value={{
        mediaFiles,
        uploadMedia: handleUpload,
        deleteMedia: handleDelete,
        updateMedia: async (id, data) => {
          /* handle updates */
        },
        searchUnsplash: async (query, page) => {
          // Proxied unsplash search to avoid leaking API keys
          const res = await fetch(`/api/unsplash?q=${query}&page=${page}`);
          return res.json();
        },
        isLoading: false,
        isLoadingMore: false,
        hasMore: false,
        loadMore: () => {},
        config: {
          // Resolve custom domain names
          resolveMediaUrl: (url) =>
            url.replace("s3.amazonaws.com", "media.yourdomain.com"),
          theme: {
            primary: "221.2 83.2% 53.3%", // HSL format
            radius: "0.5rem",
          },
        },
      }}
    >
      {children}
    </MediaProvider>
  );
}
```

### 2. Using the Components

Once the provider is set up, you can use any of the exported components like `<MediaUploadDialog>` or `<MediaGrid>`.

```tsx
import { useState } from "react";
import { MediaUploadDialog } from "@moksedul/media-uploader";

export function UploadButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Uploader</button>

      {isOpen && (
        <MediaUploadDialog
          onClose={() => setIsOpen(false)}
          onConfirm={(urls) => {
            console.log("Selected URLs:", urls);
            setIsOpen(false);
          }}
        />
      )}
    </>
  );
}
```

---

## Customization

### Theming

The components use HSL variables for coloring to ensure compatibility with Tailwind CSS dark/light modes. You can inject your own theme settings in the provider config:

```tsx
config: {
  theme: {
    primary: "142.1 76.2% 36.3%", // A vibrant green
    radius: "1rem", // Extra rounded corners
    background: "0 0% 100%", // White
    foreground: "240 10% 3.9%", // Dark text
  }
}
```

### Custom Domains & Routing

Never hardcode CDN domains! Use the `resolveMediaUrl` method in the provider config to dynamically rewrite paths when rendering images.

```tsx
config: {
  resolveMediaUrl: (rawUrl) => {
    if (rawUrl.startsWith("https://s3.us-east-1.amazonaws.com/my-bucket")) {
      return rawUrl.replace(
        "https://s3.us-east-1.amazonaws.com/my-bucket",
        "https://media-uploader.moksedul.com",
      );
    }
    return rawUrl;
  };
}
```

This ensures that the uploader relies entirely on your configuration context without making any assumptions about your network topology.
