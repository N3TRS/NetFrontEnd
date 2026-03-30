interface ProjectSyncProgressProps {
  open: boolean;
  totalFiles: number;
  syncedFiles: number;
  currentFile?: string;
  failed?: number;
  onRetry?: () => void;
}

export default function ProjectSyncProgress({
  open,
  totalFiles,
  syncedFiles,
  currentFile,
  failed = 0,
  onRetry,
}: ProjectSyncProgressProps) {
  if (!open) return null;

  const progress = totalFiles > 0 ? (syncedFiles / totalFiles) * 100 : 0;
  const isComplete = syncedFiles >= totalFiles && failed === 0;
  const hasErrors = failed > 0;

  return (
    <div className="fixed top-4 right-4 z-50 w-80 animate-in slide-in-from-top-2 duration-300">
      <div className="card-noir p-4 shadow-[0_0_30px_-5px_rgba(255,139,16,0.2)]">
        <div className="flex flex-col gap-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isComplete ? (
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : hasErrors ? (
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              )}
              <h3 className="text-sm font-semibold text-white">
                {isComplete
                  ? "Sync Complete"
                  : hasErrors
                  ? "Sync Issues"
                  : "Syncing Project"}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {syncedFiles}/{totalFiles}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full transition-all duration-300 rounded-full ${
                hasErrors ? "bg-yellow-500" : "bg-primary"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Current File */}
          {currentFile && !isComplete && (
            <div className="flex items-start gap-2">
              <svg
                className="w-4 h-4 mt-0.5 text-muted-foreground flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-xs text-muted-foreground truncate flex-1">
                {currentFile}
              </p>
            </div>
          )}

          {/* Retry Button */}
          {hasErrors && onRetry && (
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 w-full bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/30 text-yellow-500 font-medium rounded-lg px-3 py-2 text-xs transition-colors cursor-pointer"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry {failed} Failed File{failed !== 1 ? "s" : ""}
            </button>
          )}

          {/* Success Message */}
          {isComplete && (
            <p className="text-xs text-green-500 text-center">
              All files synced successfully
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
