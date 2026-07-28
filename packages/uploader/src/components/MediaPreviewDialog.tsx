"use client";

import { Button } from "./common/Button";
import { ConfirmDialog } from "./common/ConfirmDialog";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import type { ApiMedia } from "./MediaProvider";
import { useMediaContext } from "./MediaProvider";
import { formatSize, getExtension } from "./media-helpers";
import { formatShortDateWithYear } from "../lib/format/date";
import SmartImage from "./SmartImage";
import { MediaEditImageDialog } from "./MediaEditImageDialog";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  ExternalLink,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const IMAGE_EXTS = ["JPG", "JPEG", "PNG", "WEBP", "GIF", "AVIF"];
const VIDEO_EXTS = ["MP4", "WEBM", "MOV"];
const AUDIO_EXTS = ["MP3", "WAV", "OGG"];

export interface MediaPreviewDialogProps {
  /** The item being previewed. `null` closes the dialog. */
  previewItem: ApiMedia | null;
  setPreviewItem: (item: ApiMedia | null) => void;
  /**
   * Items to navigate between with the prev/next arrows. Defaults to the
   * provider's current list.
   */
  items?: ApiMedia[];
  /** Called after a successful delete or edit so the caller can refresh. */
  onRefresh?: () => void;
  /**
   * Override delete handling. When provided it's called with the id instead of
   * the built-in confirm + provider delete flow.
   */
  onDelete?: (id: string) => void;
}

