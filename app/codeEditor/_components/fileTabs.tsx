type FileTabsProps = {
  openFiles: string[];
  activeFile: string;
  onSelect: (file: string) => void;
  onClose: (file: string) => void;
};

export default function FileTabs({openFiles,activeFile,onSelect,onClose,}: FileTabsProps) {
  return (
    <div className="flex bg-[var(--color-noir-bg)] border-b border-white/10">
      {openFiles.map((file) => (
        <div
          key={file}
          onClick={() => onSelect(file)}
          className={`flex items-center gap-2 font-mono text-sm px-3 py-2 cursor-pointer ${
            file === activeFile
              ? "bg-[var(--color-noir-purple-mid)] text-primary"
              : "text-gray-400 hover:bg-[var(--color-noir-purple-deep)]"
          }`}
        >
          <span>{file}</span>
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClose(file);
            }}
            className="text-gray-400 hover:text-[var(--color-noir-orange)] leading-none"
          >
            ×
          </span>
        </div>
      ))}
    </div>
  );
}