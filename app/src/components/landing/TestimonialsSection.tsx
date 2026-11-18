import { CalendarDays, TrendingUp, ShieldCheck, CheckCircle2 } from "lucide-react";

const differentials = [
  {
    icon: CalendarDays,
    title: "Agenda que trabalha por você",
    points: [
      "Cliente agenda pelo link, sem instalar app",
      "Ações em massa no dia e na semana",
      "Fechamento em 1 toque com valor da tabela",
    ],
  },
  {
    icon: TrendingUp,
    title: "Dinheiro sob controle",
    points: [
      "Comissão calculada no fechamento, sem digitar",
      "Receitas, despesas e ganho líquido real",
      "Estoque de produtos com alerta de estoque baixo",
    ],
  },
  {
    icon: ShieldCheck,
    title: "Proteção de verdade",
    points: [
      "Termos LGPD assinados no celular do cliente",
      "Dados isolados por estabelecimento",
      "Histórico de auditoria nas operações sensíveis",
    ],
  },
];

/** Diferenciais reais do produto (sem depoimentos inventados).
 *  Antes: depoimentos fictícios com métricas fabricadas — removidos por
 *  honestidade de venda (o app ainda está em beta). */
export function TestimonialsSection() {
  return (
    <section className="px-6 py-20 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-sm font-medium text-primary mb-2">POR QUE O STUDIOFLOW</p>
        <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
          Feito para o dia a dia do seu negócio
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Menos tempo no caderno e no WhatsApp, mais tempo atendendo.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {differentials.map(d => (
          <div
            key={d.title}
            className="rounded-xl border border-border/50 bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <d.icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-4">{d.title}</h3>
            <ul className="space-y-2.5">
              {d.points.map(p => (
                <li key={p} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
