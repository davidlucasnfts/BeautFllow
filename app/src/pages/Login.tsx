import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PasswordInput from "@/components/PasswordInput";
import { trpc } from "@/providers/trpc";
import { onlyText } from "@/lib/input-masks";
import { toast } from "sonner";
import { LogIn, UserPlus, KeyRound } from "lucide-react";

type Mode = "login" | "register" | "forgot";

export default function Login() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const loginMutation = trpc.localAuth.login.useMutation({
    onSuccess: () => {
      window.location.href = "/dashboard";
    },
    onError: err => setError(err.message),
  });

  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: () => {
      toast.success("Conta criada! Faça login para continuar.");
      setMode("login");
      setError("");
      setPassword("");
    },
    onError: err => setError(err.message),
  });

  const resetMutation = trpc.localAuth.requestPasswordReset.useMutation({
    onSuccess: () => setResetSent(true),
    onError: err => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "forgot") {
      resetMutation.mutate({ email });
      return;
    }

    if (mode === "login") {
      loginMutation.mutate({ email, password });
    } else {
      if (password.length < 8) {
        setError("Senha deve ter pelo menos 8 caracteres");
        return;
      }
      registerMutation.mutate({ email, password, name: name || undefined });
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setResetSent(false);
  };

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    resetMutation.isPending;

  const titles: Record<Mode, string> = {
    login: "Bem-vindo",
    register: "Criar conta",
    forgot: "Recuperar senha",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="font-serif text-2xl">{titles[mode]}</CardTitle>
        </CardHeader>
        <CardContent>
          {mode === "forgot" && resetSent ? (
            <div className="space-y-4 text-center">
              <p className="text-sm text-muted-foreground">
                Se <span className="font-medium">{email}</span> estiver
                cadastrado, enviamos um link de recuperação. Verifique sua
                caixa de entrada (e o spam) — o link é válido por 1 hora.
              </p>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => switchMode("login")}
              >
                Voltar para o login
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={e => setName(onlyText(e.target.value))}
                      placeholder="Seu nome"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    required
                  />
                </div>

                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      {mode === "login" && (
                        <button
                          type="button"
                          onClick={() => switchMode("forgot")}
                          className="text-xs text-primary hover:underline"
                        >
                          Esqueci a senha
                        </button>
                      )}
                    </div>
                    <PasswordInput
                      id="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                    />
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Aguarde..."
                  ) : mode === "login" ? (
                    <>
                      <LogIn className="h-4 w-4" />
                      Entrar
                    </>
                  ) : mode === "register" ? (
                    <>
                      <UserPlus className="h-4 w-4" />
                      Criar conta
                    </>
                  ) : (
                    <>
                      <KeyRound className="h-4 w-4" />
                      Enviar link de recuperação
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() =>
                    switchMode(mode === "login" ? "register" : "login")
                  }
                  className="text-sm text-primary hover:underline"
                >
                  {mode === "register"
                    ? "Já tem conta? Entrar"
                    : "Não tem conta? Cadastre-se"}
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
