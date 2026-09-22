import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSegmentLabel } from "@contracts/segment-labels";
import { BirthdayWidget } from "@/components/home/BirthdayWidget";
import { KpiCard } from "@/components/home/KpiCard";
import { PublicLinkBanner } from "@/components/home/PublicLinkBanner";
import TodayAppointmentsBoard from "@/components/home/TodayAppointmentsBoard";

export default function Dashboard() {
  const { salon } = useSalon();
  const navigate = useNavigate();
  const month = format(new Date(), "yyyy-MM");

  const { data: metrics, isLoading } = trpc.dashboard.metrics.useQuery(
    { salonId: salon?.id ?? 0, month },
    { enabled: !!salon }
  );

  if (!salon) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">
          Selecione um{" "}
          {getSegmentLabel("beauty_salon", "segmentName").toLowerCase()} para
          continuar.
        </p>
      </div>
    );
  }

  const segmentLabel = (key: Parameters<typeof getSegmentLabel>[1]) =>
    getSegmentLabel(salon.segment, key);

  const sparkClients = metrics
    ? [metrics.newClientsPrevMonth || 0, metrics.newClientsThisMonth || 0]
    : [];

  // Sparkline real: receita somada por dia no mes corrente (vem do backend)
  const sparkRevenue = metrics?.revenueByDay ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">Resumo</h1>
          <p className="text-muted-foreground">
            Visão geral do desempenho {segmentLabel("segmentArticle")}{" "}
            {segmentLabel("segmentName").toLowerCase()} em{" "}
            {format(new Date(), "MMMM yyyy", { locale: ptBR })}
          </p>
        </div>
        <Button onClick={() => navigate("/appointments")} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Novo agendamento</span>
          <span className="sm:hidden">Novo</span>
        </Button>
      </div>

      {/* Link público de agendamento */}
      {salon && <PublicLinkBanner slug={salon.slug} />}

      {/* Alertas */}
      {metrics && metrics.pendingConsents > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-800">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {metrics.pendingConsents} {segmentLabel("client").toLowerCase()}
              {metrics.pendingConsents > 1 ? "s" : ""}{" "}
              {metrics.pendingConsents > 1 ? "não assinaram" : "não assinou"} a
              autorização de uso dos dados (LGPD)
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
            onClick={() => navigate("/consent")}
          >
            Resolver
          </Button>
        </div>
      )}

      {metrics && metrics.noShowRate > 15 && (
        <div className="flex items-center gap-3 p-4 rounded-lg border border-rose-200 bg-rose-50 text-rose-800">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium">
              {metrics.noShowRate}% dos clientes faltaram nos últimos dias — o
              ideal é ficar abaixo de 15%. Considere ativar lembretes
              automáticos.
            </p>
          </div>
        </div>
      )}

      {/* KPIs — auto-rows-fr: mesma altura nas duas linhas do mobile */}
      <div className="grid auto-rows-fr gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Atendimentos hoje"
          value={metrics?.appointmentsToday ?? 0}
          icon={CalendarDays}
          iconClassName="text-blue-600"
          trend="neutral"
          trendValue={
            metrics ? `${metrics.appointmentsYesterday} ontem` : undefined
          }
          isLoading={isLoading}
        />
        <KpiCard
          title={`Total de ${segmentLabel("client").toLowerCase()}s`}
          value={metrics?.clientsTotal ?? 0}
          icon={Users}
          iconClassName="text-violet-600"
          trend={
            metrics &&
            metrics.newClientsThisMonth > (metrics.newClientsPrevMonth || 0)
              ? "up"
              : "neutral"
          }
          trendValue={
            metrics ? `+${metrics.newClientsThisMonth} este mês` : undefined
          }
          isLoading={isLoading}
          sparklineData={sparkClients}
        />
        <KpiCard
          title="Ganhos do mês"
          value={
            metrics
              ? `R$ ${metrics.monthlyRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
              : "R$ 0,00"
          }
          icon={DollarSign}
          iconClassName="text-emerald-600"
          trend={
            metrics && metrics.revenueGrowth > 0
              ? "up"
              : metrics && metrics.revenueGrowth < 0
                ? "down"
                : "neutral"
          }
          trendValue={
            metrics
              ? `${metrics.revenueGrowth > 0 ? "+" : ""}${metrics.revenueGrowth}% vs mês passado`
              : undefined
          }
          isLoading={isLoading}
          sparklineData={sparkRevenue}
        />
        <KpiCard
          title="Clientes que faltaram"
          value={`${metrics?.noShowRate ?? 0}%`}
          icon={AlertCircle}
          iconClassName="text-amber-600"
          trend={metrics && metrics.noShowRate > 15 ? "down" : "up"}
          trendValue={
            metrics && metrics.noShowRate > 15
              ? "Acima do ideal"
              : "Dentro do esperado"
          }
          isLoading={isLoading}
        />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
        {/* Agendamentos de hoje */}
        <div className="lg:col-span-3">
          <TodayAppointmentsBoard />
        </div>

        {/* Status dos Agendamentos */}
        <Card className="h-full lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base font-serif">
              Agendamentos do mês
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-24 w-full bg-muted" />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Agendados</span>
                  </div>
                  <span className="font-medium">
                    {metrics?.appointmentsMonth?.scheduled ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Completados</span>
                  </div>
                  <span className="font-medium">
                    {metrics?.appointmentsMonth?.completed ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-rose-500" />
                    <span className="text-sm">Cancelados</span>
                  </div>
                  <span className="font-medium">
                    {metrics?.appointmentsMonth?.cancelled ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Faltou</span>
                  </div>
                  <span className="font-medium">
                    {metrics?.appointmentsMonth?.noShow ?? 0}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Próximos Agendamentos */}
        <Card className="h-full lg:col-span-6">
          <CardHeader>
            <CardTitle className="text-base font-serif">
              Próximos atendimentos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-32 w-full bg-muted" />
            ) : metrics?.upcomingAppointments &&
              metrics.upcomingAppointments.length > 0 ? (
              metrics.upcomingAppointments.map(appt => (
                <div
                  key={appt.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                    <span className="text-xs font-medium">
                      {format(
                        new Date(appt.appointmentDate + "T00:00:00"),
                        "dd"
                      )}
                    </span>
                    <span className="text-[10px] uppercase">
                      {format(
                        new Date(appt.appointmentDate + "T00:00:00"),
                        "MMM",
                        { locale: ptBR }
                      )}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words">
                      {appt.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {appt.serviceName} • {appt.professionalName}
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-[10px] shrink-0">
                    <Clock className="h-3 w-3 mr-1" />
                    {appt.startTime?.slice(0, 5)}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhum agendamento próximo
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Atividades Recentes + Aniversariantes + Dicas */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-12">
        {/* Atividades Recentes */}
        <Card className="h-full lg:col-span-8">
          <CardHeader>
            <CardTitle className="text-base font-serif">
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[320px] overflow-y-auto space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0">
            {isLoading ? (
              <Skeleton className="h-32 w-full bg-muted" />
            ) : metrics?.recentActivity && metrics.recentActivity.length > 0 ? (
              metrics.recentActivity.map(activity => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="mt-0.5">
                    {activity.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : activity.status === "cancelled" ? (
                      <XCircle className="h-4 w-4 text-rose-500" />
                    ) : activity.status === "no_show" ? (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    ) : (
                      <CalendarDays className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium break-words">
                      {activity.clientName}
                    </p>
                    <p className="text-xs text-muted-foreground break-words">
                      {activity.status === "completed"
                        ? "Atendimento concluído"
                        : activity.status === "cancelled"
                          ? "Agendamento cancelado"
                          : activity.status === "no_show"
                            ? "Cliente faltou"
                            : "Novo agendamento"}
                      {activity.serviceName ? ` • ${activity.serviceName}` : ""}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {format(
                      new Date(activity.appointmentDate + "T00:00:00"),
                      "dd/MM"
                    )}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Nenhuma atividade recente
              </p>
            )}
          </CardContent>
        </Card>
        <div className="lg:col-span-4">
          <BirthdayWidget />
        </div>

        {/* Dicas para clientes voltarem */}
        <Card className="lg:col-span-12">
          <CardHeader>
            <CardTitle className="text-base font-serif">
              Dicas para seus clientes voltarem
            </CardTitle>
          </CardHeader>
          <CardContent className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="flex gap-3">
              <TrendingUp className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>
                Cliente que não volta em 45 dias provavelmente não volta mais.
                Mande uma mensagem carinhosa convidando ela de volta.
              </p>
            </div>
            <div className="flex gap-3">
              <DollarSign className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>
                Quem fecha pacote de 5 sessões gasta 40% mais com você. Faça um
                preço melhor para quem compra o pacote fechado.
              </p>
            </div>
            <div className="flex gap-3">
              <Users className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <p>
                Seus clientes que mais gastam gostam de se sentir especiais.
                Faça ofertas só para eles, em vez de promoção para todo mundo.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
