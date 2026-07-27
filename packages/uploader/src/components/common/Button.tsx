import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 as _Loader2 } from "lucide-react";
import * as React from "react";

const Loader2 = _Loader2 as any;

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-muted hover:text-foreground dark:hover:bg-muted/50",
        "ghost-primary":
          "text-primary hover:text-primary/90 hover:bg-primary/10 dark:hover:bg-primary/15",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30",
        link: "text-primary underline-offset-4 hover:underline",
        outline:
          "border-border bg-transparent hover:bg-muted dark:hover:bg-muted text-foreground hover:text-foreground",
      },
      size: {
        default: "px-4 py-2 gap-2",
        xs: "px-2 py-1 gap-1 text-xs rounded-sm!",
        sm: "px-2.5 py-[0.4rem] gap-1.5 text-[0.8rem] rounded-md!",
        md: "px-4 py-2.5 gap-2 rounded-md!",
        lg: "px-4 py-2.5 gap-2 rounded-md! text-base",
        xl: "px-6 py-3 gap-2.5 text-base",
        icon: "size-[38px]",
        // Touch screens get a slightly larger hit area on the small icon
        // sizes (44px is the recommended minimum; these stay compact but
        // meaningfully easier to tap). Pointer-fine devices are unchanged.
        "icon-xs": "size-6 pointer-coarse:size-8",
        "icon-sm": "size-8 pointer-coarse:size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: any;
  leftIcon?: any;
  rightIcon?: any;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const Comp = (asChild ? Slot : "button") as any;

    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          disabled={disabled}
          {...props}
        >
          {children as any}
        </Comp>
      );
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin shrink-0" />
        )}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {isLoading && loadingText ? (
          <span>{loadingText}</span>
        ) : (
          <span className="truncate">{children as any}</span>
        )}
        {!isLoading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  },
) as unknown as ((
  props: React.ComponentPropsWithoutRef<"button"> & ButtonProps,
) => any) & { displayName?: string };

Button.displayName = "Button";

export { Button, buttonVariants };
