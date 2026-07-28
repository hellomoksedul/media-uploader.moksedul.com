import { Button } from "@/components/common/Button";
import { Crop, Sliders, Wand2 } from "lucide-react";
import React from "react";

interface SidebarProps {
  activeTool: "crop" | "filter" | "adjust";
  setActiveTool: (tool: "crop" | "filter" | "adjust") => void;
  children?: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTool,
  setActiveTool,
  children,
}) => {
  const tools = [
    { id: "crop", icon: <Crop className="w-5 h-5" />, label: "Crop" },
    { id: "filter", icon: <Wand2 className="w-5 h-5" />, label: "Filter" },
    { id: "adjust", icon: <Sliders className="w-5 h-5" />, label: "Adjust" },
  ] as const;

  return (
    <div className="flex flex-col md:flex-row w-full h-full bg-card text-muted-foreground dark:text-foreground">

      {/* Navigation Icons (Left on Desktop) */}
      <div className="flex flex-row md:flex-col items-center justify-center md:justify-start w-full md:w-16 bg-muted/50 py-4 px-2 gap-3 order-2 md:order-1 shrink-0 border-t md:border-t-0 md:border-r border-border">
        {tools.map((tool) => (
          <Button
            key={tool.id}
            variant={activeTool === tool.id ? "ghost-primary" : "ghost"}
            size="icon"
            onClick={() => setActiveTool(tool.id)}
            title={tool.label}
          >
            {tool.icon}
          </Button>
        ))}
      </div>

      {/* Control Panel Area */}
      <div className="flex-1 flex flex-col px-6 pt-6 pb-6 overflow-y-auto order-1 md:order-2 h-full min-h-0">
        <div className="flex-1 min-h-0 space-y-6">{children}</div>
      </div>
    </div>
  );
};
