interface RegistrationHeaderProps {
  step: number;
  totalSteps: number;
  stepLabel: string;
  title: string;
}

export default function RegistrationHeader({
  step,
  totalSteps,
  stepLabel,
  title,
}: RegistrationHeaderProps) {
  const percent = Math.round((step / totalSteps) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div className="h-0.5 w-full rounded-full bg-white/5">
        <div
          className="h-full rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)] transition-[width] duration-500 ease-in-out"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-accent">
            Step {String(step).padStart(2, "0")}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-white">{title}</h1>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
            {stepLabel}
          </p>
          <p className="font-mono text-sm text-primary">{percent}% Complete</p>
        </div>
      </div>
    </div>
  );
}
