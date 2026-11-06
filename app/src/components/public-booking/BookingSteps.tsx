export default function BookingSteps({
  currentStep,
  primaryColor,
}: {
  currentStep: number;
  primaryColor: string;
}) {
  const steps = [
    { id: 1, label: "Serviço" },
    { id: 2, label: "Data e hora" },
    { id: 3, label: "Seus dados" },
  ];

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = currentStep >= step.id;
        const isCompleted = currentStep > step.id;
        const isCurrent = currentStep === step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold border-2 transition-all ${
                  isActive
                    ? "text-white border-transparent"
                    : "text-slate-300 border-slate-200 bg-white"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: primaryColor,
                        borderColor: primaryColor,
                      }
                    : {}
                }
              >
                {isCompleted ? "✓" : step.id}
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isCurrent
                    ? "text-slate-800"
                    : isActive
                      ? "text-slate-600"
                      : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className="mx-2 h-0.5 w-8 rounded-full"
                style={{
                  backgroundColor: isCompleted ? primaryColor : "#e2e8f0",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
