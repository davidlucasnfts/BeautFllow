import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import type { SalonSegment } from "@contracts/segment-labels";
import { getSegmentPalette } from "@contracts/segment-palettes";

const benefits = [
  "Grátis durante o beta",
  "Sem cartão de crédito",
  "Deixar pronto em menos de 5 minutos",
  "Todos os recursos liberados",
];

const ctaCopy: Record<SalonSegment, { title: string; subtitle: string }> = {
  beauty_salon: {
    title: "Pronto para organizar seu salão?",
    subtitle:
      "Agenda inteligente, fechamento em 1 toque com comissão calculada e termos LGPD no celular — tudo grátis durante o beta.",
  },
  barbershop: {
    title: "Pronto para organizar sua barbearia?",
    subtitle:
      "Agenda por profissional, cadastro de clientes e comissão calculada no fechamento — tudo grátis durante o beta.",
  },
  aesthetic_clinic: {
    title: "Pronto para organizar sua estética?",
    subtitle:
      "Serviços, histórico de clientes e termos LGPD assinados no celular — tudo grátis durante o beta.",
  },
};

export function CTASection({ segment }: { segment: SalonSegment }) {
  const copy = ctaCopy[segment];
  const palette = getSegmentPalette(segment);
  return (
    <section className="px-6 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div
          className="rounded-2xl px-8 py-14 md:px-16 md:py-16 text-white"
          style={{ backgroundColor: palette.primary }}
        >
          <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
            {copy.title}
          </h2>
          <p className="text-white/80 max-w-lg mx-auto mb-8">{copy.subtitle}</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/login">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 font-semibold"
                style={{ color: palette.primary }}
              >
                Começar Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {benefits.map(b => (
              <div
                key={b}
                className="flex items-center gap-1.5 text-xs text-primary-foreground/80"
              >
                <CheckCircle className="h-3.5 w-3.5" />
                {b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
