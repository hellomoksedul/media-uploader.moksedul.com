"use client";

import { Button } from "@/components/common/Button";
import { Loader2, X } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

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
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  fileName: string;
  fileSize?: string;
  aspectRatio?: number;
  outputWidth?: number;
  imageFormat?: string;
  onSaveComplete?: (newFileUrl?: string) => void;
}

export function ImageEditorDialog({
  isOpen,
  onClose,
  imageUrl,
  fileName,
  fileSize,
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

  if (!isOpen || isMobile === null) return null;

  const getExtension = (name: string) => {
    const cleanName = name.split("?")[0];
    const parts = cleanName.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() || "webp" : "webp";
  };

  if (isMobile) {
    return createPortal(
      <MobileImageEditor
        imageSrc={imageUrl}
        onClose={onClose}
        imageFormat={imageFormat || getExtension(fileName)}
        aspectRatio={aspectRatio}
        outputWidth={outputWidth}
        onApply={(url) => {
          if (onSaveComplete) onSaveComplete(url);
        }}
      />,
      document.body,
    );
  }

  return (
    <div className="absolute inset-0 z-50 bg-background rounded-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border shrink-0 gap-4">
        <div className="space-y-1 min-w-0 max-w-xs shrink-0">
          <h3 className="font-medium text-base text-foreground leading-tight truncate">
            Image Editor
          </h3>
          <p className="text-xs text-muted-foreground font-medium truncate">
            {fileName.split("?")[0].length > 40
              ? fileName.split("?")[0].substring(0, 40) + "..."
              : fileName.split("?")[0]}
            {fileSize ? ` • ${fileSize}` : ""}
          </p>
        </div>

        {/* Center Portal Target */}
        <div className="flex-1 flex items-center justify-center">
          <div
            id="image-editor-header-center"
            className="flex items-center justify-center min-h-8"
          ></div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground rounded-full w-8 h-8"
            onClick={onClose}
          >
            <X size={20} />
          </Button>
        </div>
      </div>

      {/* Editor Body */}
      <div className="flex-1 relative min-h-0 bg-background">
        <CustomImageEditor
          imageSrc={imageUrl}
          onClose={onClose}
          imageFormat={imageFormat || getExtension(fileName)}
          aspectRatio={aspectRatio}
          outputWidth={outputWidth}
          onApply={(url) => {
            if (onSaveComplete) onSaveComplete(url);
          }}
        />
      </div>
    </div>
  );
}
