interface StepItem {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: StepItem[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <ol className="grid gap-3 md:grid-cols-3">
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <li
            key={step.title}
            className={`rounded-sm border-2 p-4 ${
              isActive || isCompleted
                ? "border-[#5a9c94] bg-[#e8f4f3] dark:bg-slate-800"
                : "border-[#e2ebe6] bg-white dark:border-slate-800 dark:bg-slate-900"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wide text-[#5a9c94]">
              Etapa {index + 1}
            </span>
            <h3 className="mt-1 text-sm font-semibold text-[#1a2a4a] dark:text-slate-50">
              {step.title}
            </h3>
            {step.description && (
              <p className="mt-1 text-xs text-[#4a6354] dark:text-slate-300">{step.description}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}
