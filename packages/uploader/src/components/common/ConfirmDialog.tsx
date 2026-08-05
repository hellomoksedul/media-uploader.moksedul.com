import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
  variant = "default",
}: ConfirmDialogProps) {
  const isDestructive = variant === "destructive";

  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => !open && !isLoading && onClose()}
    >
      <AlertDialogContent className="sm:max-w-[400px] p-0 overflow-hidden gap-0 border-border dark:border-border shadow-xl dark:shadow-2xl dark:shadow-black/50">
        <div className="p-6 pt-8 flex flex-col items-center text-center">
          <div
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center mb-5 ring-8",
              isDestructive
                ? "bg-red-100 text-red-600 ring-red-50 dark:bg-red-500/20 dark:text-red-500 dark:ring-red-500/10"
                : "bg-primary/10 text-primary ring-primary/5 dark:bg-primary/20 dark:ring-primary/10",
            )}
          >
            {isDestructive ? (
              <Trash2 size={24} strokeWidth={2} />
            ) : (
              <AlertCircle size={24} strokeWidth={2} />
            )}
          </div>

          <div className="space-y-4 mb-2 w-full flex flex-col items-center">
            <AlertDialogTitle className="text-xl font-semibold tracking-tight text-foreground text-center m-0">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm mt-2 text-muted-foreground text-center leading-relaxed max-w-xs">
              {description}
            </AlertDialogDescription>
          </div>
        </div>

        <div className="px-6 pb-6 flex flex-row gap-3 justify-center w-full">
          <AlertDialogCancel
            disabled={isLoading}
            onClick={onClose}
            className="m-0 h-9 px-6 bg-background dark:bg-muted hover:bg-muted dark:hover:bg-muted border-border dark:border-border"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            className={cn(
              "m-0 h-9 px-6 shadow-sm",
              isDestructive
                ? "bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 focus:ring-red-500"
                : "bg-primary hover:bg-primary/90 text-primary-foreground",
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : null}
            {confirmText}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
