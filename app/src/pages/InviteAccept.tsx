import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { trpc } from "@/providers/trpc";
import { onlyText } from "@/lib/input-masks";
import { toast } from "sonner";
import { UserCheck, LogIn } from "lucide-react";
import { SALON_ROLE_LABELS } from "@contracts/permissions";

export default function InviteAccept() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { data: invite, isLoading } = trpc.team.getInvite.useQuery(
    { token },
    { enabled: token.length >= 10, retry: false }
  );

  const acceptMutation = trpc.team.acceptInvite.useMutation({
    onSuccess: () => {
      toast.success("Bem-vindo(a)! Sua conta está pronta.");
      // Recarrega para o app reconhecer a sessão nova e abrir no salão certo
      window.location.href = "/dashboard";
    },
    onError: e => setError(e.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    acceptMutation.mutate({ token, name, password });
  }

  if (!token || (!isLoading && !invite)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-sm">
          <CardHeader className="text-center">
            <CardTitle className="font-serif text-2xl">
              Convite inválido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Este convite não existe, já foi usado ou expirou. Peça um novo
              convite ao responsável pelo estabelecimento.
            </p>
            <Button
              className="w-full"
              onClick={() => navigate("/login")}
            >
              <LogIn className="h-4 w-4" />
              Voltar pro login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading || !invite) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-sm text-muted-foreground">Carregando convite...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">
            Você foi convidado(a)!
          </CardTitle>
          <p className="text-sm text-muted-foreground pt-1">
            Crie sua senha para entrar na equipe de{" "}
            <span className="font-medium text-foreground">
              {invite.salonName}
            </span>{" "}
            como {SALON_ROLE_LABELS[invite.role]}.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input id="invite-email" value={invite.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-name">Seu nome</Label>
              <Input
                id="invite-name"
                value={name}
                onChange={e => setName(onlyText(e.target.value))}
                placeholder="Como você é chamado(a)"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-password">Crie uma senha</Label>
              <PasswordInput
                id="invite-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Mínimo de 8 caracteres"
                autoComplete="new-password"
                required
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={acceptMutation.isPending || name.length < 2}
            >
              <UserCheck className="h-4 w-4" />
              {acceptMutation.isPending ? "Criando conta..." : "Entrar na equipe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
