import { Scissors, CalendarDays, User } from "lucide-react";

const steps = [
  { id: 1, label: "Serviço", icon: Scissors },
  { id: 2, label: "Data e hora", icon: CalendarDays },
  { id: 3, label: "Seus dados", icon: User },
];

export default function BookingSteps({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isActive = currentStep >= step.id;
        const isCompleted = currentStep > step.id;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                  isActive
                    ? "border-current bg-current text-white"
                    : "border-slate-200 text-slate-300"
                }`}
                style={
                  isActive && !isCompleted
                    ? { borderColor: "currentColor", backgroundColor: "currentColor" }
                    : {}
                }
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`text-[10px] font-medium ${
                  isActive ? "text-slate-700" : "text-slate-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 rounded-full ${
                  isCompleted ? "bg-slate-300" : "bg-slate-100"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
