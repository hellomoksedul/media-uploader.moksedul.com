"use client";

import MediaUploader from "@/components/file-uploads";
import { cn } from "@/lib/utils";
import {
  Image as ImageIcon,
  RefreshCw,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { ReactNode, useRef, useState } from "react";

export type MediaUploadVariant = "box" | "button" | "avatar" | "dropzone";
export type MediaUploadFileType = "all" | "image" | "video";
export type MediaUploadBorderVariant = "dashed" | "solid" | "none";

export interface MediaUploadFieldProps {
  // ── Core ──────────────────────────────────────────────────────────────────
  /** Current media URL. Empty string / undefined = nothing uploaded yet. */
  value?: string;
  /** Called with the new URL after upload+crop, or "" when the user removes it. */
  onChange: (url: string) => void;

  /** Visual style of the field. Default: "box". */
  variant?: MediaUploadVariant;

  // ── Crop / output ─────────────────────────────────────────────────────────
  /** Crop aspect ratio (width / height), e.g. 1, 4/3, 16/9. Omit for free crop. */
  aspectRatio?: number;
  /** Exact output size the saved image is scaled to. */
  outputWidth?: number;
  outputHeight?: number;
  /** Preferred output format, e.g. "webp". */
  outputFormat?: string;

  /** Which files are allowed. Default "all". */
  fileType?: MediaUploadFileType;

  // ── Labels ────────────────────────────────────────────────────────────────
  /** Empty-state label. Default "Click to upload". */
  label?: string;
  /** Small helper text under the label. */
  hint?: string;
  /** Upload dialog title. */
  title?: string;
  /** Label shown in the "Change" overlay when a file is filled. Default "Change". */
  changeLabel?: string;
  /** Label shown inside the dropzone. Falls back to label → "Drag & drop or click". */
  dropzoneLabel?: string;

  // ── Sizing ────────────────────────────────────────────────────────────────
  /** Box / dropzone width. Number = px, string passed through (e.g. "100%"). */
  width?: number | string;
  /** Box / dropzone height. If omitted, derived from width + aspectRatio. */
  height?: number | string;
  /** Avatar diameter in px (avatar variant only). Default 96. */
  size?: number;

  // ── Icon overrides ────────────────────────────────────────────────────────
  /** Icon shown in the empty state of box/avatar/dropzone variants. */
  icon?: ReactNode;
  /** Icon shown in the hover-overlay of the filled box/avatar (default: RefreshCw). */
  changeIcon?: ReactNode;
  /** Icon shown on the remove button (default: X). */
  removeIcon?: ReactNode;
  /** Icon shown in avatar / dropzone upload button (default: Upload). */
  uploadIcon?: ReactNode;

  // ── Border / style ────────────────────────────────────────────────────────
  /**
   * Controls the border style of the empty state.
   * - "dashed"  → dashed border (default for box)
   * - "solid"   → solid border
   * - "none"    → no border
   */
  borderVariant?: MediaUploadBorderVariant;
  /** Fully overrides border-related Tailwind classes (ignores borderVariant). */
  borderClass?: string;
  /** Extra Tailwind classes applied only when empty (no file). */
  emptyClassName?: string;
  /** Extra Tailwind classes applied only when filled (file is set). */
  filledClassName?: string;

  // ── Behaviour toggles ─────────────────────────────────────────────────────
  /** Whether to show the "Change" overlay on hover when filled. Default true. */
  showChangeOverlay?: boolean;
  /** Whether to show the remove (×) button when filled. Default true. */
  showRemoveButton?: boolean;

  // ── Remove button style ───────────────────────────────────────────────────
  /** Extra Tailwind classes for the remove button. */
  removeButtonClassName?: string;

  // ── Generic ───────────────────────────────────────────────────────────────
  /** Tailwind rounded-* class override for box/dropzone. */
  rounded?: string;
  disabled?: boolean;
  className?: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const isVideoUrl = (url?: string) =>
  !!url && /\.(mp4|mov|webm|avi|mkv|m4v)(\?|#|$)/i.test(url);

function dim(v?: number | string) {
  return typeof v === "number" ? `${v}px` : v;
}

/** Resolve the border classes for the empty state. */
function resolveBorderClass(
  borderVariant?: MediaUploadBorderVariant,
  borderClass?: string,
): string {
  if (borderClass) return borderClass;
  if (borderVariant === "solid") return "border border-border";
  if (borderVariant === "none") return "border-0";
  // default = "dashed"
  return "border border-dashed border-border";
}

/**
 * A fully-configurable media upload field.
 * Click (or drag, in the dropzone variant) opens the full upload dialog with
 * the built-in image editor / cropper, then returns the final URL via `onChange`.
 */
export function MediaUploadField({
  value,
  onChange,
  variant = "box",
  aspectRatio,
  outputWidth,
  outputHeight,
  outputFormat,
  fileType = "all",
  label = "Click to upload",
  hint,
  title,
  changeLabel = "Change",
  dropzoneLabel,
  width,
  height,
  size = 96,
  // icon overrides
  icon,
  changeIcon,
  removeIcon,
  uploadIcon,
  // border / style
  borderVariant,
  borderClass,
  emptyClassName,
  filledClassName,
  // behaviour
  showChangeOverlay = true,
  showRemoveButton = true,
  removeButtonClassName,
  // generic
  rounded,
  disabled,
  className,
}: MediaUploadFieldProps) {
  const [open, setOpen] = useState(false);
  const [initialFile, setInitialFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const ratio =
    aspectRatio ??
    (outputWidth && outputHeight ? outputWidth / outputHeight : undefined);

  const accept =
    fileType === "image"
      ? "image/*"
      : fileType === "video"
        ? "video/*"
        : "image/*,video/*";

  const openDialog = (file?: File | null) => {
    if (disabled) return;
    setInitialFile(file ?? null);
    setOpen(true);
  };

  const closeDialog = () => {
    setOpen(false);
    setInitialFile(null);
  };

  const remove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const filled = !!value;
  const showVideo = isVideoUrl(value);

  // ── Resolved icon defaults ────────────────────────────────────────────────
  const defaultEmptyIcon =
    fileType === "video" ? (
      <VideoIcon className="size-7" />
    ) : (
      <ImageIcon className="size-7" />
    );
  const resolvedIcon = icon ?? defaultEmptyIcon;
  const resolvedChangeIcon = changeIcon ?? <RefreshCw className="size-4" />;
  const resolvedRemoveIcon = removeIcon ?? <X className="size-3.5" />;
  const resolvedUploadIcon = uploadIcon ?? <Upload className="size-5" />;

  // ── Shared preview node ───────────────────────────────────────────────────
  const preview = (
    <>
      {showVideo ? (
        <video src={value} muted playsInline className="h-full w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" className="h-full w-full object-cover" />
      )}
    </>
  );

  // ── Dialog (rendered by every variant) ────────────────────────────────────
  const dialog = open ? (
    <MediaUploader
      onClose={closeDialog}
      onConfirm={(url: string | string[]) => {
        onChange(Array.isArray(url) ? url[0] : url);
        closeDialog();
      }}
      title={title ?? "Upload media"}
      imageRatio={ratio}
      imageWidth={outputWidth}
      imageFormat={outputFormat}
      fileType={fileType}
      initialFile={initialFile}
    />
  ) : null;

  // ── Remove button (shared) ────────────────────────────────────────────────
  const removeButton =
    filled && !disabled && showRemoveButton ? (
      <button
        type="button"
        onClick={remove}
        title="Remove"
        className={cn(
          "absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-colors hover:opacity-90",
          removeButtonClassName,
        )}
      >
        {resolvedRemoveIcon}
      </button>
    ) : null;

  // ═══════════════════════════════════════════════════════════════════════════
  // Variant: button
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === "button") {
    return (
      <div className={cn("media-uploader-scope inline-flex items-center gap-3", className)}>
        {filled && (
          <span className="relative inline-flex size-10 shrink-0 overflow-hidden rounded-md border border-border">
            {preview}
          </span>
        )}
        <button
          type="button"
          disabled={disabled}
          onClick={() => openDialog()}
          className={cn(
            "inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          {uploadIcon ?? <Upload className="size-4" />}
          {label === "Click to upload" ? "Upload" : label}
        </button>
        {filled && showRemoveButton && (
          <button
            type="button"
            onClick={remove}
            className={cn(
              "text-sm text-muted-foreground hover:text-destructive",
              removeButtonClassName,
            )}
          >
            Remove
          </button>
        )}
        {dialog}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Variant: avatar (round)
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === "avatar") {
    const emptyBorder = resolveBorderClass(borderVariant ?? "solid", borderClass);
    return (
      <div
        className={cn("media-uploader-scope relative shrink-0", className)}
        style={{ width: size, height: size }}
      >
        <button
          type="button"
          disabled={disabled}
          onClick={() => openDialog()}
          className={cn(
            "group relative flex h-full w-full items-center justify-center overflow-hidden rounded-full transition-colors",
            filled
              ? cn("border border-border", filledClassName)
              : cn(emptyBorder, "bg-muted/40 text-muted-foreground hover:bg-muted", emptyClassName),
          )}
          title={title ?? "Upload"}
        >
          {filled ? (
            <>
              {preview}
              {showChangeOverlay && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {resolvedChangeIcon}
                </span>
              )}
            </>
          ) : (
            resolvedUploadIcon
          )}
        </button>
        {filled && !disabled && showRemoveButton && (
          <button
            type="button"
            onClick={remove}
            className={cn(
              "absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white shadow-sm transition-colors hover:opacity-90",
              removeButtonClassName,
            )}
            title="Remove"
          >
            {removeIcon ?? <X className="size-3" />}
          </button>
        )}
        {dialog}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Variant: dropzone
  // ═══════════════════════════════════════════════════════════════════════════
  if (variant === "dropzone") {
    const resolvedDropzoneLabel =
      dropzoneLabel ?? (label === "Click to upload" ? "Drag & drop or click" : label);
    const emptyBorder = resolveBorderClass(borderVariant, borderClass);

    const onDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) openDialog(file);
    };
    return (
      <div className={cn("media-uploader-scope w-full", className)} style={{ width: dim(width) }}>
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) =>
            (e.key === "Enter" || e.key === " ") && inputRef.current?.click()
          }
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={cn(
            "flex flex-col items-center justify-center gap-2 rounded-xl p-8 text-center transition-colors",
            rounded,
            dragging
              ? "border border-primary bg-primary/5"
              : cn(emptyBorder, "bg-muted/30 hover:bg-muted/50"),
            disabled && "pointer-events-none opacity-50",
            emptyClassName,
          )}
          style={{ minHeight: dim(height) ?? 180 }}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            {resolvedUploadIcon}
          </span>
          <p className="text-sm font-medium">{resolvedDropzoneLabel}</p>
          {hint && (
            <p className="text-xs text-muted-foreground/70">{hint}</p>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) openDialog(file);
            e.target.value = "";
          }}
        />
        {dialog}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Variant: box (default)
  // ═══════════════════════════════════════════════════════════════════════════
  const boxStyle: React.CSSProperties = {
    width: dim(width) ?? "100%",
    ...(height
      ? { height: dim(height) }
      : ratio
        ? { aspectRatio: String(ratio) }
        : { aspectRatio: "1" }),
  };

  const emptyBorder = resolveBorderClass(borderVariant, borderClass);

  return (
    <div className={cn("media-uploader-scope relative", className)} style={boxStyle}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => openDialog()}
        style={{ width: "100%", height: "100%" }}
        className={cn(
          "group relative flex flex-col items-center justify-center gap-2 overflow-hidden transition-colors",
          rounded ?? "rounded-xl",
          filled
            ? cn("border border-solid border-border", filledClassName)
            : cn(emptyBorder, "bg-muted/30 text-muted-foreground hover:bg-muted/50", emptyClassName),
          disabled && "cursor-not-allowed opacity-50",
        )}
        title={title ?? label}
      >
        {filled ? (
          <>
            {preview}
            {showChangeOverlay && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-sm font-medium text-white opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
                <span className="mr-1.5">{resolvedChangeIcon}</span>
                {changeLabel}
              </span>
            )}
          </>
        ) : (
          <>
            {resolvedIcon}
            <span className="text-sm">{label}</span>
            {hint && (
              <span className="text-xs text-muted-foreground/70">{hint}</span>
            )}
          </>
        )}
      </button>

      {removeButton}

      {dialog}
    </div>
  );
}

export default MediaUploadField;
