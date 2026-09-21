import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";
import PasswordInput from "@/components/PasswordInput";

export default function AccountCard() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changeMutation = trpc.localAuth.changePassword.useMutation({
    onSuccess: () => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast.success("Senha alterada");
    },
    onError: e => toast.error(e.message),
  });

  function handleSave() {
    if (!currentPassword) {
      toast.error("Informe sua senha atual.");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("A nova senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("A confirmação não confere com a nova senha.");
      return;
    }
    changeMutation.mutate({ currentPassword, newPassword });
  }

  return (
    <Card className="max-w-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Lock className="h-4 w-4 text-slate-500" />
          Minha conta
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>E-mail de acesso</Label>
          <Input value={user?.email ?? ""} disabled />
          <p className="text-xs text-muted-foreground">
            O e-mail de acesso não pode ser alterado.{" "}
            {user?.name ? `Logado como ${user.name}.` : ""}
          </p>
        </div>

        <div className="grid gap-2">
          <Label>Senha atual</Label>
          <PasswordInput
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            placeholder="Sua senha atual"
            autoComplete="current-password"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Nova senha</Label>
            <PasswordInput
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div className="grid gap-2">
            <Label>Confirmar nova senha</Label>
            <PasswordInput
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            disabled={changeMutation.isPending || !currentPassword || !newPassword}
          >
            {changeMutation.isPending ? "Salvando..." : "Alterar senha"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
