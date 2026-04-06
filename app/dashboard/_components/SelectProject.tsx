import { X } from "lucide-react";

interface SelectProjectProps {
  open: boolean;
  onClose: () => void;
}

export default function SelectProject({
  open,
  onClose,
}: SelectProjectProps) {

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absoulte inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4 rounded-2xl border border-white/10 bg-[#0d1117] p-6 shadow-[0_0_60px_-15px_rgba(255,139,16,0.15)]">
        <button
          onClick={onClose}
          className="absoulte top-4 right-4 text-muted-foreground hover:text-white transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

    </div>
  );
}
