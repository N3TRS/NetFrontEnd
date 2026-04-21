interface ProjectLoadingModalProps {
  open: boolean;
  title?: string;
  message?: string;
  progress?: number;
}

export default function ProjectLoadingModal({
  open,
  title = "Creating Project",
  message = "Setting up your Spring Boot project with Kubernetes deployment...",
  progress,
}: ProjectLoadingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border border-white/10 bg-[#0d1117] p-8 shadow-[0_0_60px_-15px_rgba(255,139,16,0.15)]">
        <div className="flex flex-col items-center gap-6">
          {/* Spinner or Progress */}
          <div className="relative w-16 h-16">
            {progress !== undefined ? (
              // Progress circle
              <svg className="w-16 h-16 transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-white/10"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-300"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Indeterminate spinner
              <svg
                className="w-16 h-16 animate-spin text-primary"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}

            {/* Progress percentage */}
            {progress !== undefined && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {Math.round(progress)}%
                </span>
              </div>
            )}
          </div>

          {/* Title */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="text-white text-xl font-semibold tracking-tight">
              {title}
            </h2>
            <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
              {message}
            </p>
          </div>

          {/* Pulsing indicator */}
          <div className="flex gap-1.5">
            <div
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: "0ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: "150ms" }}
            />
            <div
              className="w-2 h-2 rounded-full bg-primary animate-pulse"
              style={{ animationDelay: "300ms" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
