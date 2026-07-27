import React, { createContext, useContext } from "react";

export interface ApiMedia {
  id: string;
  url: string;
  folder: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  createdAt: Date;
}

export interface StorageStatus {
  usedBytes: number;
  totalBytes: number;
  usagePercentage: number;
}

export type MediaFolder = "images" | "videos" | "documents";
export const MEDIA_FOLDERS: { value: MediaFolder; label: string; icon?: any }[] = [
  { value: "images", label: "Images" },
  { value: "videos", label: "Videos" },
  { value: "documents", label: "Documents" }
];

export interface UnsplashImage {
  id: string;
  url: string;
  thumb: string;
  author: string;
  authorUrl: string;
}

export interface MediaConfig {
  /** Resolve final display URLs (e.g., swapping CDN domains) */
  resolveMediaUrl?: (url: string) => string;
  /** Resolve proxy URLs to bypass CORS during image cropping */
  resolveProxyUrl?: (url: string) => string;
  /** Design customization */
  theme?: {
    primary?: string;
    radius?: string;
    background?: string;
    foreground?: string;
    border?: string;
    muted?: string;
    mutedForeground?: string;
  };
}

export interface MediaContextType {
  // Config
  config?: MediaConfig;

  // Actions
  uploadMedia: (
    file: File,
    folder: string,
  ) => Promise<{ success: boolean; data?: ApiMedia; error?: string }>;
  deleteMedia: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateMedia: (
    id: string,
    data: { filename?: string; folder?: string },
  ) => Promise<{ success: boolean; data?: ApiMedia; error?: string }>;
  searchUnsplash: (
    query: string,
    page: number,
  ) => Promise<{ success: boolean; data?: UnsplashImage[]; error?: string }>;

  // Data
  mediaFiles: ApiMedia[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => void;
  storageStatus?: StorageStatus;

  // Limits/Billing
  isLimitError?: (error: string) => boolean;
  onLimitExceeded?: () => void;
}

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: MediaContextType;
}) {
  const theme = value.config?.theme;
  // Tailwind v4 (CSS-first). The package's `@theme inline` maps `bg-primary`
  // etc. straight to these CSS variables, so overriding them here re-themes
  // every component at runtime. Values are plain CSS colors/lengths
  // (e.g. "#588aff", "oklch(...)", "0.625rem") — NOT bare HSL triplets.
  const style = {
    ...(theme?.primary && {
      "--color-themePrimaryColor": theme.primary,
      "--primary": theme.primary,
    }),
    ...(theme?.radius && { "--radius": theme.radius }),
    ...(theme?.background && { "--background": theme.background }),
    ...(theme?.foreground && { "--foreground": theme.foreground }),
    ...(theme?.border && { "--border": theme.border }),
    ...(theme?.muted && { "--muted": theme.muted }),
    ...(theme?.mutedForeground && {
      "--muted-foreground": theme.mutedForeground,
    }),
  } as React.CSSProperties;

  return (
    <MediaContext.Provider value={value}>
      <div style={style} className="w-full h-full">
        {children}
      </div>
    </MediaContext.Provider>
  );
}

export function useMediaContext() {
  const ctx = useContext(MediaContext);
  if (!ctx)
    throw new Error("useMediaContext must be used within a MediaProvider");
  return ctx;
}
