import { Button } from "@/components/ui/button";

function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2C6 2 3 6 3 9C3 12 5 14 7 14C9 14 11 12 11 9C11 6 8 2 8 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      <path
        d="M18 2C18 2 21 6 21 9C21 12 19 14 17 14C15 14 13 12 13 9C13 6 16 2 16 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-secondary"
      />
      <circle cx="7" cy="18" r="2" fill="currentColor" className="text-primary" />
      <circle cx="17" cy="18" r="2" fill="currentColor" className="text-secondary" />
    </svg>
  );
}
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, MessageSquare, ShieldCheck, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6" />
          <span className="text-xl font-serif font-bold tracking-tight">BeautyFlow</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link to="/login">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Começar Grátis</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-16 md:py-24 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-serif font-extrabold tracking-tight text-foreground mb-6">
          Gestão completa para <br className="hidden md:block" />
          <span className="text-primary">salões de beleza</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Do primeiro contato ao pós-venda. Agendamento inteligente, CRM de clientes,
          comunicação omnichannel e fidelização — tudo em uma única plataforma.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
              Testar Grátis <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
            Ver Funcionalidades
          </Button>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center p-4">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-primary">35%</p>
              <p className="text-sm text-muted-foreground">Redução de No-Show</p>
            </CardContent>
n          </Card>
          <Card className="text-center p-4">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-primary">5min</p>
              <p className="text-sm text-muted-foreground">Ativação do Sistema</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-primary">LGPD</p>
              <p className="text-sm text-muted-foreground">Compliance Nativo</p>
            </CardContent>
          </Card>
          <Card className="text-center p-4">
            <CardContent className="pt-4">
              <p className="text-3xl font-bold text-primary">100%</p>
              <p className="text-sm text-muted-foreground">Omnichannel</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Tudo que seu salão precisa</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6">
            <CalendarDays className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Agendamento Inteligente</h3>
            <p className="text-muted-foreground text-sm">
              Calendário multi-profissional, agendamento online público, confirmações automáticas e lista de espera.
            </p>
          </Card>
          <Card className="p-6">
            <Users className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">CRM de Clientes</h3>
            <p className="text-muted-foreground text-sm">
              Ficha técnica digital, timeline de interações, fotos antes/depois, segmentação automática e retenção.
            </p>
          </Card>
          <Card className="p-6">
            <MessageSquare className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Comunicação Omnichannel</h3>
            <p className="text-muted-foreground text-sm">
              WhatsApp Business API integrado, templates automáticos, lembretes inteligentes e campanhas de reativação.
            </p>
          </Card>
          <Card className="p-6">
            <ShieldCheck className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Termos Digitais & LGPD</h3>
            <p className="text-muted-foreground text-sm">
              Termos de consentimento com assinatura digital, auditoria completa, anonimização e direito à exclusão.
            </p>
          </Card>
          <Card className="p-6">
            <TrendingUp className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Financeiro & Comissões</h3>
            <p className="text-muted-foreground text-sm">
              Lançamentos por serviço/produto, controle de comissões por profissional, dashboard de faturamento e relatórios.
            </p>
          </Card>
          <Card className="p-6">
            <Logo className="h-8 w-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold mb-2">Experiência do Cliente</h3>
            <p className="text-muted-foreground text-sm">
              QR code de check-in, pré-checklist automática, pós-cuidados personalizados e avaliação NPS.
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Planos simples e justos</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 border-2 border-transparent hover:border-primary/20 transition-colors">
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Free</p>
              <p className="text-3xl font-bold">R$ 0<span className="text-base font-normal text-muted-foreground">/mês</span></p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>1 profissional</li>
              <li>30 agendamentos/mês</li>
              <li>Confirmação por e-mail</li>
              <li>CRM básico</li>
            </ul>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">Começar</Button>
            </Link>
          </Card>
          <Card className="p-6 border-2 border-primary relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-xs px-3 py-1 rounded-full font-medium">
              Mais Popular
            </div>
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Essencial</p>
              <p className="text-3xl font-bold">R$ 89<span className="text-base font-normal text-muted-foreground">/mês</span></p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>Até 3 profissionais</li>
              <li>Agendamento ilimitado</li>
              <li>WhatsApp API (500 msg)</li>
              <li>CRM completo</li>
              <li>Financeiro simples</li>
            </ul>
            <Link to="/login" className="block">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">Assinar</Button>
            </Link>
          </Card>
          <Card className="p-6 border-2 border-transparent hover:border-rose-200 transition-colors">
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground">Pro</p>
              <p className="text-3xl font-bold">R$ 179<span className="text-base font-normal text-muted-foreground">/mês</span></p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground mb-6">
              <li>Até 8 profissionais</li>
              <li>Termos digitais</li>
              <li>Automações de retenção</li>
              <li>Comissões avançadas</li>
              <li>2000 msg/mês</li>
            </ul>
            <Link to="/login" className="block">
              <Button variant="outline" className="w-full">Assinar</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 border-t max-w-7xl mx-auto text-center text-sm text-muted-foreground">
        <p> BeautyFlow. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}
