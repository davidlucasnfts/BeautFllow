import { CalendarDays, Users, TrendingUp, Clock } from "lucide-react";

export function DashboardMockup() {
  const stats = [
    { label: "Agendamentos", value: "24", icon: CalendarDays, color: "bg-rose-100 text-rose-600" },
    { label: "Clientes", value: "312", icon: Users, color: "bg-violet-100 text-violet-600" },
    { label: "Faturamento", value: "R$4.2k", icon: TrendingUp, color: "bg-emerald-100 text-emerald-600" },
    { label: "No-Show", value: "3%", icon: Clock, color: "bg-amber-100 text-amber-600" },
  ];

  const appointments = [
    { time: "09:00", client: "Ana Paula", service: "Coloração", status: "confirmed" },
    { time: "10:30", client: "Carla M.", service: "Corte + Hidratação", status: "pending" },
    { time: "14:00", client: "Fernanda", service: "Manicure", status: "confirmed" },
    { time: "16:00", client: "Patrícia", service: "Depilação", status: "confirmed" },
  ];

  return (
    <div className="relative mx-auto max-w-4xl">
      {/* Browser chrome */}
      <div className="rounded-xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400" />
            <div className="h-3 w-3 rounded-full bg-amber-400" />
            <div className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="h-6 max-w-md mx-auto rounded-md bg-muted/60 flex items-center px-3 text-[10px] text-muted-foreground">
              app.beautyflow.com.br/dashboard
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-lg border border-border/40 p-3 bg-background">
                <div className={`inline-flex p-1.5 rounded-md ${s.color} mb-2`}>
                  <s.icon className="h-3.5 w-3.5" />
                </div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Two columns */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* Chart area */}
            <div className="md:col-span-2 rounded-lg border border-border/40 p-4 bg-background">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold">Faturamento Semanal</p>
                <div className="flex gap-1">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((d) => (
                    <div key={d} className="text-[9px] text-muted-foreground w-6 text-center">{d}</div>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2 h-20">
                {[40, 65, 45, 80, 55, 90].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-sm bg-primary/80"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mini calendar */}
            <div className="rounded-lg border border-border/40 p-3 bg-background">
              <p className="text-xs font-semibold mb-2">Hoje — 07 Mai</p>
              <div className="space-y-1.5">
                {appointments.map((a) => (
                  <div
                    key={a.time}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-[10px] ${
                      a.status === "confirmed"
                        ? "bg-emerald-50 border border-emerald-100"
                        : "bg-amber-50 border border-amber-100"
                    }`}
                  >
                    <span className="font-mono text-muted-foreground">{a.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{a.client}</p>
                      <p className="text-muted-foreground truncate">{a.service}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -left-4 top-1/4 hidden lg:flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 shadow-lg animate-pulse">
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
        <span className="text-[10px] font-medium">Agendamento confirmado</span>
      </div>
      <div className="absolute -right-4 bottom-1/4 hidden lg:flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-2 shadow-lg">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        <span className="text-[10px] font-medium">+23% este mês</span>
      </div>
    </div>
  );
}
