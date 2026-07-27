import { Button } from "@/components/common/Button";
import { useMediaContext } from "../../MediaProvider";
import React, { useRef } from "react";
import { Cropper, CropperRef } from "react-mobile-cropper";
// NOTE: cropper stylesheet is bundled via src/index.css (styles.css), not here.
import { toast } from "sonner";

interface MobileImageEditorProps {
  imageSrc: string;
  onClose: () => void;
  onApply: (blob: string) => void;
  aspectRatio?: number;
  imageFormat?: string;
  outputWidth?: number;
}

const MobileImageEditor: React.FC<MobileImageEditorProps> = ({
  imageSrc,
  onClose,
  onApply,
  aspectRatio,
  outputWidth,
}) => {
  const { uploadMedia, isLimitError, onLimitExceeded, config } = useMediaContext();
  const cropperRef = useRef<CropperRef>(null);
  const [localImageSrc, setLocalImageSrc] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    let active = true;
    const loadImg = async () => {
      if (!imageSrc) return;
      if (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:")) {
        setLocalImageSrc(imageSrc);
        return;
      }

      try {
        let proxyUrl = config?.resolveProxyUrl
          ? config.resolveProxyUrl(imageSrc)
          : imageSrc;

        const res = await fetch(proxyUrl, {
          cache: "no-store"
        });
        if (!res.ok) throw new Error("Failed to fetch");
        const blob = await res.blob();
        if (active) {
          setLocalImageSrc(URL.createObjectURL(blob));
        }
      } catch {
        if (active) {
          let fallbackUrl = config?.resolveProxyUrl
            ? config.resolveProxyUrl(imageSrc)
            : imageSrc;
          // Fallback to raw URL without logging to console to avoid Next.js error overlay
          setLocalImageSrc(fallbackUrl);
        }
      }
    };
    loadImg();
    return () => {
      active = false;
    };
  }, [imageSrc]);

  const onCropHelper = async () => {
    if (isLoading) return;
    setIsLoading(true);
    const cropper = cropperRef.current;
    if (!cropper) return;

    try {
      const canvas = cropper.getCanvas();
      if (!canvas) throw new Error("Could not get cropped canvas");

      const outputCanvas = document.createElement("canvas");
      let targetWidth = outputWidth || canvas.width;
      if (targetWidth > 1920) targetWidth = 1920;
      const targetHeight = Math.round(targetWidth * (canvas.height / canvas.width));
      outputCanvas.width = targetWidth;
      outputCanvas.height = targetHeight;
      const outputContext = outputCanvas.getContext("2d");
      if (!outputContext) throw new Error("Could not create output canvas");
      outputContext.imageSmoothingEnabled = true;
      outputContext.imageSmoothingQuality = "high";
      outputContext.drawImage(canvas, 0, 0, targetWidth, targetHeight);

      outputCanvas.toBlob(
        async (blob) => {
          try {
            if (!blob) throw new Error("Failed to create blob");

            const file = new File([blob], `edited-image.webp`, { type: "image/webp" });
            const uploadResponse = await uploadMedia(file, "images");

            if (!uploadResponse.success) {
              throw new Error(uploadResponse.error || "Upload failed");
            }

            const data = uploadResponse.data;
            if (!data || !data.url) {
              throw new Error("Invalid response from server");
            }

            const finalUrl = data.url;

            toast.success("Image saved successfully!");
            setTimeout(() => onApply(finalUrl), 100);
          } catch (error) {
            const err = error as any;
            console.error(err);
            if (isLimitError && err.message && isLimitError(err.message)) {
              onLimitExceeded?.();
            } else {
              toast.error(err.message || "Failed to save image");
            }
            setIsLoading(false);
          }
        },
        "image/webp",
        0.75, // Architecture: WebP quality 70-80%
      );
    } catch (error) {
      const err = error as any;
      console.error(err);
      if (isLimitError && err.message && isLimitError(err.message)) {
        onLimitExceeded?.();
      } else {
        toast.error(err.message || "Failed to save image");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-black">
      {/* Cropper */}
      <div className="flex-1 w-full relative bg-black min-h-0">
        {localImageSrc && (
          <Cropper
            ref={cropperRef}
            src={localImageSrc}
            className="cropper h-full w-full"
            style={{ height: "100%", width: "100%" }}
            stencilProps={{
              aspectRatio: aspectRatio,
            }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 bg-black shrink-0">
        <div className="flex gap-3">
          <Button
            variant="ghost"
            className="flex-1 text-white hover:text-white hover:bg-white/10"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={onCropHelper}
            isLoading={isLoading}
            loadingText="Saving..."
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MobileImageEditor;
