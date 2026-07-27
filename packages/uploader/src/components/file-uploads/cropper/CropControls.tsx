import { Button } from "@/components/common/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Ban, Lock, Unlock } from "lucide-react";
import React from "react";

interface CropControlsProps {
  initialAspectRatio?: number;
  activeAspectRatio: number | undefined;
  setActiveAspectRatio: (val: number | undefined) => void;
  isAspectLocked: boolean;
  setIsAspectLocked: (val: boolean) => void;
  customRatio: { w: string; h: string };
  setCustomRatio: React.Dispatch<React.SetStateAction<{ w: string; h: string }>>;
  inputCropSize: { w: string; h: string };
  setInputCropSize: React.Dispatch<React.SetStateAction<{ w: string; h: string }>>;
  cropSize: { w: number; h: number } | null;
  handleResetCrop: () => void;
}

export function CropControls({
  initialAspectRatio,
  activeAspectRatio,
  setActiveAspectRatio,
  isAspectLocked,
  setIsAspectLocked,
  customRatio,
  setCustomRatio,
  inputCropSize,
  setInputCropSize,
  cropSize,
  handleResetCrop,
}: CropControlsProps) {
  return (
    <div className="space-y-8">
      {/* Aspect Ratio Details */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Aspect Ratio
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="text-muted-foreground hover:text-muted-foreground transition-colors disabled:opacity-50"
                  onClick={() => {
                    setIsAspectLocked(!isAspectLocked);
                    if (!isAspectLocked && activeAspectRatio === undefined) {
                      let newRatio: number | undefined = undefined;
                      const w = parseFloat(inputCropSize.w);
                      const h = parseFloat(inputCropSize.h);
                      if (!isNaN(w) && !isNaN(h) && h > 0) {
                        newRatio = w / h;
                      } else if (cropSize) {
                        newRatio = cropSize.w / cropSize.h;
                      }
                      if (newRatio) {
                        setActiveAspectRatio(newRatio);
                        setIsAspectLocked(true);
                        const saveW = parseFloat(inputCropSize.w);
                        if (!isNaN(saveW)) {
                          let finalW = saveW;
                          if (finalW > 1920) finalW = 1920;
                          setInputCropSize((prev) => ({
                            ...prev,
                            w: finalW.toString(),
                            h: Math.round(finalW / newRatio!).toString(),
                          }));
                        }
                      }
                    }
                  }}
                  disabled={initialAspectRatio !== undefined}
                >
                  {isAspectLocked ? (
                    <Lock className="w-3.5 h-3.5" />
                  ) : (
                    <Unlock className="w-3.5 h-3.5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>{isAspectLocked ? "Unlock aspect ratio" : "Lock aspect ratio"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center gap-2.5 mb-4">
          <Input
            className="h-10 text-center text-sm rounded-md border-border dark:border-border text-foreground bg-background dark:bg-[#18181b]"
            placeholder="W"
            value={customRatio.w}
            disabled={initialAspectRatio !== undefined}
            onChange={(e) => {
              setCustomRatio((prev) => ({ ...prev, w: e.target.value }));
              const w = parseFloat(e.target.value);
              const h = parseFloat(customRatio.h);
              if (!isNaN(w) && !isNaN(h) && h > 0) {
                const newRatio = w / h;
                setActiveAspectRatio(newRatio);
                setIsAspectLocked(true);
                const saveW = parseFloat(inputCropSize.w);
                if (!isNaN(saveW)) {
                  let finalW = saveW;
                  if (finalW > 1920) finalW = 1920;
                  setInputCropSize((prev) => ({
                    ...prev,
                    w: finalW.toString(),
                    h: Math.round(finalW / newRatio).toString(),
                  }));
                }
              }
            }}
          />
          <span className="text-muted-foreground font-bold">:</span>
          <Input
            className="h-10 text-center text-sm rounded-md border-border dark:border-border text-foreground bg-background dark:bg-[#18181b]"
            placeholder="H"
            value={customRatio.h}
            disabled={initialAspectRatio !== undefined}
            onChange={(e) => {
              setCustomRatio((prev) => ({ ...prev, h: e.target.value }));
              const w = parseFloat(customRatio.w);
              const h = parseFloat(e.target.value);
              if (!isNaN(w) && !isNaN(h) && h > 0) {
                const newRatio = w / h;
                setActiveAspectRatio(newRatio);
                setIsAspectLocked(true);
                const saveW = parseFloat(inputCropSize.w);
                if (!isNaN(saveW)) {
                  let finalW = saveW;
                  if (finalW > 1920) finalW = 1920;
                  setInputCropSize((prev) => ({
                    ...prev,
                    w: finalW.toString(),
                    h: Math.round(finalW / newRatio).toString(),
                  }));
                }
              }
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Free", value: undefined },
            { label: "1:1", value: 1 },
            { label: "4:3", value: 4 / 3 },
            { label: "16:9", value: 16 / 9 },
          ].map((ar) => (
            <Button
              key={ar.label}
              variant={activeAspectRatio === ar.value ? "default" : "outline"}
              size="sm"
              disabled={initialAspectRatio !== undefined}
              onClick={() => {
                setActiveAspectRatio(ar.value);
                setIsAspectLocked(ar.value !== undefined);
                if (ar.value !== undefined) {
                  setCustomRatio({ w: "", h: "" });
                  const saveW = parseFloat(inputCropSize.w);
                  if (!isNaN(saveW)) {
                    let finalW = saveW;
                    if (finalW > 1920) finalW = 1920;
                    setInputCropSize((prev) => ({
                      ...prev,
                      w: finalW.toString(),
                      h: Math.round(finalW / ar.value!).toString(),
                    }));
                  }
                }
              }}
            >
              {ar.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Output Size Details */}
      <div>
        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 block">
          Save Size (Output)
        </Label>
        <div className="flex items-center gap-2.5">
          <Input
            className="h-10 text-center text-sm rounded-md border-border dark:border-border text-foreground bg-background dark:bg-[#18181b]"
            placeholder="Width"
            value={inputCropSize.w}
            onChange={(e) => {
              let newW = e.target.value;
              let w = parseFloat(newW);
              if (w > 1920) {
                w = 1920;
                newW = "1920";
              }
              if (isAspectLocked && activeAspectRatio && !isNaN(w)) {
                const newH = Math.round(w / activeAspectRatio).toString();
                setInputCropSize({ w: newW, h: newH });
              } else {
                setInputCropSize((prev) => ({ ...prev, w: newW }));
              }
            }}
          />
          <span className="text-muted-foreground font-bold">×</span>
          <Input
            className="h-10 text-center text-sm rounded-md border-border dark:border-border text-foreground bg-background dark:bg-[#18181b]"
            placeholder="Height"
            value={inputCropSize.h}
            onChange={(e) => {
              let newH = e.target.value;
              let h = parseFloat(newH);
              if (isAspectLocked && activeAspectRatio && !isNaN(h)) {
                let newWNum = Math.round(h * activeAspectRatio);
                if (newWNum > 1920) {
                  newWNum = 1920;
                  h = newWNum / activeAspectRatio;
                  newH = Math.round(h).toString();
                }
                const newW = newWNum.toString();
                setInputCropSize({ w: newW, h: newH });
              } else {
                setInputCropSize((prev) => ({ ...prev, h: newH }));
              }
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 leading-tight">
          Final saved image will be scaled to these exact dimensions.
        </p>
      </div>

      <div className="pt-6 border-t border-border dark:border-border flex justify-center">
        <Button
          variant="ghost"
          className="text-red-500 hover:text-red-600 hover:bg-transparent shadow-none"
          onClick={handleResetCrop}
          leftIcon={<Ban className="w-4 h-4" />}
        >
          Reset Changes
        </Button>
      </div>
    </div>
  );
}