export function MediaPreviewDialog({
  previewItem,
  setPreviewItem,
  items,
  onRefresh,
  onDelete,
}: MediaPreviewDialogProps) {
  const { mediaFiles, updateMedia, deleteMedia, config } = useMediaContext();
  const list = items ?? mediaFiles;

  const [isCopied, setIsCopied] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [prevId, setPrevId] = useState(previewItem?.id);

  const getBaseName = (name: string) => {
    const lastDot = name.lastIndexOf(".");
    return lastDot !== -1 ? name.substring(0, lastDot) : name;
  };

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(
    previewItem ? getBaseName(previewItem.filename) : "",
  );
  const [isSavingName, setIsSavingName] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset editor / rename state when the previewed item changes.
  if (previewItem?.id !== prevId) {
    setPrevId(previewItem?.id);
    setIsEditorOpen(false);
    setIsEditingName(false);
    setConfirmDeleteOpen(false);
    if (previewItem) setEditName(getBaseName(previewItem.filename));
  }

  const resolveUrl = (url: string) =>
    config?.resolveMediaUrl ? config.resolveMediaUrl(url) : url;

  const handleSaveName = async () => {
    if (!previewItem) return;
    const nextName = editName.trim();
    if (!nextName || nextName === getBaseName(previewItem.filename)) {
      setIsEditingName(false);
      return;
    }
    setIsSavingName(true);
    const res = await updateMedia(previewItem.id, { filename: nextName });
    if (res.success) {
      setPreviewItem(res.data ?? { ...previewItem, filename: nextName });
      setIsEditingName(false);
      toast.success("File name updated.");
      onRefresh?.();
    } else {
      toast.error(res.error || "Failed to update name.");
    }
    setIsSavingName(false);
  };

  const requestDelete = () => {
    if (!previewItem) return;
    if (onDelete) {
      onDelete(previewItem.id);
      return;
    }
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!previewItem) return;
    setIsDeleting(true);
    const res = await deleteMedia(previewItem.id);
    setIsDeleting(false);
    setConfirmDeleteOpen(false);
    if (res.success) {
      toast.success("File deleted.");
      setPreviewItem(null);
      onRefresh?.();
    } else {
      toast.error(res.error || "Failed to delete file.");
    }
  };

  if (!previewItem) return null;

  const filename = previewItem.filename;
  const ext = getExtension(previewItem.url || filename);
  const size = formatSize(Number(previewItem.sizeBytes));
  const url = resolveUrl(previewItem.url);
  const currentIndex = list.findIndex((i) => i.id === previewItem.id);
  const isImage = IMAGE_EXTS.includes(ext);

  return (
    <>
      <Dialog
        open={!!previewItem}
        onOpenChange={(open) => !open && setPreviewItem(null)}
      >
        <DialogContent
          showCloseButton={false}
          aria-describedby={undefined}
          className="media-uploader-scope p-0 gap-0 bg-card rounded-xl"
          style={{
            width: "calc(100% - 2rem)",
            maxWidth: "1200px",
            height: "90vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <DialogTitle className="sr-only">Media Preview</DialogTitle>

          {isEditorOpen && isImage ? (
            <MediaEditImageDialog
              isOpen={isEditorOpen}
              onClose={() => setIsEditorOpen(false)}
              imageUrl={url}
              fileName={filename}
              fileSize={size}
              onSaveComplete={() => {
                setIsEditorOpen(false);
                setPreviewItem(null);
                onRefresh?.();
              }}
            />
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0 gap-4">
                <div className="space-y-1 min-w-0 flex-1">
                  <h3 className="font-medium text-base text-foreground leading-tight truncate">
                    {filename}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    {ext} • {size}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {isImage && (
                    <Button variant="ghost" size="icon" onClick={() => setIsEditorOpen(true)}>
                      <Pencil size={16} />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" asChild>
                    <a href={url} target="_blank" rel="noreferrer">
                      <ExternalLink size={16} />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    onClick={requestDelete}
                  >
                    <Trash2 size={16} />
                  </Button>
                  <div className="w-px h-4 bg-muted dark:bg-zinc-700 mx-1" />
                  <Button variant="ghost" size="icon" onClick={() => setPreviewItem(null)}>
                    <X size={20} />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 overflow-y-auto md:overflow-hidden flex-col md:flex-row">
                {/* Main preview */}
                <div className="w-full md:flex-1 h-[50vh] min-h-[300px] md:h-auto md:min-h-0 bg-muted dark:bg-zinc-950 relative flex items-center justify-center p-4 md:p-8 shrink-0 md:shrink border-b md:border-b-0 md:border-r border-border">
                  <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, currentColor 1px, transparent 1px)",
                      backgroundSize: "24px 24px",
                    }}
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 dark:bg-muted/80 backdrop-blur-sm shadow-sm opacity-40 hover:opacity-100 transition-opacity disabled:opacity-0 z-20"
                    disabled={currentIndex <= 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentIndex > 0) setPreviewItem(list[currentIndex - 1]);
                    }}
                  >
                    <ChevronLeft size={24} />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 dark:bg-muted/80 backdrop-blur-sm shadow-sm opacity-40 hover:opacity-100 transition-opacity disabled:opacity-0 z-20"
                    disabled={currentIndex >= list.length - 1}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (currentIndex < list.length - 1)
                        setPreviewItem(list[currentIndex + 1]);
                    }}
                  >
                    <ChevronRight size={24} />
                  </Button>

                  <div className="relative w-full max-w-4xl max-h-full flex items-center justify-center z-10">
                    {isImage ? (
                      <div className="relative w-full h-full max-h-[70vh] flex justify-center drop-shadow-xl">
                        <SmartImage
                          width={1920}
                          height={1080}
                          src={url}
                          alt={filename}
                          className="max-h-[70vh] w-auto max-w-full rounded-md"
                          objectFit="contain"
                        />
                      </div>
                    ) : VIDEO_EXTS.includes(ext) ? (
                      <video
                        controls
                        className="max-w-full max-h-[70vh] rounded-xl shadow-xl border border-border bg-black"
                      >
                        <source src={url} type={`video/${ext.toLowerCase()}`} />
                        Your browser does not support the video tag.
                      </video>
                    ) : AUDIO_EXTS.includes(ext) ? (
                      <div className="w-full max-w-md p-8 bg-background dark:bg-muted rounded-2xl shadow-xl border border-border flex flex-col items-center">
                        <h3 className="font-bold text-lg text-foreground mb-6 text-center break-all">
                          {filename}
                        </h3>
                        <audio controls className="w-full">
                          <source src={url} type={`audio/${ext.toLowerCase()}`} />
                        </audio>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-12 bg-background dark:bg-muted rounded-2xl shadow-xl border border-border">
                        <div className="w-24 h-24 bg-muted text-muted-foreground rounded-2xl flex items-center justify-center mb-6">
                          <ExternalLink size={48} strokeWidth={1.5} />
                        </div>
                        <h3 className="font-medium text-base text-foreground mb-2">
                          {ext} File
                        </h3>
                        <p className="text-xs text-muted-foreground text-center mb-8 max-w-sm">
                          This file format cannot be previewed directly in the browser.
                        </p>
                        <Button size="md" className="w-full" asChild>
                          <a href={url} target="_blank" rel="noreferrer" download>
                            <Download size={18} className="mr-2" />
                            Download File
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="w-full md:w-[320px] bg-card overflow-y-auto shrink-0 flex flex-col">
                  <div className="p-6 border-b border-border">
                    <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-4">
                      File Details
                    </h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          Name
                        </span>
                        {isEditingName ? (
                          <div className="flex items-center gap-1 w-full max-w-[200px] justify-end">
                            <input
                              autoFocus
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="flex-1 min-w-0 bg-background dark:bg-muted border border-border rounded-md px-2 py-1 text-sm text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") handleSaveName();
                                if (e.key === "Escape") {
                                  setIsEditingName(false);
                                  setEditName(getBaseName(filename));
                                }
                              }}
                            />
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={handleSaveName}
                              disabled={isSavingName}
                              className="text-green-600 hover:text-green-700 w-6 h-6 p-0 shrink-0"
                            >
                              <Check size={14} />
                            </Button>
                            <Button
                              size="icon-xs"
                              variant="ghost"
                              onClick={() => {
                                setIsEditingName(false);
                                setEditName(getBaseName(filename));
                              }}
                              disabled={isSavingName}
                              className="text-red-500 hover:text-red-600 w-6 h-6 p-0 shrink-0"
                            >
                              <X size={14} />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 overflow-hidden justify-end">
                            <span
                              className="text-sm font-medium text-foreground truncate"
                              title={filename}
                            >
                              {filename}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setIsEditingName(true);
                                setEditName(getBaseName(filename));
                              }}
                              className="text-muted-foreground shrink-0 p-0 h-auto w-auto ml-2"
                            >
                              <Pencil size={12} />
                            </Button>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          Type
                        </span>
                        <span className="text-xs font-bold bg-muted text-muted-foreground font-mono px-2 py-1 rounded-md">
                          {ext}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          Size
                        </span>
                        <span className="text-sm font-medium text-foreground shrink-0">
                          {size}
                        </span>
                      </div>
                      <div className="flex justify-between items-center gap-4">
                        <span className="text-sm font-medium text-muted-foreground shrink-0">
                          Uploaded
                        </span>
                        <span className="text-sm font-medium text-foreground shrink-0">
                          {formatShortDateWithYear(previewItem.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xs font-semibold text-indigo-500 uppercase tracking-wider mb-4">
                      Sharing
                    </h4>
                    <div className="space-y-4">
                      <div className="border border-border rounded-lg p-3">
                        <label className="text-xs text-muted-foreground font-medium block mb-1">
                          Public URL
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            readOnly
                            value={url}
                            className="flex-1 bg-transparent text-sm text-foreground outline-hidden truncate"
                          />
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              navigator.clipboard.writeText(url);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                            title="Copy URL"
                          >
                            {isCopied ? (
                              <Check size={16} className="text-green-500" />
                            ) : (
                              <Copy size={16} />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button variant="outline" className="w-full" asChild>
                        <a href={url} target="_blank" rel="noreferrer" download>
                          <Download size={16} className="mr-2" />
                          Download Original
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Media"
        description="This action cannot be undone. It will permanently delete the file."
        confirmText="Delete"
        variant="destructive"
        isLoading={isDeleting}
      />
    </>
  );
}

export default MediaPreviewDialog;
