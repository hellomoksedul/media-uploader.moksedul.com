import { Button } from "@/components/common/Button";
import {
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minus,
  Plus,
  RotateCcw,
  RotateCw,
} from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";

interface ToolbarControlsProps {
  headerTarget: HTMLElement | null;
  onZoom: (factor: number) => void;
  onRotate: (angle: number) => void;
  onFlip: (dir: "h" | "v") => void;
  onFit: () => void;
  flipH: boolean;
  flipV: boolean;
}

export function ToolbarControls({
  headerTarget,
  onZoom,
  onRotate,
  onFlip,
  onFit,
  flipH,
  flipV,
}: ToolbarControlsProps) {
  if (!headerTarget) return null;

  return createPortal(
    <div className="flex border border-border/50 rounded-md items-center gap-1 px-2 py-1">
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onZoom(0.8)}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onZoom(1.2)}
        title="Zoom In"
      >
        <Plus className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1.5" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRotate(-90)}
        title="Rotate Left"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => onRotate(90)}
        title="Rotate Right"
      >
        <RotateCw className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1.5" />

      <Button
        variant={flipH ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onFlip("h")}
        title="Flip Horizontal"
      >
        <FlipHorizontal className="h-4 w-4" />
      </Button>
      <Button
        variant={flipV ? "secondary" : "ghost"}
        size="icon-sm"
        onClick={() => onFlip("v")}
        title="Flip Vertical"
      >
        <FlipVertical className="h-4 w-4" />
      </Button>

      <div className="w-px h-4 bg-zinc-300 dark:bg-zinc-600 mx-1.5" />

      <Button
        variant="ghost"
        size="icon-sm"
        onClick={onFit}
        title="Fit Image"
      >
        <Maximize className="h-4 w-4" />
      </Button>
    </div>,
    headerTarget
  );
}
