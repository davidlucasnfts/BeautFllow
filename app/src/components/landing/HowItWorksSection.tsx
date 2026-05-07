import { CalendarPlus, Sparkles, TrendingUp } from "lucide-react";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
}

const steps: Step[] = [
  {
    number: "01",
    title: "Cadastre em 5 minutos",
    description: "Crie sua conta, configure seu salão e adicione seus profissionais e serviços.",
    icon: CalendarPlus,
    details: ["Sem cartão de crédito", "Importação de clientes via CSV", "Configuração guiada passo a passo"],
  },
  {
    number: "02",
    title: "Organize seus agendamentos",
    description: "Use o calendário inteligente, envie lembretes automáticos e reduza faltas.",
    icon: Sparkles,
    details: ["Calendário multi-profissional", "Lembretes WhatsApp/e-mail", "Lista de espera inteligente"],
  },
  {
    number: "03",
    title: "Acompanhe e cresça",
    description: "Monitore faturamento, comissões, retenção de clientes e tome decisões com dados.",
    icon: TrendingUp,
    details: ["Dashboard em tempo real", "Relatórios de faturamento", "Indicadores de retenção"],
  },
];

export function HowItWorksSection() {
  return (
    <section className="px-6 py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary mb-2">COMO FUNCIONA</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            Três passos para transformar seu salão
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Do cadastro à gestão completa em minutos, não em semanas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-border" />

          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Number circle */}
              <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg mb-6">
                {step.number}
              </div>

              {/* Icon */}
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" />
              </div>

              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                {step.description}
              </p>

              <ul className="space-y-1.5 text-xs text-muted-foreground">
                {step.details.map((d) => (
                  <li key={d} className="flex items-center gap-1.5 justify-center">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {d}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
