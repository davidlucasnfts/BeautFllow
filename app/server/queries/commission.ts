import { eq, and, sql, desc } from "drizzle-orm";
import { getDb } from "./connection";
import {
  professionals,
  appointments,
  services,
  clients,
  financialRecords,
  professionalPayments,
} from "@db/schema";
import type { InsertProfessionalPayment } from "@db/schema";

export type CommissionSummary = {
  professionalId: number;
  name: string;
  commissionRate: string;
  totalCommission: string;
  totalPaid: string;
  balance: string;
};

export type CommissionAppointment = {
  id: number;
  appointmentDate: string;
  startTime: string;
  clientName: string | null;
  serviceName: string | null;
  amount: string;
  commissionAmount: string;
};

export type PaymentWithName = {
  id: number;
  professionalId: number;
  professionalName: string;
  amount: string;
  paymentMethod: string;
  paidAt: string;
  notes: string | null;
  createdAt: Date;
};

function dateConditions(
  fromDate: string | undefined,
  toDate: string | undefined
) {
  const conds = [];
  if (fromDate)
    conds.push(sql`${appointments.appointmentDate} >= ${fromDate}`);
  if (toDate) conds.push(sql`${appointments.appointmentDate} <= ${toDate}`);
  return conds;
}

function paymentDateConditions(
  fromDate: string | undefined,
  toDate: string | undefined
) {
  const conds = [];
  if (fromDate)
    conds.push(sql`${professionalPayments.paidAt} >= ${fromDate}`);
  if (toDate) conds.push(sql`${professionalPayments.paidAt} <= ${toDate}`);
  return conds;
}

/**
 * Resumo de comissões por profissional: total devido (atendimentos concluídos
 * pagos × taxa de comissão atual), total já pago e saldo.
 */
export async function getCommissionSummary(
  salonId: number,
  professionalId?: number,
  fromDate?: string,
  toDate?: string
): Promise<CommissionSummary[]> {
  const db = getDb();

  const proBase = [eq(professionals.salonId, salonId)];
  if (professionalId) proBase.push(eq(professionals.id, professionalId));
  const pros = await db
    .select()
    .from(professionals)
    .where(and(...proBase));

  const apptBase = [
    eq(appointments.salonId, salonId),
    eq(appointments.status, "completed"),
  ];
  if (professionalId)
    apptBase.push(eq(appointments.professionalId, professionalId));
  const apptConditions = [...apptBase, ...dateConditions(fromDate, toDate)];

  const apptRows = await db
    .select({
      id: appointments.id,
      professionalId: appointments.professionalId,
      amount: financialRecords.amount,
    })
    .from(appointments)
    .leftJoin(
      financialRecords,
      and(
        eq(financialRecords.appointmentId, appointments.id),
        eq(financialRecords.type, "service")
      )
    )
    .where(and(...apptConditions));

  const payBase = [eq(professionalPayments.salonId, salonId)];
  if (professionalId)
    payBase.push(eq(professionalPayments.professionalId, professionalId));
  const payConditions = [...payBase, ...paymentDateConditions(fromDate, toDate)];

  const payments = await db
    .select({
      professionalId: professionalPayments.professionalId,
      amount: professionalPayments.amount,
    })
    .from(professionalPayments)
    .where(and(...payConditions));

  const commissionByPro: Record<number, number> = {};
  for (const row of apptRows) {
    if (!row.professionalId) continue;
    const pro = pros.find(p => p.id === row.professionalId);
    if (!pro) continue;
    const amount = Number(row.amount ?? 0);
    const rate = Number(pro.commissionRate ?? 0);
    commissionByPro[row.professionalId] =
      (commissionByPro[row.professionalId] ?? 0) + (amount * rate) / 100;
  }

  const paidByPro: Record<number, number> = {};
  for (const row of payments) {
    paidByPro[row.professionalId] =
      (paidByPro[row.professionalId] ?? 0) + Number(row.amount);
  }

  return pros.map(p => {
    const total = commissionByPro[p.id] ?? 0;
    const paid = paidByPro[p.id] ?? 0;
    return {
      professionalId: p.id,
      name: p.name,
      commissionRate: String(p.commissionRate),
      totalCommission: total.toFixed(2),
      totalPaid: paid.toFixed(2),
      balance: (total - paid).toFixed(2),
    };
  });
}

