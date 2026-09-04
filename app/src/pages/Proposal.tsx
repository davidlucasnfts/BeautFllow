import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarDays,
  Users,
  MessageSquare,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Clock,
  FileText,
  CheckCircle2,
  ArrowRight,
  Building2,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Link } from "react-router";
import { Logo } from "@/components/landing/Logo";

const painPoints = [
  {
    icon: Clock,
    title: "No-Show de 30%",
    desc: "Clientes não comparecem e a agenda fica com buracos que poderiam ser preenchidos.",
  },
  {
    icon: FileText,
    title: "Fichas no papel",
    desc: "Informações de clientes perdidas, histórico inacessível e sem controle de alergias.",
  },
  {
    icon: TrendingUp,
    title: "Sem visão financeira",
    desc: "Não sabe quanto faturou no mês, quais serviços dão mais lucro ou comissões a pagar.",
  },
];

const features = [
  {
    icon: CalendarDays,
    title: "Agendamento Inteligente",
    desc: "Calendário multi-profissional com visualização semanal/diária. Agendamento online público, confirmações automáticas e lista de espera.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: Users,
    title: "CRM de Clientes",
    desc: "Ficha técnica digital completa com histórico de serviços, aniversário, alergias e preferências.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: MessageSquare,
    title: "Comunicação Automática",
    desc: "Lembretes de agendamento via WhatsApp e e-mail. Templates personalizados e campanhas de reativação.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: ShieldCheck,
    title: "Termos Digitais & LGPD",
    desc: "Termos de consentimento com assinatura digital, auditoria completa e conformidade com a LGPD.",
    color: "bg-amber-50 text-amber-600",
  },
  {
    icon: TrendingUp,
    title: "Financeiro & Comissões",
    desc: "Controle de receitas, despesas, comissões por profissional e relatórios de faturamento.",
    color: "bg-rose-50 text-rose-600",
  },
  {
    icon: Sparkles,
    title: "Gestão de Serviços",
    desc: "Cadastro de serviços com duração, preço e profissionais habilitados. Controle de estoque.",
    color: "bg-cyan-50 text-cyan-600",
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
    cta: "Mais Popular",
    highlight: true,
  },
  {
    name: "Pro",
    price: "R$ 179",
    period: "/mês",
    features: [
      "Até 8 profissionais",
      "Termos digitais LGPD",
      "Automações de retenção",
      "Comissões avançadas",
      "2000 mensagens/mês",
    ],
    cta: "Assinar",
    highlight: false,
  },
];

const timeline = [
  {
    phase: "Semana 1",
    title: "Setup & Cadastro",
    desc: "Cadastro do salão, profissionais, serviços e horários de funcionamento.",
  },
  {
    phase: "Semana 2",
    title: "Importação & Treino",
    desc: "Importação de clientes, treinamento da equipe e configuração de notificações.",
  },
  {
    phase: "Semana 3",
    title: "Go-Live",
    desc: "Início dos agendamentos reais no sistema com acompanhamento diário.",
  },
  {
    phase: "Semana 4",
    title: "Otimização",
    desc: "Ajustes finos, relatórios iniciais e ativação das automações de retenção.",
  },
];

const guarantees = [
  "Implementação gratuita e acompanhada",
  "Suporte por WhatsApp em horário comercial",
  "Backup automático diário dos dados",
  "Cancelamento a qualquer momento, sem multa",
  "Atualizações contínuas sem custo extra",
];

