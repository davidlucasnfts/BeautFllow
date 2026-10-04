import { Menu } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";

/** Barra superior exibida apenas no mobile, com botão para abrir a sidebar */
export function MobileTopBar({ title }: { title: string }) {
  const { toggleSidebar } = useSidebar();
  return (
    <div className="flex border-b h-14 items-center justify-between bg-background/95 px-2 backdrop-blur supports-backdrop-filter:backdrop-blur sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-primary/40 bg-background hover:bg-accent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5 text-foreground" />
        </button>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="tracking-tight text-foreground">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
