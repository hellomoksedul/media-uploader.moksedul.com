"use client";

import { Button } from "@/components/common/Button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import React from "react";

interface FormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel?: () => void;
  submitText?: React.ReactNode;
  cancelText?: React.ReactNode;
  loading?: boolean;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  submitButtonVariant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  submitButtonClassName?: string;
  iconContainerClassName?: string;
  customFooter?: React.ReactNode;
  topSlot?: React.ReactNode;
}

export function FormModal({
  open,
  onOpenChange,
  icon,
  title,
  description,
  onSubmit,
  onCancel,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  children,
  className,
  contentClassName,
  submitButtonVariant,
  submitButtonClassName,
  iconContainerClassName,
  customFooter,
  topSlot,
}: FormModalProps) {
  const handleCancel = () => {
    if (onCancel) onCancel();
    else onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-lg! p-4 md:p-6 lg:p-8 gap-4 md:gap-6 rounded-lg lg:rounded-[20px]! max-h-[95dvh]! overflow-y-auto",
          contentClassName,
        )}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
      >
        {topSlot && <div>{topSlot}</div>}
        <div className="flex items-center gap-3 md:gap-4 pr-4 md:pr-6">
          {icon && (
            <div
              className={cn(
                "flex size-10 md:size-12 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500",
                iconContainerClassName,
              )}
            >
              {icon}
            </div>
          )}
          <div className="flex flex-col">
            <DialogTitle className="text-[18px] font-semibold text-foreground">
              {title}
            </DialogTitle>
            {description && (
              <p className="text-[12px] text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className={cn("flex flex-col gap-5 mt-1", className)}
        >
          {children}

          {customFooter ? (
            customFooter
          ) : (
            <DialogFooter className="sm:justify-end gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                variant={submitButtonVariant}
                className={submitButtonClassName}
                isLoading={loading}
              >
                {submitText}
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
