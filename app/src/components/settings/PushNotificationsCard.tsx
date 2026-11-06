import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bell, BellOff } from "lucide-react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function PushNotificationsCard() {
  const { supported, subscribed, loading, subscribe, unsubscribe, publicKey } =
    usePushNotifications();

  if (!supported) {
    return (
      <Card className="max-w-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BellOff className="h-4 w-4 text-slate-500" />
            Notificações no celular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Seu navegador não suporta notificações push. Use o app instalado no
            celular ou ative as notificações do navegador quando disponível.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!publicKey) {
    return (
      <Card className="max-w-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-slate-500" />
            Notificações no celular
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Notificações push ainda não estão configuradas no servidor. Entre em
            contato com o suporte para ativar.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Bell className="h-4 w-4 text-slate-500" />
          Notificações no celular
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Receba um alerta no celular toda vez que uma cliente fizer um
          agendamento pelo seu link online.
        </p>

        <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3">
          <div className="grid gap-0.5">
            <Label htmlFor="push-toggle" className="text-sm font-medium">
              {subscribed ? "Notificações ativadas" : "Ativar notificações"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {subscribed
                ? "Você receberá notificações neste dispositivo."
                : "Permita as notificações do navegador quando solicitado."}
            </p>
          </div>
          {subscribed ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => unsubscribe()}
              disabled={loading}
            >
              Desativar
            </Button>
          ) : (
            <Button size="sm" onClick={() => subscribe()} disabled={loading}>
              Ativar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
