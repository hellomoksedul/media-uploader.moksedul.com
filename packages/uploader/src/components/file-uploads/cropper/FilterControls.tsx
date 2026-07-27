import React from "react";

export const filterOptions = [
  { name: "Original", value: "none" },
  { name: "Grayscale", value: "grayscale(100%)" },
  { name: "Sepia", value: "sepia(100%)" },
  { name: "Vintage", value: "sepia(50%) hue-rotate(-30deg) saturate(140%)" },
  { name: "Cool", value: "hue-rotate(30deg) saturate(120%)" },
  { name: "Warm", value: "sepia(30%) saturate(120%)" },
  { name: "Pastel", value: "brightness(110%) saturate(90%) sepia(20%)" },
  { name: "Dramatic", value: "contrast(140%) saturate(120%)" },
  { name: "Mono High", value: "grayscale(100%) contrast(140%)" },
  { name: "Golden", value: "sepia(40%) saturate(150%) contrast(110%)" },
  { name: "Fade", value: "brightness(105%) saturate(80%) contrast(90%)" },
  { name: "Cyber", value: "hue-rotate(190deg) saturate(150%)" },
];

interface FilterControlsProps {
  imageSrc: string;
  filter: string;
  setFilter: (val: string) => void;
}

export function FilterControls({
  imageSrc,
  filter,
  setFilter,
}: FilterControlsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {filterOptions.map((f) => (
        <button
          key={f.name}
          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
            filter === f.value
              ? "border-primary"
              : "border-transparent hover:border-muted-foreground/50"
          }`}
          onClick={() => setFilter(f.value)}
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${imageSrc})`,
              filter: f.value,
            }}
          />
          <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[11px] py-1 text-center font-medium">
            {f.name}
          </div>
        </button>
      ))}
    </div>
  );
}
