import type { ApiMedia } from "./MediaProvider";

export type MediaItem = ApiMedia;

export function formatSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function getExtension(filename: string): string {
  try {
    // Strip query string and hash
    const cleanPath = filename.split("?")[0].split("#")[0];
    const parts = cleanPath.split(".");
    return parts.length > 1 ? parts.pop()?.toUpperCase() || "FILE" : "FILE";
  } catch {
    return "FILE";
  }
}
