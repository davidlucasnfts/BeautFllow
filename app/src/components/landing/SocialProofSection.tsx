import { ShieldCheck, Lock, Database, FileCheck } from "lucide-react";

const badges = [
  {
    icon: ShieldCheck,
    label: "Dados protegidos (LGPD)",
    desc: "Autorização assinada pelo celular",
  },
  { icon: Lock, label: "Conexão segura (HTTPS)", desc: "Criptografia em trânsito" },
  {
    icon: Database,
    label: "Dados isolados",
    desc: "Cada estabelecimento só vê os próprios dados",
  },
  {
    icon: FileCheck,
    label: "Histórico de auditoria",
    desc: "Operações sensíveis registradas",
  },
];

/** Prova de segurança real (sem logos de clientes inventados nem selos
 *  falsos como "ISO 27001" — removidos por honestidade de venda). */
export function SocialProofSection() {
  return (
    <section className="px-6 py-16 border-y border-border/40 bg-background">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-xs font-medium text-muted-foreground uppercase tracking-wider mb-8">
          Segurança e privacidade de verdade
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map(b => (
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
