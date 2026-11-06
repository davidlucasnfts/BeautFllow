import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ShieldCheck } from "lucide-react";

export default function LgpdCheckbox({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
        checked
          ? "border-green-200 bg-green-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <Checkbox
        id="lgpd-accept"
        checked={checked}
        onCheckedChange={checked => onCheckedChange(checked === true)}
        className="mt-0.5"
      />
      <div className="flex-1">
        <Label
          htmlFor="lgpd-accept"
          className="text-xs text-slate-700 leading-snug cursor-pointer flex items-start gap-1.5"
        >
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-green-600 mt-0.5" />
          Aceito o uso dos meus dados para agendamento, conforme a política do
          estabelecimento *
        </Label>
      </div>
    </div>
  );
}
