import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { IconBell, IconSearch } from "@tabler/icons-react";

interface TopBarProps {
  title?: string;
}

export function TopBar({ title = "Dashboard" }: TopBarProps) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        <div className="ml-auto flex items-center gap-2">
          {/* <Button variant="ghost" size="icon" className="rounded-full">
            <IconSearch className="size-5" />
            <span className="sr-only">Search</span>
          </Button> */}

          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
