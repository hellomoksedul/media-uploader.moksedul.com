import { Button } from "@/components/common/Button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Ban } from "lucide-react";
import React from "react";

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
}

interface AdjustmentControlsProps {
  adjustments: Adjustments;
  setAdjustments: React.Dispatch<React.SetStateAction<Adjustments>>;
}

export function AdjustmentControls({
  adjustments,
  setAdjustments,
}: AdjustmentControlsProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Brightness</Label>
          <span className="text-xs text-muted-foreground">
            {adjustments.brightness}%
          </span>
        </div>
        <Slider
          value={[adjustments.brightness]}
          min={50}
          max={150}
          step={1}
          onValueChange={(vals) =>
            setAdjustments((prev) => ({
              ...prev,
              brightness: vals[0],
            }))
          }
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Contrast</Label>
          <span className="text-xs text-muted-foreground">
            {adjustments.contrast}%
          </span>
        </div>
        <Slider
          value={[adjustments.contrast]}
          min={50}
          max={150}
          step={1}
          onValueChange={(vals) =>
            setAdjustments((prev) => ({
              ...prev,
              contrast: vals[0],
            }))
          }
        />
      </div>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Saturation</Label>
          <span className="text-xs text-muted-foreground">
            {adjustments.saturation}%
          </span>
        </div>
        <Slider
          value={[adjustments.saturation]}
          min={0}
          max={200}
          step={1}
          onValueChange={(vals) =>
            setAdjustments((prev) => ({
              ...prev,
              saturation: vals[0],
            }))
          }
        />
      </div>

      <Button
        variant="ghost"
        className="w-full mt-4 text-red-500 hover:text-red-600 hover:bg-transparent shadow-none"
        onClick={() =>
          setAdjustments({
            brightness: 100,
            contrast: 100,
            saturation: 100,
          })
        }
        leftIcon={<Ban className="w-4 h-4" />}
      >
        Reset Adjustments
      </Button>
    </div>
  );
}
