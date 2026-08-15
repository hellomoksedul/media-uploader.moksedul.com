"use client";

import { Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "./common/Button";

const CustomImageEditor = dynamic(
  () => import("./file-uploads/cropper/ImageEditor"),
  { ssr: false, loading: () => <EditorLoadingFallback /> },
);
const MobileImageEditor = dynamic(
  () => import("./file-uploads/cropper/MobileImageEditor"),
  { ssr: false, loading: () => <EditorLoadingFallback /> },
);

function EditorLoadingFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export interface MediaEditImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Display URL of the image to edit. CORS proxying for the canvas is handled
   * inside the editor via `config.resolveProxyUrl`, so pass the plain URL.
   */
  imageUrl: string;
  fileName: string;
  fileSize?: string;
  aspectRatio?: number;
  outputWidth?: number;
  imageFormat?: string;
  /** Fired after the edited image finishes uploading through the provider. */
  onSaveComplete?: (newFileUrl?: string) => void;
}

const getExtension = (name: string) => {
  const cleanName = name.split("?")[0];
  const parts = cleanName.split(".");
  return parts.length > 1 ? parts.pop()?.toLowerCase() || "webp" : "webp";
};

/**
 * Full-screen image editor for an *existing* media item. Opens the crop / adjust
 * / filter editor, and on apply re-encodes the canvas and uploads it through the
 * MediaProvider (the underlying cropper calls `uploadMedia`). Desktop renders as
 * an absolute overlay (drop it inside a relatively-positioned dialog); mobile
 * portals to `document.body`.
 */
export function MediaEditImageDialog({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  fileSize,
  aspectRatio,
  outputWidth,
  imageFormat,
  onSaveComplete,
}: MediaEditImageDialogProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!isOpen || isMobile === null) return null;

  const format = imageFormat || getExtension(fileName);

  if (isMobile) {
    // Portals to <body>, outside any parent scope — wrap so the package's
    // scoped styles (incl. the cropper stylesheet) apply.
    return createPortal(
      <div className="media-uploader-scope fixed inset-0 z-9999 bg-background flex flex-col h-dvh w-full overflow-hidden">
        <MobileImageEditor
          imageSrc={imageUrl}
          onClose={onClose}
          imageFormat={format}
          aspectRatio={aspectRatio}
          outputWidth={outputWidth}
          onApply={(url: string) => onSaveComplete?.(url)}
        />
      </div>,
      document.body,
    );
  }

  const shortName =
    fileName.split("?")[0].length > 40
      ? fileName.split("?")[0].substring(0, 40) + "..."
      : fileName.split("?")[0];

  return (
    <div className="media-uploader-scope absolute inset-0 z-50 bg-card rounded-xl overflow-hidden flex flex-col">
      <div className="relative flex items-center justify-between p-4 border-b border-border shrink-0 gap-4">
        <div className="space-y-1 min-w-0 flex-1">
          <h3 className="font-medium text-base text-foreground leading-tight truncate">
            Image Editor
          </h3>
          <p className="text-xs text-muted-foreground font-medium truncate">
            {shortName}
            {fileSize ? ` • ${fileSize}` : ""}
          </p>
        </div>

        <div className="absolute inset-y-0 left-0 md:left-92.5 right-0 flex items-center justify-center pointer-events-none z-10">
          <div
            id="image-editor-header-center"
            className="pointer-events-auto flex items-center justify-center min-h-8"
          />
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground rounded-full w-8 h-8"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      <div className="flex-1 relative min-h-0 bg-card">
        <CustomImageEditor
          imageSrc={imageUrl}
          onClose={onClose}
          imageFormat={format}
          aspectRatio={aspectRatio}
          outputWidth={outputWidth}
          onApply={(url: string) => onSaveComplete?.(url)}
        />
      </div>
    </div>
  );
}

export default MediaEditImageDialog;
