import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CalendarDays,
  Users,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router";
import { DashboardMockup } from "@/components/landing/DashboardMockup";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { SocialProofSection } from "@/components/landing/SocialProofSection";
import { CTASection } from "@/components/landing/CTASection";
import { segmentLabels, type SalonSegment } from "@contracts/segment-labels";
import {
  getSegmentPalette,
  getSegmentCssVars,
} from "@contracts/segment-palettes";

const stats = [
  { value: "5min", label: "Pronto para usar em" },
  { value: "3", label: "Segmentos num só app" },
  { value: "1 toque", label: "Para fechar o atendimento" },
  { value: "LGPD", label: "Dados protegidos por lei" },
];

const features = [
  {
    icon: CalendarDays,
    title: "Agendamento Inteligente",
    desc: "Vários profissionais na mesma agenda, clientes marcam sozinhos pelo link (sem instalar nada) e ações em massa no dia e na semana.",
  },
  {
    icon: Users,
    title: "Cadastro de Clientes",
    desc: "Ficha de cada cliente com histórico e aniversário. Status automático (VIP, Sumindo, Inativo) baseado em gasto e frequência.",
  },
  {
    icon: TrendingUp,
    title: "Fechamento & Comissões",
    desc: "Concluir em 1 toque gera o lançamento financeiro com a comissão do profissional calculada — sem digitar nada no fim do dia.",
  },
  {
    icon: ShieldCheck,
    title: "Termos e Autorizações",
    desc: "Seus clientes assinam pelo celular e você fica protegido, com tudo guardado conforme a LGPD.",
  },
  {
    icon: MessageSquare,
    title: "Notificações no Celular",
    desc: "Você recebe um alerta no celular sempre que um cliente agenda pelo link — nome, serviço, data e horário na hora.",
  },
  {
    icon: Sparkles,
    title: "Produtos & Estoque",
    desc: "Controle de produtos com entradas e saídas de estoque e alerta de estoque baixo, junto com receitas e despesas.",
  },
];

const plans = [
  {
    name: "Grátis durante o beta",
    price: "R$ 0",
    period: "",
    features: [
      "Todos os recursos liberados",
      "Agendamento online pelo link",
      "Financeiro com comissão calculada",
      "Termos LGPD com assinatura digital",
      "Notificações push no celular",
      "Sem cartão de crédito",
    ],
    cta: "Começar Grátis",
    highlight: true,
  },
];

const segments: SalonSegment[] = [
  "beauty_salon",
  "barbershop",
  "aesthetic_clinic",
];

const segmentHeroCopy: Record<
  SalonSegment,
  { title: string; subtitle: string }
> = {
  beauty_salon: {
    title: "salões de beleza",
    subtitle:
      "Agenda inteligente, cadastro de clientes com status automático, fechamento em 1 toque com comissão calculada e termos LGPD assinados no celular — tudo em um só lugar.",
  },
  barbershop: {
    title: "barbearias",
    subtitle:
      "Organize cortes, barbas e combos. Agenda por profissional, cadastro de clientes, comissão calculada no fechamento e notificação no seu celular a cada novo agendamento online.",
  },
  aesthetic_clinic: {
    title: "estéticas",
    subtitle:
      "Gerencie serviços, histórico de clientes, autorizações assinadas no celular (LGPD), comissões calculadas no fechamento e controle de estoque — tudo em um só lugar.",
  },
};

export default function Home() {
  const [segment, setSegment] = useState<SalonSegment>("beauty_salon");
  const hero = segmentHeroCopy[segment];
  const palette = getSegmentPalette(segment);

  const cssVars = getSegmentCssVars(segment);

  return (
    <div
      className="min-h-screen bg-gradient-to-b to-background"
      style={{
        ...cssVars,
        backgroundImage: `linear-gradient(to bottom, ${palette.primary}10, var(--background))`,
      }}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <img
            src="/brand/logo.png"
            alt="StudioFlow"
            className="h-11 w-auto"
            draggable={false}
          />
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Começar Grátis
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-foreground mb-6">
            Gestão completa para <br className="hidden md:block" />
            <span style={{ color: palette.primary }}>{hero.title}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            {hero.subtitle}
          </p>

          {/* Segment Selector */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {segments.map(seg => (
              <button
                key={seg}
                type="button"
                onClick={() => setSegment(seg)}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                style={
                  segment === seg
                    ? {
                        borderColor: palette.primary,
                        backgroundColor: palette.primary,
                        color: "#ffffff",
                      }
                    : {
                        borderColor: "hsl(var(--border))",
                        backgroundColor: "hsl(var(--background))",
                      }
                }
              >
                {segmentLabels[seg].segmentName}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button
                size="lg"
                className="px-8"
                style={{
                  backgroundColor: palette.primary,
                  color: "#ffffff",
                }}
              >
                Testar Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("features")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver Funcionalidades
            </Button>
          </div>
        </div>

        {/* Dashboard Mockup */}
        <DashboardMockup />
      </section>

      {/* Stats */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map(s => (
            <Card key={s.label} className="text-center p-4">
              <CardContent className="pt-4">
                <p
                  className="text-3xl font-bold"
                  style={{ color: palette.primary }}
                >
                  {s.value}
                </p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que seu{" "}
          {segment === "aesthetic_clinic"
            ? segmentLabels[segment].segmentName.toLowerCase()
            : segmentLabels[segment].segmentName
                .toLowerCase()
                .replace("salão de beleza", "salão")}{" "}
          precisa
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map(f => (
            <Card
              key={f.title}
              className="p-6 hover:shadow-md transition-shadow"
            >
              <f.icon
                className="h-8 w-8 mb-4"
                style={{ color: palette.primary }}
              />
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-muted-foreground text-sm">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <HowItWorksSection segment={segment} />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Social proof */}
      <SocialProofSection />

      {/* Pricing */}
      <section className="px-6 py-16 max-w-md mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Grátis durante o beta
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Todos os recursos liberados enquanto preparamos os planos pagos.
          Sem cartão de crédito, sem surpresas.
        </p>
        <div className="grid gap-6">
          {plans.map(p => (
            <Card
              key={p.name}
              className={`p-6 transition-colors ${
                p.highlight
                  ? "border-2 border-primary relative"
                  : "border-2 border-transparent hover:border-primary/20"
              }`}
            >
              {p.highlight && (
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-white text-xs px-3 py-1 rounded-full font-medium"
                  style={{ backgroundColor: palette.primary }}
                >
                  Mais Popular
                </div>
              )}
              <div className="mb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  {p.name}
                </p>
                <p className="text-3xl font-bold">
                  {p.price}
                  <span className="text-base font-normal text-muted-foreground">
                    {p.period}
                  </span>
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                {p.features.map(f => (
                  <li key={f} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="block">
                <Button
                  variant={p.highlight ? "default" : "outline"}
                  className={`w-full ${
                    p.highlight
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : ""
                  }`}
                >
                  {p.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <CTASection segment={segment} />

      {/* Footer */}
      <footer className="px-6 py-10 border-t">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/brand/logo.png"
              alt="StudioFlow"
              className="h-8 w-auto"
              draggable={false}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StudioFlow. Todos os direitos
            reservados.
          </p>
          <p className="text-sm text-muted-foreground">
            Feito para salões, barbearias e clínicas de estética.
          </p>
        </div>
      </footer>
    </div>
  );
}
