type RunButtonProps = {
  onRun: () => void;
};

export default function RunButton({ onRun }: RunButtonProps) {
  return (
    <button
      onClick={onRun}
      className="font-mono text-sm bg-[var(--color-noir-orange)] text-black px-4 py-2 hover:bg-[var(--color-noir-orange-light)] transition glow-orange"
    >
      ▶ Run
    </button>
  );
}