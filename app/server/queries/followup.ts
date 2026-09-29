import { eq, and, inArray, asc } from "drizzle-orm";
import { addDays, format } from "date-fns";
import { getDb } from "./connection";
import {
  appointments,
  services,
  clients,
  clientFollowUps,
} from "@db/schema";

export type PendingFollowUp = {
  id: number;
  clientId: number;
  clientName: string;
  serviceId: number | null;
  serviceName: string;
  professionalId: number | null;
  dueDate: string;
  status: string;
};

/**
 * Cria os retornos pendentes de um atendimento recém-concluído.
 * Para cada serviço feito (principal + adicionais) com followUpDays > 0,
 * registra um retorno com vencimento = data do atendimento + dias.
 * Não duplica: ignora se já existe retorno pendente/agendado para o mesmo
 * cliente e mesmo serviço sugerido. Retorna quantos foram criados.
 */
export async function createFollowUpsFromAppointment(
  appointmentId: number,
  salonId: number
): Promise<number> {
  const db = getDb();
  const appt = await db.query.appointments.findFirst({
    where: eq(appointments.id, appointmentId),
  });
  if (!appt || appt.status !== "completed") return 0;

  const doneServiceIds = [
    appt.serviceId,
    ...(appt.extraServices ?? []).map(e => e.id),
  ];
  const doneServices = await db
    .select()
    .from(services)
    .where(
      and(eq(services.salonId, salonId), inArray(services.id, doneServiceIds))
    );

  let created = 0;
  for (const service of doneServices) {
    if (!service.followUpDays || service.followUpDays <= 0) continue;
    const targetServiceId = service.followUpServiceId ?? service.id;

    const existing = await db.query.clientFollowUps.findFirst({
      where: and(
        eq(clientFollowUps.salonId, salonId),
        eq(clientFollowUps.clientId, appt.clientId),
        eq(clientFollowUps.serviceId, targetServiceId),
        inArray(clientFollowUps.status, ["pending", "scheduled"])
      ),
    });
    if (existing) continue;

    // appointmentDate vem como "yyyy-MM-dd" — somar dias sem mexer em fuso
    const due = addDays(
      new Date(`${appt.appointmentDate}T00:00:00`),
      service.followUpDays
    );
    await db.insert(clientFollowUps).values({
      salonId,
      clientId: appt.clientId,
      professionalId: appt.professionalId,
      originAppointmentId: appt.id,
      serviceId: targetServiceId,
      dueDate: format(due, "yyyy-MM-dd"),
      status: "pending",
    });
    created += 1;
  }
  return created;
}

/** Retornos pendentes do salão, com nome do cliente e do serviço sugerido. */
export async function getPendingFollowUps(
  salonId: number
): Promise<PendingFollowUp[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: clientFollowUps.id,
      clientId: clientFollowUps.clientId,
      clientName: clients.name,
      serviceId: clientFollowUps.serviceId,
      serviceName: services.name,
      professionalId: clientFollowUps.professionalId,
      dueDate: clientFollowUps.dueDate,
      status: clientFollowUps.status,
    })
    .from(clientFollowUps)
    .innerJoin(clients, eq(clients.id, clientFollowUps.clientId))
    .leftJoin(services, eq(services.id, clientFollowUps.serviceId))
    .where(
      and(
        eq(clientFollowUps.salonId, salonId),
        eq(clientFollowUps.status, "pending")
      )
    )
    .orderBy(asc(clientFollowUps.dueDate));
  return rows.map(r => ({
    id: r.id,
    clientId: r.clientId,
    clientName: r.clientName,
    serviceId: r.serviceId,
    serviceName: r.serviceName ?? "Retorno",
    professionalId: r.professionalId,
    dueDate: r.dueDate,
    status: r.status,
  }));
}

/** Marca o retorno como agendado (vincula ao agendamento criado). */
export async function markFollowUpScheduled(
  id: number,
  salonId: number,
  appointmentId: number
) {
  const db = getDb();
  await db
    .update(clientFollowUps)
    .set({ status: "scheduled", scheduledAppointmentId: appointmentId })
    .where(
      and(eq(clientFollowUps.id, id), eq(clientFollowUps.salonId, salonId))
    );
}

/** Dispensar um retorno (cliente não vai voltar / já resolvido fora do app). */
export async function dismissFollowUp(id: number, salonId: number) {
  const db = getDb();
  await db
    .update(clientFollowUps)
    .set({ status: "dismissed" })
    .where(
      and(eq(clientFollowUps.id, id), eq(clientFollowUps.salonId, salonId))
    );
}