/**
 * Desempenho detalhado de um profissional: lista de atendimentos concluídos
 * no período com valor e comissão calculada.
 */
export async function getCommissionPerformance(
  salonId: number,
  professionalId: number,
  fromDate: string,
  toDate: string
): Promise<{
  professional: { id: number; name: string; commissionRate: string };
  appointments: CommissionAppointment[];
}> {
  const db = getDb();

  const pro = await db.query.professionals.findFirst({
    where: and(
      eq(professionals.id, professionalId),
      eq(professionals.salonId, salonId)
    ),
  });
  if (!pro) {
    return {
      professional: { id: professionalId, name: "", commissionRate: "0.00" },
      appointments: [],
    };
  }

  const rate = Number(pro.commissionRate ?? 0);

  const rows = await db
    .select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      startTime: appointments.startTime,
      clientName: clients.name,
      serviceName: services.name,
      amount: financialRecords.amount,
    })
    .from(appointments)
    .leftJoin(
      financialRecords,
      and(
        eq(financialRecords.appointmentId, appointments.id),
        eq(financialRecords.type, "service")
      )
    )
    .leftJoin(services, eq(services.id, appointments.serviceId))
    .leftJoin(clients, eq(clients.id, appointments.clientId))
    .where(
      and(
        eq(appointments.salonId, salonId),
        eq(appointments.professionalId, professionalId),
        eq(appointments.status, "completed"),
        sql`${appointments.appointmentDate} >= ${fromDate}`,
        sql`${appointments.appointmentDate} <= ${toDate}`
      )
    )
    .orderBy(appointments.appointmentDate, appointments.startTime);

  return {
    professional: {
      id: pro.id,
      name: pro.name,
      commissionRate: String(pro.commissionRate),
    },
    appointments: rows.map(r => {
      const amount = Number(r.amount ?? 0);
      return {
        id: r.id,
        appointmentDate: r.appointmentDate,
        startTime: r.startTime,
        clientName: r.clientName,
        serviceName: r.serviceName,
        amount: amount.toFixed(2),
        commissionAmount: ((amount * rate) / 100).toFixed(2),
      };
    }),
  };
}

/** Lista os pagamentos feitos aos profissionais (opcionalmente filtrado). */
export async function getProfessionalPayments(
  salonId: number,
  professionalId?: number
): Promise<PaymentWithName[]> {
  const db = getDb();
  const base = [eq(professionalPayments.salonId, salonId)];
  if (professionalId)
    base.push(eq(professionalPayments.professionalId, professionalId));
  const rows = await db
    .select({
      payment: professionalPayments,
      professionalName: professionals.name,
    })
    .from(professionalPayments)
    .innerJoin(
      professionals,
      eq(professionals.id, professionalPayments.professionalId)
    )
    .where(and(...base))
    .orderBy(desc(professionalPayments.paidAt), desc(professionalPayments.id));
  return rows.map(r => ({
    id: r.payment.id,
    professionalId: r.payment.professionalId,
    professionalName: r.professionalName,
    amount: String(r.payment.amount),
    paymentMethod: r.payment.paymentMethod,
    paidAt: r.payment.paidAt,
    notes: r.payment.notes,
    createdAt: r.payment.createdAt,
  }));
}

/** Registra um pagamento feito ao profissional. */
export async function createProfessionalPayment(
  data: InsertProfessionalPayment
) {
  const db = getDb();
  const [{ id }] = await db
    .insert(professionalPayments)
    .values(data)
    .returning();
  return db.query.professionalPayments.findFirst({
    where: eq(professionalPayments.id, id),
  });
}

/** Exclui um pagamento registrado (caso tenha sido lançado errado). */
export async function deleteProfessionalPayment(id: number, salonId: number) {
  const db = getDb();
  await db
    .delete(professionalPayments)
    .where(
      and(
        eq(professionalPayments.id, id),
        eq(professionalPayments.salonId, salonId)
      )
    );
}
