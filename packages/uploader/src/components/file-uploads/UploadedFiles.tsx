"use client";

import { Button } from "@/components/common/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileIcon, Play } from "lucide-react";
import { FaFileAlt } from "react-icons/fa";
import { FaCheck, FaImage } from "react-icons/fa6";
import { toast } from "sonner";
import { ApiMedia } from "../MediaProvider";
import SmartImage from "../SmartImage";
import DeleteItem from "./DeleteItem";

/** Format a Date as "MMM D, YYYY" using native Intl (no date-fns needed). */
const fmtDate = (d: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(d));

interface UploadedFilesProps {
  files: ApiMedia[];
  setFiles?: React.Dispatch<React.SetStateAction<ApiMedia[]>>;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  activeTab?: number;
  setActiveTab: React.Dispatch<React.SetStateAction<number>>;
  onImageSelect: (url: string, ratio: number, selectedType: string) => void;
  isVideo?: boolean;
  onlyVideo?: boolean;
  viewMode?: "grid" | "list";
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function UploadedFiles({
  files,
  setFiles,
  onDelete,
  isLoading = false,
  setActiveTab,
  onImageSelect,
  isVideo,
  onlyVideo,
  viewMode = "grid",
  selectedFileUrls = [],
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: UploadedFilesProps & { isMultiple?: boolean; selectedFileUrls?: string[] }) {
  // Handle file click based on type
  const handleFileClick = (file: ApiMedia, imgElement?: HTMLImageElement) => {
    const isVideoFile =
      file.contentType?.startsWith("video/") || isVideoType(file.url);

    if (isVideoFile) {
      if (!isVideo) {
        toast.error("Video selection is disabled.");
        return;
      }
      onImageSelect(file.url, 1, "video");
    } else {
      // Check if it really is an image
      const isImage =
        file.contentType?.startsWith("image/") || isImageType(file.url);

      if (isImage) {
        let aspectRatio = 1;
        if (imgElement) {
          aspectRatio = imgElement.naturalWidth / imgElement.naturalHeight;
        }
        onImageSelect(file.url, aspectRatio, "image");
      } else {
        // Generic file
        onImageSelect(file.url, 1, "file");
      }
    }
  };

  // Check if a URL corresponds to a video file based on extension
  const isVideoType = (url: string) =>
    url.endsWith(".mp4") ||
    url.endsWith(".mkv") ||
    url.endsWith(".avi") ||
    url.endsWith(".mov");

  // Check if a URL corresponds to an image file based on extension
  const isImageType = (url: string) =>
    url.endsWith(".jpg") ||
    url.endsWith(".jpeg") ||
    url.endsWith(".png") ||
    url.endsWith(".svg") ||
    url.endsWith(".gif") ||
    url.endsWith(".webp") ||
    url.endsWith(".avif");

  // Truncate filename for display
  const truncateFilename = (filename: string, maxLength: number) => {
    const parts = filename.split(".");
    if (parts.length < 2) {
      return filename.length > maxLength
        ? `${filename.slice(0, maxLength)}...`
        : filename;
    }

    const extension = parts.pop();
    const name = parts.join(".");

    if (!extension) {
      return filename.length > maxLength
        ? `${filename.slice(0, maxLength)}...`
        : filename;
    }

    const truncatedName = name.slice(0, maxLength - extension.length - 1);
    return `${truncatedName}...${extension}`;
  };

  // Render skeleton loaders
  const renderSkeletons = () => {
    if (viewMode === "list") {
      return Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center space-x-4 p-4 border-b border-border"
        >
          <div className="h-10 w-10 bg-muted animate-pulse rounded" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted animate-pulse w-1/3 rounded" />
            <div className="h-3 bg-muted animate-pulse w-1/4 rounded" />
          </div>
        </div>
      ));
    }
    return Array.from({ length: 15 }).map((_, index) => (
      <div
        key={index}
        className="w-full flex flex-col justify-center items-center aspect-square bg-muted animate-pulse rounded-lg"
      >
        <FaImage className="text-5xl text-muted-foreground/30" />
      </div>
    ));
  };

  const handleFileDelete = (deletedFileId: string) => {
    if (onDelete) {
      onDelete(deletedFileId);
    }
    if (setFiles) {
      setFiles((prevFiles) =>
        prevFiles.filter((file) => file.id !== deletedFileId),
      );
    }
  };

