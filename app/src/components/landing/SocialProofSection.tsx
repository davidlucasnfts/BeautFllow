import { ShieldCheck, Lock, Server, Award } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "LGPD Compliant", desc: "Consentimento digital nativo" },
  { icon: Lock, label: "SSL 256-bit", desc: "Criptografia de ponta a ponta" },
  { icon: Server, label: "Hospedado no Brasil", desc: "Servidores com baixa latência" },
  { icon: Award, label: "ISO 27001", desc: "Gestão de segurança da informação" },
];

const logos = [
  "Studio Mariana", "Barbearia JP", "Spa Luiza", "Espaço Bella",
  "Salão Glamour", "Clínica Estética Rio", "Cabelos & Cia", "Beleza Pura",
];

export function SocialProofSection() {
  return (
    <section className="px-6 py-16 border-y border-border/40 bg-background">
      <div className="max-w-7xl mx-auto">
        {/* Trusted by */}
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-8">
          Confiado por salões em todo o Brasil
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mb-16 opacity-60">
          {logos.map((logo) => (
            <span
              key={logo}
              className="text-sm font-semibold text-muted-foreground whitespace-nowrap"
            >
              {logo}
            </span>
          ))}
        </div>

        {/* Security badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-muted/30 px-4 py-3"
            >
              <b.icon className="h-5 w-5 text-primary shrink-0" />
              <div>
                <p className="text-xs font-semibold">{b.label}</p>
                <p className="text-[10px] text-muted-foreground">{b.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
