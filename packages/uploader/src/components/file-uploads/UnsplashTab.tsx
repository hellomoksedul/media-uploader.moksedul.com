"use client";

import { Button } from "@/components/common/Button";

import { useMediaContext } from "../MediaProvider";
import Image from "next/image";
import { useEffect, useState } from "react";

interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
    thumb: string;
  };
  alt_description: string;
}

interface UnsplashTabProps {
  onImageSelect: (url: string) => void;
  selectedUrl?: string;
  searchQuery?: string;
}

export default function UnsplashTab({
  onImageSelect,
  selectedUrl,
  searchQuery = "",
}: UnsplashTabProps) {
  const { searchUnsplash } = useMediaContext();
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const fetchImages = async (pageNum: number, isAppend = false) => {
    if (isAppend) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await searchUnsplash(searchQuery, pageNum);
      if (!res.success) throw new Error(res.error || "Failed to fetch Unsplash images");
      const results = (res.data as any) || [];
      const totalPages = 10; // Unsplash mock or context driven

      if (isAppend) {
        setImages((prev) => [...prev, ...results]);
      } else {
        setImages(results);
      }

      setHasMore(pageNum < totalPages);
      setPage(pageNum);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchImages(1), 0);
    return () => clearTimeout(timer);
  }, [searchQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">

      <div className="flex flex-col gap-2">
        <div className="w-full grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6 gap-3">
          {isLoading
            ? Array(12)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="w-full aspect-square bg-muted animate-pulse rounded-lg"
                  />
                ))
            : images.map((img) => (
                <div
                  key={img.id}
                  onClick={() => onImageSelect(img.urls.regular)}
                  className={`w-full relative aspect-square h-auto rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${selectedUrl === img.urls.regular ? "border-primary" : "border-transparent hover:border-primary/50"}`}
                >
                  <Image
                    src={img.urls.small}
                    alt={img.alt_description || "Unsplash image"}
                    width={300}
                    height={300}
                    className="w-full h-full object-cover aspect-square"
                  />
                </div>
              ))}
        </div>

        {!isLoading && hasMore && images.length > 0 && (
          <div className="flex justify-center pt-4 pb-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fetchImages(page + 1, true)}
              disabled={isLoadingMore}
              className="gap-2 min-w-[120px]"
            >
              {isLoadingMore ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading...
                </>
              ) : (
                "Load more"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
