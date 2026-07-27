import { cn } from "@/lib/utils";
import SmartImage from "@/components/SmartImage";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallbackText?: string;
  className?: string;
  imageClassName?: string;
}

export function Avatar({ src, alt = "Avatar", fallbackText, className, imageClassName }: AvatarProps) {
  const avatarUrl = src || `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackText || alt)}&background=random`;

  return (
    <div className={cn("flex shrink-0 items-center justify-center rounded-full bg-muted overflow-hidden", className)}>
      <SmartImage
        width={220}
        height={220}
        src={avatarUrl}
        alt={alt}
        className={cn("w-full h-full object-cover bg-muted", imageClassName)}
      />
    </div>
  );
}
