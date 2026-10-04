import { type ReactNode } from "react";
import { Navigate } from "react-router";
import { toast } from "sonner";
import { useSalon } from "@/providers/useSalon";
import { canAccess, type PermissionArea } from "@contracts/permissions";

/**
 * Guard de rota: só renderiza a página se o papel do usuário no salão
 * ativo tiver acesso à área. Sem permissão, volta pro Início com aviso.
 */
export default function ProtectedRoute({
  area,
  children,
}: {
  area: PermissionArea;
  children: ReactNode;
}) {
  const { salon } = useSalon();

  if (salon && !canAccess(salon.role, area)) {
    toast.error("Seu papel não tem permissão para acessar esta área.");
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
