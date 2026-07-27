"use client";

import { Button } from "@/components/common/Button";
import React, { useState } from "react";
import { toast } from "sonner";

interface UploadFilesProps {
  onFileUpload: (fileOrUrl: File | string) => void;
  uploadDirectly?: boolean;
  fileType?: "all" | "image" | "video";
}

export default function UploadFiles({
  onFileUpload,
  fileType = "all",
}: UploadFilesProps) {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingName, setProcessingName] = useState("");

  const validateFileType = (file: File): boolean => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error(`${file.name} exceeds the 50MB size limit.`);
      return false;
    }
    const supportedImages = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/svg+xml",
      "image/avif",
    ];
    const supportedVideos = ["video/mp4", "video/webm", "video/quicktime"];
    const valid =
      fileType === "image"
        ? supportedImages.includes(file.type)
        : fileType === "video"
          ? supportedVideos.includes(file.type)
          : [...supportedImages, ...supportedVideos].includes(file.type);
    if (!valid)
      toast.error(
        `${file.name} is not a supported ${fileType === "all" ? "media" : fileType} file.`,
      );
    return valid;
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(validateFileType);
    if (validFiles.length === 0) return;

    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      setIsProcessing(true);
      setProcessingName(file.name);
      onFileUpload(file);
    }

    setIsProcessing(false);
    setProcessingName("");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFiles(Array.from(files));
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleFiles(Array.from(files));
    }
  };

  const acceptAttr =
    fileType === "video"
      ? ".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
      : fileType === "image"
        ? ".jpg,.jpeg,.png,.webp,.avif,.gif,.svg,image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml"
        : "image/*,video/mp4,video/webm,video/quicktime";

  const fileTypeLabel =
    fileType === "video"
      ? "MP4, WebM or MOV"
      : fileType === "image"
        ? "JPG, PNG, WebP, AVIF, GIF or SVG"
        : "Supported image or video files";

  return (
    <div className="w-full h-full">
      {isProcessing ? (
        <div className="flex flex-col items-center justify-center gap-5 border rounded-lg bg-muted/20 h-full min-h-150 p-8">
          <span className="h-12 w-12 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <div className="text-center space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Processing file...
            </p>
            <p className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md inline-block truncate max-w-xs">
              {processingName}
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`relative group flex flex-col items-center justify-center w-full h-full rounded-lg border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer hover:bg-muted/50 ${
            isDragging
              ? "border-primary bg-primary/5 ring-4 ring-primary/10"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
          onDrop={handleDrop}
        >
          <label
            htmlFor="fileUpload"
            className="flex flex-col items-center justify-center w-full h-full p-6 text-center cursor-pointer"
          >
            <div className="p-4 mb-4 rounded-full bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-8 h-8"
              >
                <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                <path d="M12 12v9" />
                <path d="m16 16-4-4-4 4" />
              </svg>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 px-5 shadow-none mb-3 pointer-events-none"
              asChild
            >
              <span>Choose file</span>
            </Button>
            <p className="mb-2 text-sm font-medium text-foreground">
              or drag and drop
            </p>
            <p className="text-xs text-muted-foreground">
              {fileTypeLabel} (max. 50MB)
            </p>
          </label>
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            accept={acceptAttr}
            onChange={handleFileChange}
            disabled={isProcessing}
            multiple
          />
        </div>
      )}
    </div>
  );
}
