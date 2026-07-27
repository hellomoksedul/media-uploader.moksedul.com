"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  ApiMedia,
  MediaAdapter,
  MediaConfig,
  MediaContextType,
  MediaMapFn,
} from "../MediaProvider";

export interface UseMediaLibraryOptions {
  adapter: MediaAdapter;
  /** Convert a raw backend item into the library's ApiMedia shape. */
  map?: MediaMapFn;
  /** Page size for list + load-more. Default 40. */
  pageSize?: number;
  config?: MediaConfig;
}

/**
 * Owns ALL the media-library state (list, pagination, loading flags) and wraps
 * the consumer's raw adapter functions so upload / delete / update also keep the
 * local list in sync. Consumers just hand over a few async functions + a `map`.
 *
 * Options are read through refs so an inline `adapter={{ ... }}` object does NOT
 * cause refetch loops — no `useMemo` required on the consumer side.
 *
 * Pass `null` to get an inert, empty context (used when the legacy `value` API
 * is in play, so the hook is still called unconditionally).
 */
export function useMediaLibrary(
  options: UseMediaLibraryOptions | null,
): MediaContextType {
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const [mediaFiles, setMediaFiles] = useState<ApiMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const toApiMedia = useCallback((raw: unknown): ApiMedia => {
    const map = optionsRef.current?.map;
    return map ? map(raw) : (raw as ApiMedia);
  }, []);

  const fetchPage = useCallback(
    async (pageNum: number, append: boolean) => {
      const opts = optionsRef.current;
      if (!opts?.adapter) return;
      const pageSize = opts.pageSize ?? 40;
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      try {
        const res = await opts.adapter.list({
          page: pageNum,
          limit: pageSize,
          search: "",
        });
        if (res.success) {
          const items = (res.data ?? []).map(toApiMedia);
          setMediaFiles((prev) => (append ? [...prev, ...items] : items));
          const meta = res.meta;
          const more =
            meta?.hasMore ??
            (meta?.totalPages != null
              ? pageNum < meta.totalPages
              : items.length === pageSize);
          setHasMore(Boolean(more));
          setPage(pageNum);
        }
      } catch (err) {
        console.error("Failed to load media:", err);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [toApiMedia],
  );

  // Fetch the first page once on mount (only when an adapter is configured).
  useEffect(() => {
    if (optionsRef.current?.adapter) fetchPage(1, false);
  }, [fetchPage]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore) return;
    fetchPage(page + 1, true);
  }, [hasMore, isLoadingMore, page, fetchPage]);

  const uploadMedia = useCallback(
    async (file: File, folder: string) => {
      const adapter = optionsRef.current?.adapter;
      if (!adapter) return { success: false, error: "No adapter configured" };
      try {
        const res = await adapter.upload(file, folder);
        if (!res.success || res.data == null) {
          return { success: false, error: res.error || "Upload failed" };
        }
        const raw = Array.isArray(res.data) ? res.data[0] : res.data;
        const item = toApiMedia(raw);
        setMediaFiles((prev) => [item, ...prev]);
        return { success: true, data: item };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Upload failed",
        };
      }
    },
    [toApiMedia],
  );

  const deleteMedia = useCallback(async (id: string) => {
    const adapter = optionsRef.current?.adapter;
    try {
      if (adapter?.remove) {
        const res = await adapter.remove(id);
        if (!res.success) {
          return { success: false, error: res.error || "Delete failed" };
        }
      }
      setMediaFiles((prev) => prev.filter((m) => m.id !== id));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Delete failed",
      };
    }
  }, []);

  const updateMedia = useCallback(
    async (id: string, data: { filename?: string; folder?: string }) => {
      const adapter = optionsRef.current?.adapter;
      try {
        if (adapter?.update) {
          const res = await adapter.update(id, data);
          if (!res.success) {
            return { success: false, error: res.error || "Update failed" };
          }
          if (res.data != null) {
            const raw = Array.isArray(res.data) ? res.data[0] : res.data;
            const item = toApiMedia(raw);
            setMediaFiles((prev) => prev.map((m) => (m.id === id ? item : m)));
            return { success: true, data: item };
          }
        }
        // Optimistic local update when no adapter.update is provided.
        setMediaFiles((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...data } : m)),
        );
        return { success: true };
      } catch (err) {
        return {
          success: false,
          error: err instanceof Error ? err.message : "Update failed",
        };
      }
    },
    [toApiMedia],
  );

  // Inert context when no adapter (legacy `value` API path).
  if (!options?.adapter) {
    return {
      mediaFiles: [],
      isLoading: false,
      isLoadingMore: false,
      hasMore: false,
      loadMore: () => {},
      uploadMedia: async () => ({
        success: false,
        error: "No adapter configured",
      }),
      deleteMedia: async () => ({ success: false }),
      updateMedia: async () => ({ success: false }),
    };
  }

  return {
    config: options.config,
    mediaFiles,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    uploadMedia,
    deleteMedia,
    updateMedia,
  };
}
