import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/providers/trpc";
import { useSalon } from "@/providers/useSalon";
import { toast } from "sonner";
import { Sparkles, Plus, UserCheck } from "lucide-react";
import { getSegmentLabel } from "@contracts/segment-labels";
import ServiceFormDialog, {
  type ServiceFormValues,
} from "@/components/services/ServiceFormDialog";
import ProfessionalFormDialog, {
  type ProfessionalFormValues,
} from "@/components/professionals/ProfessionalFormDialog";

const MAX_ITEMS = 3;

interface OnboardingChecklistProps {
  serviceCount: number;
  professionalCount: number;
}

/** Card que guia o dono novo a cadastrar os 3 primeiros serviços e 3
 *  primeiros profissionais antes de começar a agendar. Só some quando
 *  completar 3+3 ou quando desligado em Configurações. */
export default function OnboardingChecklist({
  serviceCount,
  professionalCount,
}: OnboardingChecklistProps) {
  const { salon } = useSalon();
  const utils = trpc.useUtils();
  const { data: me } = trpc.localAuth.me.useQuery();

  const [serviceOpen, setServiceOpen] = useState(false);
  const [professionalOpen, setProfessionalOpen] = useState(false);

  const serviceLabel = salon
    ? getSegmentLabel(salon.segment, "service").toLowerCase()
    : "serviço";
  const professionalLabel = salon
    ? getSegmentLabel(salon.segment, "professional").toLowerCase()
    : "profissional";

  const servicesQuery = trpc.service.list.useQuery(
    { salonId: salon?.id ?? 0 },
    { enabled: !!salon }
  );

  const createService = trpc.service.create.useMutation({
    onSuccess: () => {
      utils.service.list.invalidate();
      utils.appointment.list.invalidate();
      setServiceOpen(false);
      toast.success(`${serviceLabel} cadastrado`);
    },
    onError: e => toast.error(e.message),
  });

  const createProfessional = trpc.professional.create.useMutation({
    onSuccess: () => {
      utils.professional.list.invalidate();
      utils.appointment.list.invalidate();
      toast.success(`${professionalLabel} cadastrado`);
    },
    onError: e => toast.error(e.message),
  });

  function handleCreateMe() {
    if (!salon) return;
    const fallbackName =
      me?.name || me?.email?.split("@")[0] || "Proprietário";
    createProfessional.mutate({
      salonId: salon.id,
      name: fallbackName,
      commissionRate: "0.00",
    });
  }

  const serviceProgress = Math.min(serviceCount, MAX_ITEMS);
  const professionalProgress = Math.min(professionalCount, MAX_ITEMS);
  const servicePct = (serviceProgress / MAX_ITEMS) * 100;
  const professionalPct = (professionalProgress / MAX_ITEMS) * 100;

  const categories = Array.from(
    new Set(servicesQuery.data?.map(s => s.category).filter(Boolean) as string[])
  );

  return (
    <>
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Configure seu StudioFlow
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Cadastre até 3 {serviceLabel}s e 3 {professionalLabel}s para liberar
            a agenda. Depois o card some sozinho.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">{serviceLabel}s</span>
                <span className="text-muted-foreground">
                  {serviceProgress} de {MAX_ITEMS}
                </span>
              </div>
              <Progress value={servicePct} className="h-2" />
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1"
                onClick={() => setServiceOpen(true)}
                disabled={serviceProgress >= MAX_ITEMS}
              >
                <Plus className="h-3.5 w-3.5" />
                Cadastrar {serviceLabel}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium capitalize">
                  {professionalLabel}s
                </span>
                <span className="text-muted-foreground">
                  {professionalProgress} de {MAX_ITEMS}
                </span>
              </div>
              <Progress value={professionalPct} className="h-2" />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-1"
                  onClick={() => setProfessionalOpen(true)}
                  disabled={professionalProgress >= MAX_ITEMS}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Cadastrar
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  className="flex-1 gap-1"
                  onClick={handleCreateMe}
                  disabled={
                    professionalProgress >= MAX_ITEMS ||
                    createProfessional.isPending
                  }
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  Sou eu
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ServiceFormDialog
        open={serviceOpen}
        onOpenChange={setServiceOpen}
        editingId={null}
        initial={null}
        categories={categories}
        services={servicesQuery.data?.map(s => ({ id: s.id, name: s.name })) ?? []}
        serviceLabel={serviceLabel}
        isPending={createService.isPending}
        onSubmit={(values: ServiceFormValues) =>
          createService.mutate({
            salonId: salon?.id ?? 0,
            ...values,
            followUpServiceId: values.followUpServiceId
              ? Number(values.followUpServiceId)
              : undefined,
          })
        }
      />

      <ProfessionalFormDialog
        open={professionalOpen}
        onOpenChange={setProfessionalOpen}
        editingId={null}
        initial={null}
        professionalLabel={professionalLabel}
        isPending={createProfessional.isPending}
        onSubmit={(values: ProfessionalFormValues) =>
          createProfessional.mutate({
            salonId: salon?.id ?? 0,
            ...values,
            commissionRate: values.commissionRate,
          })
        }
      />
    </>
  );
}
