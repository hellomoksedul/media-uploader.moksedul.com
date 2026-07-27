import { CloudUpload, Loader2 } from "lucide-react";

interface MediaDropzoneProps {
  isUploading: boolean;
  isDragging: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: () => void;
}

export function MediaDropzone({
  isUploading,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick
}: MediaDropzoneProps) {
  return (
    <div 
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={onClick}
      className={`border-2 border-dashed transition-colors rounded-2xl p-16 flex flex-col items-center justify-center text-center cursor-pointer
        ${isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card/40 hover:bg-muted/40'}
        ${isUploading ? 'opacity-50 pointer-events-none' : ''}
      `}
    >
      <div className={`mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`}>
        {isUploading ? <Loader2 size={36} strokeWidth={1.5} className="animate-spin" /> : <CloudUpload size={36} strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">
        {isUploading ? "Uploading files..." : "Upload Media Files"}
      </h3>
      <p className="text-[13px] text-muted-foreground">
        {isUploading ? "Please wait while we process your upload" : "Drag and drop files here, or click to browse"}
      </p>
      {!isUploading && (
        <p className="text-[12px] text-muted-foreground/80 mt-1">
          Images, videos, and PDFs &middot; up to 10 MB per file
        </p>
      )}
    </div>
  );
}