  if (files.length === 0) {
    return (
      <>
        {isLoading ? (
          viewMode === "list" ? (
            <div className="w-full flex flex-col">{renderSkeletons()}</div>
          ) : (
            <div className="w-full overflow-y-auto grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 2xl:grid-cols-8 gap-3">
              {renderSkeletons()}
            </div>
          )
        ) : (
          <div className="h-full w-full flex flex-col gap-4 justify-center items-center px-6">
            {/* Icon container */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl scale-150" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50">
                <FaFileAlt className="text-3xl text-muted-foreground/50" />
              </div>
            </div>
            {/* Text */}
            <div className="flex flex-col items-center gap-1.5 text-center">
              <span className="text-base font-semibold text-foreground">
                No files found
              </span>
              <span className="text-sm text-muted-foreground max-w-55">
                You haven&apos;t uploaded anything yet. Click below to get
                started.
              </span>
            </div>
            {/* Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setActiveTab(5);
                setTimeout(
                  () => document.getElementById("fileUpload")?.click(),
                  10,
                );
              }}
              size="sm"
              className="gap-2 px-5 shadow-none"
            >
              Choose file
            </Button>
          </div>
        )}
      </>
    );
  }

  const renderLoadMoreButton = () =>
    hasMore ? (
      <div className="flex justify-center pt-4 pb-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={onLoadMore}
          disabled={isLoadingMore}
          className="gap-2 min-w-30"
        >
          {isLoadingMore ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Loading...
            </>
          ) : (
            "Load more"
          )}
        </Button>
      </div>
    ) : null;

  if (viewMode === "list") {
    return (
      <div className="flex flex-col gap-2">
        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Type</TableHead>
                <TableHead className="hidden md:table-cell">Size</TableHead>
                <TableHead className="hidden lg:table-cell">Created</TableHead>
                <TableHead className="w-12.5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {files.map((file) => {
                const isVideoFile =
                  file.contentType?.startsWith("video/") ||
                  isVideoType(file.url);
                const isImageFile =
                  file.contentType?.startsWith("image/") ||
                  isImageType(file.url);

                const isSelected = selectedFileUrls.includes(file.url);

                // Disable if video not allowed
                const isDisabled =
                  (isVideoFile && !isVideo) ||
                  (!isVideoFile && !isImageFile) ||
                  (onlyVideo && !isVideoFile);

                return (
                  <TableRow
                    key={file.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "bg-primary/10 hover:bg-primary/15" : ""
                    } ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => {
                      if (isDisabled) {
                        toast.error("This file type is not allowed.");
                        return;
                      }
                      handleFileClick(file);
                    }}
                  >
                    <TableCell>
                      <div className="w-10 h-10 relative rounded overflow-hidden bg-muted border border-border">
                        {isImageFile ? (
                          <SmartImage
                            src={file.url}
                            alt="Preview"
                            fill
                            objectFit="cover"
                            priority={false}
                          />
                        ) : isVideoFile ? (
                          <>
                            <video
                              src={file.url}
                              muted
                              preload="metadata"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <Play className="h-3 w-3 text-white fill-white" />
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            <FileIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <span
                        className="truncate max-w-50 block"
                        title={file.filename || file.url}
                      >
                        {file.filename || file.url}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs uppercase text-muted-foreground">
                      {file.contentType?.split("/")[1] || "—"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {file.sizeBytes
                        ? (file.sizeBytes / 1024 / 1024).toFixed(2) + " MB"
                        : "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground">
                      {file.createdAt
                        ? fmtDate(file.createdAt)
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {/* Use DeleteItem but we need to stop propagation */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <DeleteItem
                          fileId={file.id || ""}
                          onDelete={handleFileDelete}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {renderLoadMoreButton()}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="w-full overflow-y-auto grid grid-cols-2 md:grid-cols-5 lg:grid-cols-7 2xl:grid-cols-8 gap-3">
        {isLoading ? (
          renderSkeletons()
        ) : (
          <>
            {files &&
              files.map((file) => {
                const isVideoFile =
                  file.contentType?.startsWith("video/") ||
                  isVideoType(file.url);
                const isImageFile =
                  file.contentType?.startsWith("image/") ||
                  isImageType(file.url);

                return (
                  <div
                    key={file.id}
                    className={`w-full border relative aspect-square h-auto overflow-hidden rounded-lg cursor-pointer transition-all ${
                      selectedFileUrls.includes(file.url)
                        ? "border-primary border-2 "
                        : "border-border hover:border-primary/50"
                    } ${
                      (isVideoFile && !isVideo) ||
                      (!isVideoFile && !isImageFile) ||
                      (onlyVideo && !isVideoFile)
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:shadow-lg"
                    }`}
                    onClick={(e) => {
                      if (isVideoFile && !isVideo) {
                        toast.error("Video selection is disabled.");
                        return;
                      }
                      if (onlyVideo && !isVideoFile) {
                        toast.error("Only video files are allowed.");
                        return;
                      }
                      if (isVideoFile) {
                        handleFileClick(file); // Handle video files
                      } else {
                        const imgElement = e.currentTarget.querySelector(
                          "img",
                        ) as HTMLImageElement;
                        if (imgElement) handleFileClick(file, imgElement); // Handle image files
                      }
                    }}
                  >
                    <div className="absolute top-2 right-2 z-10">
                      <DeleteItem
                        fileId={file.id || ""}
                        onDelete={handleFileDelete}
                      />
                    </div>

                    {selectedFileUrls.includes(file.url) && (
                      <div className="absolute top-2 left-2 z-10 bg-primary rounded-full p-1 shadow-sm">
                        <FaCheck className="text-sm text-primary-foreground" />
                      </div>
                    )}
                    {/* Render images */}
                    {isImageFile ? (
                      <SmartImage
                        src={file.url}
                        alt={file.filename || file.url}
                        width={250}
                        height={250}
                        className="w-full h-full object-cover aspect-square"
                        priority={false}
                      />
                    ) : null}

                    {/* Render videos */}
                    {isVideoFile ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          src={file.url}
                          muted
                          preload="metadata"
                          className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-black/40 rounded-full p-3 backdrop-blur-sm border border-background/20 group-hover:scale-110 transition-transform">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-linear-to-t from-black/80 to-transparent">
                          <span className="text-xs text-white truncate block opacity-90">
                            {file.filename
                              ? truncateFilename(file.filename, 20)
                              : truncateFilename(
                                  file.url.split("/").pop()!,
                                  20,
                                )}
                          </span>
                        </div>
                      </div>
                    ) : null}

                    {/* Render other files */}
                    {!isImageFile && !isVideoFile ? (
                      <div className="w-full aspect-square flex flex-col justify-center items-center text-center p-2 bg-muted/30">
                        <FileIcon className="text-5xl text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground truncate">
                          {file.filename
                            ? truncateFilename(file.filename, 15)
                            : truncateFilename(file.url.split("/").pop()!, 15)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                );
              })}
          </>
        )}
      </div>
      {renderLoadMoreButton()}
    </div>
  );
}
