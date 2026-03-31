import { Share2, Terminal, Settings, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  return (
    <header className="flex h-12 items-center justify-between border-b border-white/10 bg-background/95 px-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary p-1.5 text-primary-foreground">
          <Terminal className="h-4 w-4" strokeWidth={2.5} />
        </div>
        <span className="bg-gradient-to-linear from-primary to-accent bg-clip-text text-lg font-bold text-transparent">
          OmniCode
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Users className="h-4 w-4" />
          Invite
        </Button>
        <Button variant="ghost" size="icon" aria-label="Share">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
