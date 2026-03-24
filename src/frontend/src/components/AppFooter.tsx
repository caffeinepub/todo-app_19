import { CheckSquare } from "lucide-react";

export function AppFooter() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`;

  return (
    <footer className="bg-footer text-white/80">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/20">
            <CheckSquare className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">TaskFlow</span>
        </div>
        <p className="text-sm text-white/60 mb-6">
          Simple, powerful task management.
        </p>
        <div className="border-t border-white/10 pt-5 text-xs text-white/40">
          &copy; {year}. Built with &hearts; using{" "}
          <a
            href={utmLink}
            target="_blank"
            rel="noopener noreferrer"
            className="underline transition-colors hover:text-white/70"
          >
            caffeine.ai
          </a>
        </div>
      </div>
    </footer>
  );
}
