import { Button } from "@/components/common/Button";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface VideoUploadProps {
  file?: File | null;
  url?: string;
  onVideoUpload: (videoUrl: string) => void;
  onBack: () => void;
  autoUpload?: boolean;
}

import { useMediaContext } from "../MediaProvider";

const VideoUpload: React.FC<VideoUploadProps> = ({
  file,
  url,
  onVideoUpload,
  onBack,
  autoUpload = true,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [hasStartedAutoUpload, setHasStartedAutoUpload] = useState(false);

  const { uploadMedia, isLimitError, onLimitExceeded } = useMediaContext();

  useEffect(() => {
    if (file) {
      const videoPreviewUrl = URL.createObjectURL(file);
      const timer = setTimeout(() => setPreviewUrl(videoPreviewUrl), 0);
      return () => {
        clearTimeout(timer);
        URL.revokeObjectURL(videoPreviewUrl);
      };
    } else if (url) {
      const timer = setTimeout(() => setPreviewUrl(url), 0);
      return () => clearTimeout(timer);
    }
  }, [file, url]);

  const handleUpload = useCallback(async () => {
    if (url) {
      onVideoUpload(url);
      return;
    }
    if (!file) {
      toast.error("No video file provided.");
      return;
    }

    try {
      setIsUploading(true);

      const res = await uploadMedia(file, "videos");

      if (!res.success) {
        throw new Error(res.error || "R2 video upload failed.");
      }
      if (!res.data) {
        throw new Error("R2 video upload failed: No data returned.");
      }

      const finalUrl = res.data.url;

      onVideoUpload(finalUrl);
      toast.success("Video uploaded successfully!");
    } catch (error: unknown) {
      console.error("Video upload error:", error);
      const message = error instanceof Error ? error.message : "";
      if (isLimitError && message && isLimitError(message)) {
        onLimitExceeded?.();
      } else {
        toast.error("Video Upload Failed", {
          description: message,
        });
      }
    } finally {
      setIsUploading(false);
    }
  }, [file, url, onVideoUpload, isLimitError, onLimitExceeded, uploadMedia]);

  // Auto-upload effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (autoUpload && file && !isUploading && !hasStartedAutoUpload) {
        setHasStartedAutoUpload(true);
        handleUpload();
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [autoUpload, file, isUploading, hasStartedAutoUpload, handleUpload]);

  return (
    <div className="video-upload h-full flex flex-col items-center justify-center p-6">
      {isUploading ? (
        <div className="flex flex-col items-center gap-4">
          <span className="h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
          <p className="text-lg font-medium animate-pulse">
            Uploading video... please wait
          </p>
          <p className="text-sm text-muted-foreground">{file?.name}</p>
        </div>
      ) : (
        <>
          {previewUrl && (!autoUpload || !!url) && (
            <div className="mt-4 h-full flex flex-col justify-center items-center w-full">
              <video
                controls
                src={previewUrl}
                className="max-h-[60vh] w-auto aspect-video overflow-hidden border border-border rounded-xl bg-black"
              />
            </div>
          )}

          {(!autoUpload || !!url) && (
            <div className="w-full flex justify-end pt-5 border-t border-border items-center gap-5 mt-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onBack}
                disabled={isUploading}
              >
                Back
              </Button>

              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {url ? "Confirm Selection" : "Upload Video"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VideoUpload;
