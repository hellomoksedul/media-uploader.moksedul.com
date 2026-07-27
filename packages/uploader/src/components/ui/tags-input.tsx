"use client";

import { X } from "lucide-react";
import * as React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/common/Button";

export interface TagsInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string[];
  onChange: (value: string[]) => void;
  suggestions?: string[];
  disabled?: boolean;
  maxTags?: number;
}

export const TagsInput = React.forwardRef<HTMLInputElement, TagsInputProps>(
  ({ className, value, onChange, placeholder, suggestions, disabled, maxTags, ...props }, ref) => {
    const [pending, setPending] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const availableSuggestions = suggestions?.filter(
      (s) => !value.includes(s) && s.toLowerCase().includes(pending.toLowerCase())
    );

    const addTag = (tag: string) => {
      const trimmed = tag.trim();
      if (trimmed && !value.includes(trimmed)) {
        if (maxTags && value.length >= maxTags) {
          setPending("");
          return;
        }
        onChange([...value, trimmed]);
      }
      setPending("");
    };

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || e.key === ",") {
        e.preventDefault();
        addTag(pending);
      } else if (e.key === "Backspace" && pending === "" && value.length > 0) {
        e.preventDefault();
        removeTag(value[value.length - 1]);
      }
    };

    const handleBlur = () => {
      // Short delay to allow clicking suggestions before hiding
      setTimeout(() => {
        setIsFocused(false);
        addTag(pending);
      }, 150);
    };

    return (
      <div className={cn("relative", className)}>
        <div
          className={cn(
            "flex flex-wrap items-center gap-1.5 p-1.5 border border-border dark:border-border bg-background dark:bg-muted rounded-lg min-h-[44px] max-h-[140px] overflow-y-auto custom-scrollbar transition-colors",
            !disabled && "focus-within:ring-2 focus-within:ring-[#4F46E5]/20 focus-within:border-[#4F46E5]/50",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          {value.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted dark:bg-muted text-foreground text-[13px] font-medium"
            >
              {tag}
              {!disabled && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeTag(tag)}
                  className="h-4 w-4 hover:bg-transparent text-muted-foreground hover:text-foreground dark:hover:text-foreground"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              )}
            </span>
          ))}
          <input
            ref={ref}
            type="text"
            value={pending}
            onChange={(e) => setPending(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            disabled={disabled}
            className="flex-1 min-w-[80px] bg-transparent border-none outline-none text-[14px] px-1 text-foreground placeholder:text-muted-foreground"
            placeholder={value.length === 0 ? placeholder : ""}
            {...props}
          />
        </div>
        {isFocused && availableSuggestions && availableSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-background dark:bg-muted border border-border dark:border-border rounded-md shadow-lg overflow-hidden py-1 max-h-48 overflow-y-auto">
            {availableSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="ghost"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addTag(suggestion);
                }}
                className="w-full justify-start font-normal rounded-none px-3 py-2 text-[13px] text-foreground hover:bg-muted dark:hover:bg-muted"
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TagsInput.displayName = "TagsInput";
