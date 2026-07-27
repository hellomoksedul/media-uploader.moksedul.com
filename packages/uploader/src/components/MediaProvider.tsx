import React, { createContext, useContext } from "react";
import { useMediaLibrary } from "./file-uploads/useMediaLibrary";
import { PACKAGE_STYLES } from "../generated-styles";

export function StyleInjector() {
  return (
    <style
      id="media-uploader-styles"
      dangerouslySetInnerHTML={{ __html: PACKAGE_STYLES }}
    />
  );
}

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
  /** @deprecated Unsplash support was removed. Kept optional for back-compat. */
  searchUnsplash?: (
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

// ── Simple adapter API ──────────────────────────────────────────────────────
// Hand the provider a few raw async functions + a `map`, and it owns all the
// state (list, pagination, loading) internally. This is the recommended way to
// wire the uploader to a backend.

export interface MediaListParams {
  page: number;
  limit: number;
  search: string;
}

export interface MediaListResult {
  success: boolean;
  /** Raw backend items — each is passed through `map` to become an ApiMedia. */
  data?: any[];
  /** Any one of these lets the provider work out `hasMore`. */
  meta?: { totalPages?: number; total?: number; hasMore?: boolean };
  error?: string;
}

export interface MediaMutationResult {
  success: boolean;
  /** Raw backend item (or array; first is used). Passed through `map`. */
  data?: any;
  error?: string;
}

export interface MediaAdapter {
  /** Fetch a page of media. Required. */
  list: (params: MediaListParams) => Promise<MediaListResult>;
  /** Upload one file. Required. */
  upload: (file: File, folder: string) => Promise<MediaMutationResult>;
  /** Delete by id. Optional — omit and the delete UI is hidden/local-only. */
  remove?: (id: string) => Promise<{ success: boolean; error?: string }>;
  /** Rename / move. Optional — omit and updates are applied locally. */
  update?: (
    id: string,
    patch: { filename?: string; folder?: string },
  ) => Promise<MediaMutationResult>;
}

/** Converts a raw backend item into the library's ApiMedia shape. */
export type MediaMapFn = (raw: any) => ApiMedia;

export type MediaProviderProps =
  | {
      children: React.ReactNode;
      /** Recommended: a few raw async functions; the provider owns the state. */
      adapter: MediaAdapter;
      map?: MediaMapFn;
      pageSize?: number;
      config?: MediaConfig;
      value?: never;
    }
  | {
      children: React.ReactNode;
      /** Advanced/legacy: supply the fully-built context yourself. */
      value: MediaContextType;
      adapter?: never;
      map?: never;
      pageSize?: never;
      config?: never;
    };

const MediaContext = createContext<MediaContextType | null>(null);

export function MediaProvider(props: MediaProviderProps) {
  const { children } = props;
  const usingAdapter = "adapter" in props && !!props.adapter;

  // Hook is always called (never conditional); passing null makes it inert.
  const built = useMediaLibrary(
    usingAdapter
      ? {
          adapter: props.adapter,
          map: props.map,
          pageSize: props.pageSize,
          config: props.config,
        }
      : null,
  );

  const value: MediaContextType = usingAdapter ? built : props.value;
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
      <StyleInjector />
      <div style={style} className="media-uploader-scope w-full h-full">
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
