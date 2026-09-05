import { CalendarPlus, Sparkles, TrendingUp } from "lucide-react";
import { getSegmentLabel, type SalonSegment } from "@contracts/segment-labels";

interface Step {
  number: string;
  title: string;
  description: string;
  icon: React.ElementType;
  details: string[];
}

function getSteps(segment: SalonSegment): Step[] {
  const label = (key: Parameters<typeof getSegmentLabel>[1]) =>
    getSegmentLabel(segment, key);
  return [
    {
      number: "01",
      title: "Cadastre em 5 minutos",
      description: `Crie sua conta, configure ${label("segmentPossessive")} ${label("segmentName").toLowerCase()} e adicione seus ${label("professional").toLowerCase()}s e ${label("service").toLowerCase()}s.`,
      icon: CalendarPlus,
      details: [
        "Sem cartão de crédito",
        "Importação de clientes via CSV",
        "A gente te guia no passo a passo",
      ],
    },
    {
      number: "02",
      title: "Organize seus agendamentos",
      description:
        "Use o calendário inteligente, envie lembretes automáticos e reduza faltas.",
      icon: Sparkles,
      details: [
        "Vários profissionais na mesma agenda",
        "Lembretes WhatsApp/e-mail",
        "Lista de espera inteligente",
      ],
    },
    {
      number: "03",
      title: "Acompanhe e cresça",
      description:
        "Acompanhe quanto entrou, comissões e quais clientes voltaram.",
      icon: TrendingUp,
      details: [
        "Resumo do dia em tempo real",
        "Quanto entrou no mês",
        "Clientes que voltaram",
      ],
    },
  ];
}

export function HowItWorksSection({ segment }: { segment: SalonSegment }) {
  const segmentName = getSegmentLabel(segment, "segmentName").toLowerCase();
  const steps = getSteps(segment);
  return (
    <section className="px-6 py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14">
          <p className="text-sm font-medium text-primary mb-2">COMO FUNCIONA</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            Três passos para transformar sua {segmentName}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Do cadastro à gestão completa em minutos, não em semanas.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 bg-border" />

          {steps.map(step => (
            <div
              key={step.number}
              className="relative flex flex-col items-center text-center"
            >
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
                {step.details.map(d => (
                  <li
                    key={d}
                    className="flex items-center gap-1.5 justify-center"
                  >
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
