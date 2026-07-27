"use client";

import { Button } from "@/components/common/Button";
import { Ban, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Cropper, CropperRef, ImageRestriction } from "react-advanced-cropper";
// NOTE: cropper stylesheet is bundled via src/index.css (styles.css), not here.
import { toast } from "sonner";
import { useMediaContext } from "../../MediaProvider";
import { AdjustmentControls, Adjustments } from "./AdjustmentControls";
import { CropControls } from "./CropControls";
import { FilterControls } from "./FilterControls";
import { Sidebar } from "./Sidebar";
import { ToolbarControls } from "./ToolbarControls";

interface ImageEditorProps {
  imageSrc: string;
  onClose: () => void;
  onApply: (url: string) => void;
  aspectRatio?: number;
  imageFormat?: string;
  outputWidth?: number;
}

export default function ImageEditor({
  imageSrc,
  onClose,
  onApply,
  aspectRatio: initialAspectRatio,
  outputWidth,
}: ImageEditorProps) {
  const { uploadMedia, isLimitError, onLimitExceeded, config } =
    useMediaContext();
  // State
  const [activeTool, setActiveTool] = useState<"crop" | "filter" | "adjust">(
    "crop",
  );

  const [activeAspectRatio, setActiveAspectRatio] = useState<
    number | undefined
  >(initialAspectRatio);
  const [isAspectLocked, setIsAspectLocked] = useState<boolean>(
    initialAspectRatio !== undefined,
  );
  const [customRatio, setCustomRatio] = useState({ w: "", h: "" });
  const [cropSize, setCropSize] = useState<{ w: number; h: number } | null>(
    null,
  );
  const [inputCropSize, setInputCropSize] = useState({ w: "", h: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const cropperRef = useRef<CropperRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Crop State
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);

  const [localImageSrc, setLocalImageSrc] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadImg = async () => {
      if (!imageSrc) return;
      if (imageSrc.startsWith("blob:") || imageSrc.startsWith("data:")) {
        setLocalImageSrc(imageSrc);
        return;
      }

      setIsImageLoading(true);
      setImageError(false);
      try {
        let proxyUrl = config?.resolveProxyUrl
          ? config.resolveProxyUrl(imageSrc)
          : imageSrc;

        const res = await fetch(proxyUrl, {
          cache: "no-store",
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
          setLocalImageSrc(fallbackUrl);
        }
      }
    };
    loadImg();
    return () => {
      active = false;
    };
  }, [imageSrc]);

  const handleReady = () => {
    setIsImageLoading(false);
    if (cropperRef.current) {
      const image = cropperRef.current.getImage();
      if (image) {
        if (inputCropSize.w === "" && inputCropSize.h === "") {
          const state = cropperRef.current.getState();
          const cropWidth = state?.coordinates?.width || image.width;
          const cropHeight = state?.coordinates?.height || image.height;
          let targetWidth = outputWidth || Math.round(cropWidth);
          if (targetWidth > 1920) {
            targetWidth = 1920;
          }
          const targetHeight = activeAspectRatio
            ? Math.round(targetWidth / activeAspectRatio)
            : Math.round(targetWidth * (cropHeight / cropWidth));
          setInputCropSize({
            w: targetWidth.toString(),
            h: targetHeight.toString(),
          });

          if (!isAspectLocked && activeAspectRatio === undefined) {
            setIsAspectLocked(true);
            setActiveAspectRatio(image.width / image.height);
          }
        }
      }
    }
  };

  // Filter & Adjust State
  const [filter, setFilter] = useState("none");
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setHeaderTarget(document.getElementById("image-editor-header-center"));
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const [adjustments, setAdjustments] = useState<Adjustments>({
    brightness: 100,
    contrast: 100,
    saturation: 100,
  });

  const getFilterString = useCallback(() => {
    let filterString = "";
    if (filter !== "none") filterString += `${filter} `;
    filterString += `brightness(${adjustments.brightness}%) `;
    filterString += `contrast(${adjustments.contrast}%) `;
    filterString += `saturate(${adjustments.saturation}%)`;
    return filterString.trim();
  }, [filter, adjustments]);

  const handleZoom = (factor: number) => {
    if (!cropperRef.current) return;
    let finalFactor = factor;
    if (factor < 1) {
      const state = cropperRef.current.getState();
      if (
        state &&
        state.coordinates &&
        state.imageSize.width > 0 &&
        state.imageSize.height > 0
      ) {
        const cx = state.coordinates.left + state.coordinates.width / 2;
        const cy = state.coordinates.top + state.coordinates.height / 2;
        const maxW = Math.min(cx * 2, (state.imageSize.width - cx) * 2);
        const maxH = Math.min(cy * 2, (state.imageSize.height - cy) * 2);
        const minFactorW = state.coordinates.width / maxW;
        const minFactorH = state.coordinates.height / maxH;
        const minFactor = Math.max(minFactorW, minFactorH);
        finalFactor = Math.max(factor, minFactor * 1.005);
        if (finalFactor >= 0.995) {
          return;
        }
      }
    }
    cropperRef.current.zoomImage(finalFactor);
  };

  const handleRotate = (angle: number) => {
    const newRotation = rotation + angle;
    setRotation(newRotation);
    cropperRef.current?.rotateImage(angle);
  };

  const handleFlip = (dir: "h" | "v") => {
    if (dir === "h") {
      setFlipH(!flipH);
      cropperRef.current?.flipImage(true, false);
    } else {
      setFlipV(!flipV);
      cropperRef.current?.flipImage(false, true);
    }
  };

  const handleResetCrop = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    cropperRef.current?.reset();
  };

  const handleFit = () => {
    handleZoom(0.001);
  };

  // Apply filters to preview
  useEffect(() => {
    if (containerRef.current) {
      const images = containerRef.current.querySelectorAll("img");
      const filterString = getFilterString();
      images.forEach((img) => {
        img.style.filter = filterString;
      });
    }
  }, [getFilterString, rotation, flipH, flipV]);

  const handleApply = async () => {
    setIsLoading(true);
    if (!cropperRef.current) return;

    try {
      const sourceCanvas = cropperRef.current.getCanvas();
      if (!sourceCanvas) throw new Error("Could not get cropped canvas");

      const requestedW = parseInt(inputCropSize.w) || sourceCanvas.width;
      const requestedH = parseInt(inputCropSize.h) || sourceCanvas.height;
      const sourceRatio = sourceCanvas.width / sourceCanvas.height;
      const requestedRatio = requestedW / requestedH;
      const targetW = requestedW;
      const targetH =
        Math.abs(sourceRatio - requestedRatio) > 0.001
          ? Math.round(targetW / sourceRatio)
          : requestedH;

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Could not get canvas context");

      ctx.filter = getFilterString();
      ctx.drawImage(
        sourceCanvas,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
        0,
        0,
        targetW,
        targetH,
      );

      // Architecture: always export as WebP (quality 70-80%).
      // The backend (Sharp/BullMQ) will generate AVIF + other variants from this.
      const mimeType = "image/webp";
      canvas.toBlob(
        async (blob) => {
          try {
            if (!blob) throw new Error("Failed to create blob");
            const file = new File([blob], `edited-image.webp`, {
              type: "image/webp",
            });
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
            console.error("Save error:", err);
            // Storage-quota errors already surface via the global LimitReachedDialog.
            if (isLimitError && err.message && isLimitError(err.message)) {
              onLimitExceeded?.();
            } else {
              toast.error(err.message || "Failed to save image");
            }
            setIsLoading(false);
          }
        },
        mimeType,
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
    <div className="flex flex-col md:flex-row h-full w-full bg-background overflow-hidden">
      <div className="w-full md:w-92.5 shrink-0 border-r z-10 flex flex-col h-full bg-background dark:bg-[#111111]">
        <div className="flex-1 overflow-hidden min-h-0">
          <Sidebar activeTool={activeTool} setActiveTool={setActiveTool}>
            {activeTool === "crop" && (
              <CropControls
                initialAspectRatio={initialAspectRatio}
                activeAspectRatio={activeAspectRatio}
                setActiveAspectRatio={setActiveAspectRatio}
                isAspectLocked={isAspectLocked}
                setIsAspectLocked={setIsAspectLocked}
                customRatio={customRatio}
                setCustomRatio={setCustomRatio}
                inputCropSize={inputCropSize}
                setInputCropSize={setInputCropSize}
                cropSize={cropSize}
                handleResetCrop={handleResetCrop}
              />
            )}

            {activeTool === "filter" && localImageSrc && (
              <FilterControls
                imageSrc={localImageSrc}
                filter={filter}
                setFilter={setFilter}
              />
            )}

            {activeTool === "adjust" && (
              <AdjustmentControls
                adjustments={adjustments}
                setAdjustments={setAdjustments}
              />
            )}
          </Sidebar>
        </div>
        <div className="p-6 bg-muted/50 dark:bg-[#111111] border-t dark:border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleApply}
              isLoading={isLoading}
              loadingText="Saving..."
            >
              Save
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-muted dark:bg-[#18181b] flex items-center justify-center min-h-0 overflow-hidden">
        <ToolbarControls
          headerTarget={headerTarget}
          onZoom={handleZoom}
          onRotate={handleRotate}
          onFlip={handleFlip}
          onFit={handleFit}
          flipH={flipH}
          flipV={flipV}
        />

        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#a1a1aa 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        ></div>

        {isImageLoading && !imageError && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-muted dark:bg-[#18181b]">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {imageError && (
          <div className="absolute inset-0 z-30 flex flex-col gap-3 items-center justify-center bg-muted dark:bg-[#18181b] text-muted-foreground">
            <Ban className="w-10 h-10 text-red-500/80" />
            <p className="text-sm font-medium">Failed to load image.</p>
          </div>
        )}

        <style>{`
          .advanced-cropper,
          .advanced-cropper__background,
          .vue-advanced-cropper__background,
          .advanced-cropper__image-wrapper,
          .vue-advanced-cropper__image-wrapper,
          .advanced-cropper__boundaries,
          .vue-advanced-cropper__boundaries {
            background: transparent !important;
            background-color: transparent !important;
          }
        `}</style>

        <div
          ref={containerRef}
          className="relative w-full h-full flex items-center justify-center z-10"
          onWheelCapture={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopImmediatePropagation();
            if (e.deltaY < 0) {
              handleZoom(1.1);
            } else if (e.deltaY > 0) {
              handleZoom(0.9);
            }
          }}
        >
          {localImageSrc && (
            <Cropper
              src={localImageSrc}
              crossOrigin="anonymous"
              imageRestriction={ImageRestriction.stencil}
              className={`w-full h-full transition-opacity duration-300 ${
                isImageLoading ? "opacity-0" : "opacity-100"
              }`}
              stencilProps={{
                aspectRatio: isAspectLocked ? activeAspectRatio : undefined,
                grid: true,
              }}
              ref={cropperRef}
              onReady={handleReady}
              onChange={(cropper) => {
                const state = cropper.getState();
                if (state && state.coordinates) {
                  const w = Math.round(state.coordinates.width);
                  const h = Math.round(state.coordinates.height);
                  setCropSize({ w, h });
                }
              }}
              onError={() => {
                setIsImageLoading(false);
                setImageError(true);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
