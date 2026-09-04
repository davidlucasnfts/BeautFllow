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
import { Logo } from "@/components/landing/Logo";
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
  { value: "35%", label: "Redução de No-Show" },
  { value: "5min", label: "Ativação do Sistema" },
  { value: "LGPD", label: "Compliance Nativo" },
  { value: "100%", label: "Omnichannel" },
];

const features = [
  {
    icon: CalendarDays,
    title: "Agendamento Inteligente",
    desc: "Calendário multi-profissional, agendamento online público, confirmações automáticas e lista de espera.",
  },
  {
    icon: Users,
    title: "CRM de Clientes",
    desc: "Ficha técnica digital, timeline de interações, fotos antes/depois, segmentação automática e retenção.",
  },
  {
    icon: MessageSquare,
    title: "Comunicação Omnichannel",
    desc: "WhatsApp Business API integrado, templates automáticos, lembretes inteligentes e campanhas de reativação.",
  },
  {
    icon: ShieldCheck,
    title: "Termos Digitais & LGPD",
    desc: "Termos de consentimento com assinatura digital, auditoria completa, anonimização e direito à exclusão.",
  },
  {
    icon: TrendingUp,
    title: "Financeiro & Comissões",
    desc: "Lançamentos por serviço/produto, controle de comissões por profissional, dashboard de faturamento e relatórios.",
  },
  {
    icon: Sparkles,
    title: "Experiência do Cliente",
    desc: "QR code de check-in, pré-checklist automática, pós-cuidados personalizados e avaliação NPS.",
  },
];

const plans = [
  {
    name: "Free",
    price: "R$ 0",
    period: "/mês",
    features: [
      "1 profissional",
      "30 agendamentos/mês",
      "Confirmação por e-mail",
      "CRM básico",
    ],
    cta: "Começar",
    highlight: false,
  },
  {
    name: "Essencial",
    price: "R$ 89",
    period: "/mês",
    features: [
      "Até 3 profissionais",
      "Agendamento ilimitado",
      "WhatsApp API (500 msg)",
      "CRM completo",
      "Financeiro simples",
    ],
    cta: "Assinar",
    highlight: true,
  },
  {
    name: "Pro",
    price: "R$ 179",
    period: "/mês",
    features: [
      "Até 8 profissionais",
      "Termos digitais",
      "Automações de retenção",
      "Comissões avançadas",
      "2000 msg/mês",
    ],
    cta: "Assinar",
    highlight: false,
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
      "Do primeiro contato ao pós-venda. Agendamento inteligente, CRM de clientes, comunicação omnichannel e fidelização — tudo em uma única plataforma.",
  },
  barbershop: {
    title: "barbearias",
    subtitle:
      "Organize cortes, barbas e combos. Controle de agenda, clientes, comissões dos barbeiros e comunicação automática — tudo em uma única plataforma.",
  },
  aesthetic_clinic: {
    title: "clínicas de estética",
    subtitle:
      "Gerencie procedimentos, histórico de pacientes, consentimentos LGPD, comissões e campanhas de reativação — tudo em uma única plataforma.",
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
          <Logo className="h-6 w-6" />
          <span className="text-xl font-serif font-bold tracking-tight">
            StudioFlow
          </span>
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
      <SocialProofSection segment={segment} />

      {/* Pricing */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">
          Planos simples e justos
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-lg mx-auto">
          Comece grátis e evolua conforme seu negócio cresce. Sem taxa de setup,
          sem surpresas.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
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
            <Logo className="h-5 w-5" />
            <span className="font-serif font-bold">StudioFlow</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} StudioFlow. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacidade
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Termos
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contato
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