export default function Proposal() {
  const today = new Date();
  const validUntil = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate()
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8" />
            <div>
              <h1 className="text-xl font-serif font-bold tracking-tight">
                BeautyFlow
              </h1>
              <p className="text-xs text-muted-foreground">
                Gestão Inteligente para Salões
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-sm px-3 py-1">
            Proposta Comercial
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 space-y-16">
        {/* Meta */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Data: {today.toLocaleDateString("pt-BR")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span>Para: [Nome do Salão]</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            <span>Válida até: {validUntil.toLocaleDateString("pt-BR")}</span>
          </div>
        </section>

        {/* Hero */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Transforme a gestão do seu salão
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Proposta comercial para implementação do <strong>BeautyFlow</strong>{" "}
            — plataforma completa de agendamento, CRM, financeiro e comunicação.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90 px-8">
                Testar 14 dias grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              onClick={() =>
                document
                  .getElementById("investimento")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              Ver Investimento
            </Button>
          </div>
        </section>

        {/* O Desafio */}
        <section>
          <h3 className="text-2xl font-bold mb-6">O Desafio</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {painPoints.map(p => (
              <Card key={p.title} className="p-5">
                <p.icon className="h-6 w-6 text-red-500 mb-3" />
                <h4 className="font-semibold mb-1">{p.title}</h4>
                <p className="text-sm text-muted-foreground">{p.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* A Solução */}
        <section className="bg-primary/5 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4">A Solução: BeautyFlow</h3>
          <p className="text-muted-foreground mb-6 max-w-3xl">
            Plataforma 100% web e responsiva que centraliza todos os processos
            do seu salão em um único lugar. Reduza no-shows, organize a agenda,
            fidelize clientes e tenha controle total do financeiro — sem
            planilhas, sem papel, sem estresse.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { value: "35%", label: "Redução de No-Show" },
              { value: "5min", label: "Ativação do Sistema" },
              { value: "LGPD", label: "Compliance Nativo" },
              { value: "100%", label: "Omnichannel" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-xl p-4">
                <p className="text-2xl font-bold text-primary">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Funcionalidades */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Funcionalidades Incluídas</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {features.map(f => (
              <Card key={f.title} className="p-5 flex gap-4 items-start">
                <div className={`p-3 rounded-lg shrink-0 ${f.color}`}>
                  <f.icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Telas do Sistema — Preview */}
        <section>
          <h3 className="text-2xl font-bold mb-6">Módulos do Sistema</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Dashboard", desc: "KPIs e indicadores" },
              { name: "Agenda", desc: "Calendário interativo" },
              { name: "Clientes", desc: "Ficha completa" },
              { name: "Serviços", desc: "Catálogo e preços" },
              { name: "Profissionais", desc: "Comissões e agenda" },
              { name: "Financeiro", desc: "Receitas e despesas" },
              { name: "Comunicação", desc: "WhatsApp e e-mail" },
              { name: "Consentimentos", desc: "Termos digitais" },
            ].map(m => (
              <Card
                key={m.name}
                className="p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="h-20 bg-slate-100 rounded-lg mb-3 flex items-center justify-center text-xs text-slate-400">
                  Preview
                </div>
                <p className="font-medium text-sm">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.desc}</p>
              </Card>
            ))}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-3">
            * Os previews acima são representações. Na demonstração ao vivo você
            navegará em todas as telas reais.
          </p>
        </section>

        {/* Investimento */}
        <section id="investimento">
          <h3 className="text-2xl font-bold mb-6 text-center">Investimento</h3>
          <p className="text-center text-muted-foreground mb-8 max-w-lg mx-auto">
            Sem taxa de setup. Sem fidelidade. Cancele quando quiser.
          </p>
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {plans.map(p => (
              <Card
                key={p.name}
                className={`p-6 transition-colors ${
                  p.highlight
                    ? "border-2 border-primary relative shadow-lg"
                    : "border hover:border-primary/20"
                }`}
              >
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                    {p.cta}
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
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" className="block">
                  <Button
                    variant={p.highlight ? "default" : "outline"}
                    className="w-full"
                  >
                    {p.highlight ? "Começar Agora" : "Escolher"}
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </section>

        {/* Cronograma */}
        <section>
          <h3 className="text-2xl font-bold mb-6">
            Cronograma de Implementação
          </h3>
          <div className="space-y-4">
            {timeline.map((t, i) => (
              <div key={t.phase} className="flex gap-4 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </div>
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-1" />
                  )}
                </div>
                <Card className="flex-1 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="text-xs">
                      {t.phase}
                    </Badge>
                    <h4 className="font-semibold">{t.title}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.desc}</p>
                </Card>
              </div>
            ))}
          </div>
        </section>

        {/* Garantias */}
        <section className="bg-white rounded-2xl border p-8">
          <h3 className="text-2xl font-bold mb-6">Garantias & Suporte</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {guarantees.map(g => (
              <div key={g} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <span className="text-sm">{g}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Contato */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Fale Conosco</h3>
          <div className="flex flex-col md:flex-row gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <span>contato@beautyflow.com.br</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>(XX) XXXXX-XXXX</span>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span>beautyflow.com.br</span>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="text-center bg-primary text-primary-foreground rounded-2xl p-10">
          <h3 className="text-2xl font-bold mb-3">
            Pronto para modernizar seu salão?
          </h3>
          <p className="mb-6 opacity-90 max-w-lg mx-auto">
            Teste gratuitamente por 14 dias. Sem cartão de crédito, sem
            compromisso.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" variant="secondary" className="px-8">
                Começar Teste Grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-10">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5" />
            <span className="font-serif font-bold text-foreground">
              BeautyFlow
            </span>
          </div>
          <p>Documento confidencial — uso comercial restrito</p>
          <p>&copy; {new Date().getFullYear()} BeautyFlow</p>
        </div>
      </footer>
    </div>
  );
}
