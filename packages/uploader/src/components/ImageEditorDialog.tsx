"use client";

import { Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

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

interface ImageEditorDialogProps {
  onClose: () => void;
  imageUrl: string;
  aspectRatio?: number;
  outputWidth?: number;
  imageFormat?: string;
  onSaveComplete?: (newFileUrl?: string) => void;
}

/**
 * Phase-2 (edit) body content for MediaUploader. Renders inline inside the
 * shared AlertDialogContent (no own header/close, no portal) so it stays
 * under `.media-uploader-scope` and shares the surrounding modal chrome.
 */
export function ImageEditorDialog({
  onClose,
  imageUrl,
  aspectRatio,
  outputWidth,
  imageFormat,
  onSaveComplete,
}: ImageEditorDialogProps) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isMobile === null) return <EditorLoadingFallback />;

  const getExtension = (name: string) => {
    const cleanName = name.split("?")[0];
    const parts = cleanName.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() || "webp" : "webp";
  };

  if (isMobile) {
    return (
      <MobileImageEditor
        imageSrc={imageUrl}
        onClose={onClose}
        imageFormat={imageFormat || getExtension(imageUrl)}
        aspectRatio={aspectRatio}
        outputWidth={outputWidth}
        onApply={(url) => {
          if (onSaveComplete) onSaveComplete(url);
        }}
      />
    );
  }

  return (
    <CustomImageEditor
      imageSrc={imageUrl}
      onClose={onClose}
      imageFormat={imageFormat || getExtension(imageUrl)}
      aspectRatio={aspectRatio}
      outputWidth={outputWidth}
      onApply={(url) => {
        if (onSaveComplete) onSaveComplete(url);
      }}
    />
  );
}
