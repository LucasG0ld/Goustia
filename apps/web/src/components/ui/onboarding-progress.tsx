export function OnboardingProgress({
  currentStep,
  totalSteps,
  label,
}: {
  currentStep: number;
  totalSteps: number;
  label: string;
}) {
  const safeTotal = Math.max(1, totalSteps);
  const safeCurrent = Math.min(Math.max(1, currentStep), safeTotal);
  const percentage = Math.round((safeCurrent / safeTotal) * 100);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <p className="font-semibold">{label}</p>
        <p aria-hidden="true" className="text-muted">
          {safeCurrent}/{safeTotal}
        </p>
      </div>
      <div
        aria-label={`${label} : étape ${safeCurrent} sur ${safeTotal}`}
        aria-valuemax={safeTotal}
        aria-valuemin={1}
        aria-valuenow={safeCurrent}
        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
      >
        <div
          className="h-full rounded-full bg-brand"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
