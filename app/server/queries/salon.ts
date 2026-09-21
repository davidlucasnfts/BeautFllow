import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./connection";
import { parseClientStatusSettings } from "@contracts/constants";
import {
  salons,
  salonUsers,
  clients,
  services,
  professionals,
  appointments,
  communications,
  financialRecords,
  consentForms,
  consentSignatures,
  auditLogs,
} from "@db/schema";
import type {
  InsertSalon,
  InsertClient,
  InsertService,
  InsertProfessional,
  InsertAppointment,
  InsertCommunication,
  InsertFinancialRecord,
  InsertConsentForm,
  InsertConsentSignature,
  InsertAuditLog,
} from "@db/schema";

// ==========================================
// Salons
// ==========================================
export async function createSalon(data: InsertSalon) {
  const db = getDb();
  const [{ id }] = await db.insert(salons).values(data).returning();
  return db.query.salons.findFirst({ where: eq(salons.id, id) });
}

export async function getSalonById(id: number) {
  return getDb().query.salons.findFirst({ where: eq(salons.id, id) });
}

export async function getSalonsByUser(userId: number) {
  return getDb()
    .select({ salon: salons, role: salonUsers.role })
    .from(salons)
    .innerJoin(salonUsers, eq(salonUsers.salonId, salons.id))
    .where(and(eq(salonUsers.userId, userId), eq(salonUsers.isActive, true)));
}

export async function addUserToSalon(
  salonId: number,
  userId: number,
  role: "owner" | "admin" | "professional" | "receptionist" = "professional"
) {
  return getDb()
    .insert(salonUsers)
    .values({ salonId, userId, role })
    .onConflictDoUpdate({
      target: salonUsers.userId,
      set: { role, isActive: true },
    });
}

export async function updateSalon(id: number, data: Partial<InsertSalon>) {
  await getDb().update(salons).set(data).where(eq(salons.id, id));
  return getSalonById(id);
}

// ==========================================
// Clients
// ==========================================
export async function createClient(data: InsertClient) {
  const db = getDb();
  const [{ id }] = await db.insert(clients).values(data).returning();
  return db.query.clients.findFirst({ where: eq(clients.id, id) });
}

export async function getClientsBySalon(salonId: number, limit = 1000) {
  return getDb()
    .select()
    .from(clients)
    .where(and(eq(clients.salonId, salonId), eq(clients.lgpdAnonymized, false)))
    .orderBy(desc(clients.createdAt))
    .limit(limit);
}

export async function getClientById(id: number, salonId: number) {
  return getDb().query.clients.findFirst({
    where: and(eq(clients.id, id), eq(clients.salonId, salonId)),
  });
}

export async function updateClient(
  id: number,
  salonId: number,
  data: Partial<InsertClient>
) {
  await getDb()
    .update(clients)
    .set(data)
    .where(and(eq(clients.id, id), eq(clients.salonId, salonId)));
  return getClientById(id, salonId);
}

export async function deleteClient(id: number, salonId: number) {
  // Soft-delete via anonymização LGPD
  await getDb()
    .update(clients)
    .set({
      lgpdAnonymized: true,
      name: "Anônimo",
      phone: "",
      notes: null,
    })
    .where(and(eq(clients.id, id), eq(clients.salonId, salonId)));
}

export async function searchClients(salonId: number, query: string) {
  return getDb()
    .select()
    .from(clients)
    .where(
      and(
        eq(clients.salonId, salonId),
        eq(clients.lgpdAnonymized, false),
        sql`(${clients.name} LIKE ${`%${query}%`} OR ${clients.phone} LIKE ${`%${query}%`})`
      )
    )
    .limit(20);
}

// ==========================================
// Services
// ==========================================
export async function createService(data: InsertService) {
  const db = getDb();
  const [{ id }] = await db.insert(services).values(data).returning();
  return db.query.services.findFirst({ where: eq(services.id, id) });
}

export async function getServicesBySalon(salonId: number, includeInactive = false) {
  return getDb()
    .select()
    .from(services)
    .where(
      includeInactive
        ? eq(services.salonId, salonId)
        : and(eq(services.salonId, salonId), eq(services.isActive, true))
    )
    .orderBy(services.name);
}

export async function getServiceById(id: number, salonId: number) {
  return getDb().query.services.findFirst({
    where: and(eq(services.id, id), eq(services.salonId, salonId)),
  });
}

export async function updateService(
  id: number,
  salonId: number,
  data: Partial<InsertService>
) {
  await getDb()
    .update(services)
    .set(data)
    .where(and(eq(services.id, id), eq(services.salonId, salonId)));
  return getServiceById(id, salonId);
}

export async function deleteService(id: number, salonId: number) {
  await getDb()
    .update(services)
    .set({ isActive: false })
    .where(and(eq(services.id, id), eq(services.salonId, salonId)));
}

/** Reativa um serviço inativado por engano (exclusão é lógica) */
export async function reactivateService(id: number, salonId: number) {
  await getDb()
    .update(services)
    .set({ isActive: true })
    .where(and(eq(services.id, id), eq(services.salonId, salonId)));
}

// ==========================================
// Professionals
// ==========================================
export async function createProfessional(data: InsertProfessional) {
  const db = getDb();
  const [{ id }] = await db.insert(professionals).values(data).returning();
  return db.query.professionals.findFirst({ where: eq(professionals.id, id) });
}

export async function getProfessionalsBySalon(
  salonId: number,
  includeInactive = false
) {
  return getDb()
    .select()
    .from(professionals)
    .where(
      includeInactive
        ? eq(professionals.salonId, salonId)
        : and(eq(professionals.salonId, salonId), eq(professionals.isActive, true))
    )
    .orderBy(professionals.name);
}

export async function getProfessionalById(id: number, salonId: number) {
  return getDb().query.professionals.findFirst({
    where: and(eq(professionals.id, id), eq(professionals.salonId, salonId)),
  });
}

export async function updateProfessional(
  id: number,
  salonId: number,
  data: Partial<InsertProfessional>
) {
  await getDb()
    .update(professionals)
    .set(data)
    .where(and(eq(professionals.id, id), eq(professionals.salonId, salonId)));
  return getProfessionalById(id, salonId);
}

/** Desativa um profissional (exclusão lógica — histórico de agendamentos preservado) */
export async function deleteProfessional(id: number, salonId: number) {
  await getDb()
    .update(professionals)
    .set({ isActive: false })
    .where(and(eq(professionals.id, id), eq(professionals.salonId, salonId)));
}

/** Reativa um profissional desativado por engano (exclusão é lógica) */
export async function reactivateProfessional(id: number, salonId: number) {
  await getDb()
    .update(professionals)
    .set({ isActive: true })
    .where(and(eq(professionals.id, id), eq(professionals.salonId, salonId)));
}

// ==========================================
// Appointments
// ==========================================
export async function createAppointment(data: InsertAppointment) {
  const db = getDb();
  const [{ id }] = await db.insert(appointments).values(data).returning();
  return db.query.appointments.findFirst({ where: eq(appointments.id, id) });
}

export async function getAppointmentsBySalon(
  salonId: number,
  fromDate?: string,
  toDate?: string
) {
  const conditions = [eq(appointments.salonId, salonId)];
  if (fromDate)
    conditions.push(sql`${appointments.appointmentDate} >= ${fromDate}`);
  if (toDate)
    conditions.push(sql`${appointments.appointmentDate} <= ${toDate}`);

  return getDb()
    .select()
    .from(appointments)
    .where(and(...conditions))
    .orderBy(appointments.appointmentDate, appointments.startTime);
}

export async function getAppointmentsByProfessional(
  salonId: number,
  professionalId: number,
  fromDate?: string,
  toDate?: string
) {
  const conditions = [
    eq(appointments.salonId, salonId),
    eq(appointments.professionalId, professionalId),
  ];
  if (fromDate)
    conditions.push(sql`${appointments.appointmentDate} >= ${fromDate}`);
  if (toDate)
    conditions.push(sql`${appointments.appointmentDate} <= ${toDate}`);

  return getDb()
    .select()
    .from(appointments)
    .where(and(...conditions))
    .orderBy(appointments.appointmentDate, appointments.startTime);
}

export async function getAppointmentById(id: number, salonId: number) {
  return getDb().query.appointments.findFirst({
    where: and(eq(appointments.id, id), eq(appointments.salonId, salonId)),
  });
}

/** Histórico recente do cliente: atendimentos concluídos com nome/valor do serviço */
export async function getClientHistory(salonId: number, clientId: number, limit = 5) {
  return getDb()
    .select({
      id: appointments.id,
      appointmentDate: appointments.appointmentDate,
      status: appointments.status,
      serviceName: services.name,
      servicePrice: services.price,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(
        eq(appointments.salonId, salonId),
        eq(appointments.clientId, clientId),
        eq(appointments.status, "completed")
      )
    )
    .orderBy(desc(appointments.appointmentDate), desc(appointments.startTime))
    .limit(limit);
}

export async function updateAppointment(
  id: number,
  salonId: number,
  data: Partial<InsertAppointment>
) {
  await getDb()
    .update(appointments)
    .set(data)
    .where(and(eq(appointments.id, id), eq(appointments.salonId, salonId)));
  return getAppointmentById(id, salonId);
}

// ==========================================
// Financial Records
// ==========================================
export async function createFinancialRecord(data: InsertFinancialRecord) {
  const db = getDb();
  const [{ id }] = await db.insert(financialRecords).values(data).returning();
  return db.query.financialRecords.findFirst({
    where: eq(financialRecords.id, id),
  });
}

export async function getFinancialRecordsBySalon(
  salonId: number,
  fromDate?: string,
  toDate?: string
) {
  const conditions = [eq(financialRecords.salonId, salonId)];
  if (fromDate)
    conditions.push(sql`${financialRecords.recordDate} >= ${fromDate}`);
  if (toDate) conditions.push(sql`${financialRecords.recordDate} <= ${toDate}`);

  return getDb()
    .select()
    .from(financialRecords)
    .where(and(...conditions))
    .orderBy(desc(financialRecords.recordDate));
}

export async function getFinancialSummaryBySalon(
  salonId: number,
  fromDate?: string,
  toDate?: string
) {
  // intervalo de datas (yyyy-mm-dd): mês, semana ou dia conforme a tela pedir
  const conditions = [eq(financialRecords.salonId, salonId)];
  if (fromDate)
    conditions.push(sql`${financialRecords.recordDate} >= ${fromDate}`);
  if (toDate) conditions.push(sql`${financialRecords.recordDate} <= ${toDate}`);

  const [row] = await getDb()
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${financialRecords.type} != 'refund' THEN ${financialRecords.amount} ELSE 0 END), 0)`,
      totalRefunds: sql<number>`COALESCE(SUM(CASE WHEN ${financialRecords.type} = 'refund' THEN ABS(${financialRecords.amount}) ELSE 0 END), 0)`,
      totalCommission: sql<number>`COALESCE(SUM(${financialRecords.commissionAmount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(financialRecords)
    .where(and(...conditions));

  // SUM/COUNT do Postgres voltam como string (numeric) — normalizar p/ número
  return {
    totalRevenue: Number(row?.totalRevenue ?? 0),
    totalRefunds: Number(row?.totalRefunds ?? 0),
    totalCommission: Number(row?.totalCommission ?? 0),
    count: Number(row?.count ?? 0),
  };
}

export async function updateFinancialRecord(
  id: number,
  salonId: number,
  data: Partial<InsertFinancialRecord>
) {
  await getDb()
    .update(financialRecords)
    .set(data)
    .where(
      and(eq(financialRecords.id, id), eq(financialRecords.salonId, salonId))
    );
  return getDb().query.financialRecords.findFirst({
    where: eq(financialRecords.id, id),
  });
}

export async function deleteFinancialRecord(id: number, salonId: number) {
  // Exclusao fisica (registro financeiro proprio, sem PII do cliente)
  await getDb()
    .delete(financialRecords)
    .where(
      and(eq(financialRecords.id, id), eq(financialRecords.salonId, salonId))
    );
}

// ==========================================
// Communications
// ==========================================
export async function createCommunication(data: InsertCommunication) {
  const db = getDb();
  const [{ id }] = await db.insert(communications).values(data).returning();
  return db.query.communications.findFirst({
    where: eq(communications.id, id),
  });
}

export async function getCommunicationsByClient(
  clientId: number,
  salonId: number
) {
  return getDb()
    .select()
    .from(communications)
    .where(
      and(
        eq(communications.clientId, clientId),
        eq(communications.salonId, salonId)
      )
    )
    .orderBy(desc(communications.createdAt));
}

export async function getCommunicationsBySalon(salonId: number, limit = 50) {
  return getDb()
    .select({
      id: communications.id,
      salonId: communications.salonId,
      clientId: communications.clientId,
      appointmentId: communications.appointmentId,
      type: communications.type,
      channel: communications.channel,
      direction: communications.direction,
      content: communications.content,
      status: communications.status,
      sentAt: communications.sentAt,
      deliveredAt: communications.deliveredAt,
      readAt: communications.readAt,
      externalId: communications.externalId,
      errorMessage: communications.errorMessage,
      // timestamp gravado em UTC — formatar no servidor com o fuso do Brasil
      createdAt: sql<string>`TO_CHAR(${communications.createdAt} AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY HH24:MI')`,
    })
    .from(communications)
    .where(eq(communications.salonId, salonId))
    .orderBy(desc(communications.createdAt))
    .limit(limit);
}

/** Exclusão física de mensagem (histórico de comunicação, sem PII própria) */
export async function deleteCommunication(id: number, salonId: number) {
  await getDb()
    .delete(communications)
    .where(and(eq(communications.id, id), eq(communications.salonId, salonId)));
}

// ==========================================
// Consent Forms
// ==========================================
export async function createConsentForm(data: InsertConsentForm) {
  const db = getDb();
  const [{ id }] = await db.insert(consentForms).values(data).returning();
  return db.query.consentForms.findFirst({ where: eq(consentForms.id, id) });
}

export async function getConsentFormsBySalon(salonId: number) {
  return getDb()
    .select({
      id: consentForms.id,
      salonId: consentForms.salonId,
      title: consentForms.title,
      content: consentForms.content,
      isRequired: consentForms.isRequired,
      isActive: consentForms.isActive,
      // timestamp gravado em UTC — formatar no servidor com o fuso do Brasil
      createdAt: sql<string>`TO_CHAR(${consentForms.createdAt} AT TIME ZONE 'America/Sao_Paulo', 'DD/MM/YYYY')`,
      updatedAt: consentForms.updatedAt,
    })
    .from(consentForms)
    .where(
      and(eq(consentForms.salonId, salonId), eq(consentForms.isActive, true))
    )
    .orderBy(consentForms.title);
}

export async function getConsentFormById(id: number, salonId: number) {
  return getDb().query.consentForms.findFirst({
    where: and(eq(consentForms.id, id), eq(consentForms.salonId, salonId)),
  });
}

export async function updateConsentForm(
  id: number,
  salonId: number,
  data: Partial<Pick<InsertConsentForm, "title" | "content">>
) {
  await getDb()
    .update(consentForms)
    .set(data)
    .where(and(eq(consentForms.id, id), eq(consentForms.salonId, salonId)));
  return getConsentFormById(id, salonId);
}

export async function deleteConsentForm(id: number, salonId: number) {
  // Soft-delete (decisão LGPD 20/09): o termo e as assinaturas ficam no
  // histórico — só some das listagens (todas filtram isActive = true).
  // Antes apagava as assinaturas em cascata (exclusão física).
  await getDb()
    .update(consentForms)
    .set({ isActive: false })
    .where(and(eq(consentForms.id, id), eq(consentForms.salonId, salonId)));
}

export async function createConsentSignature(data: InsertConsentSignature) {
  const db = getDb();
  const [{ id }] = await db.insert(consentSignatures).values(data).returning();
  return db.query.consentSignatures.findFirst({
    where: eq(consentSignatures.id, id),
  });
}

export async function getConsentSignaturesByClient(
  clientId: number,
  salonId: number
) {
  return getDb()
    .select()
    .from(consentSignatures)
    .where(
      and(
        eq(consentSignatures.clientId, clientId),
        eq(consentSignatures.salonId, salonId)
      )
    )
    .orderBy(desc(consentSignatures.signedAt));
}

// ==========================================
// Audit Logs
// ==========================================
export async function createAuditLog(data: InsertAuditLog) {
  return getDb().insert(auditLogs).values(data);
}

export async function getAuditLogsBySalon(salonId: number, limit = 100) {
  return getDb()
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.salonId, salonId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// ==========================================
// Dashboard Metrics
// ==========================================

/** "Hoje" no fuso de São Paulo (aaaa-mm-dd). Calculado no SQL porque a máquina
 *  do servidor roda em UTC (Vercel) e entre 21h–23h59 BRT o dia já virou. */
async function todaySaoPaulo(
  db: ReturnType<typeof getDb>
): Promise<string> {
  const [row] = await db
    .select({
      today: sql<string>`TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD')`,
    })
    .from(salons)
    .limit(1);
  return row.today;
}

export async function getDashboardMetrics(salonId: number, month: string) {
  const db = getDb();

  const today = await todaySaoPaulo(db);
  const [ty, tm] = today.split("-").map(Number);
  const prevMonthStr = `${tm === 1 ? ty - 1 : ty}-${String(tm === 1 ? 12 : tm - 1).padStart(2, "0")}`;
  // ontem em SP, calculado no SQL (mesmo fuso do "hoje")
  const yesterdaySql = sql`(TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM-DD'))::date - 1`;

  const [
    appointmentsToday,
    appointmentsYesterday,
    appointmentsMonth,
    appointmentsPrevMonth,
    clientsTotal,
    newClientsThisMonth,
    newClientsPrevMonth,
    upcomingAppointments,
    recentActivity,
    pendingConsents,
    monthlyRevenue,
    prevMonthRevenue,
    revenueDaily,
  ] = await Promise.all([
    // Agendamentos hoje
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          sql`${appointments.appointmentDate} = ${today}`
        )
      ),
    // Agendamentos ontem (comparativo do KPI "Atendimentos hoje")
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          sql`${appointments.appointmentDate} = ${yesterdaySql}`
        )
      ),
    // Agendamentos mes atual
    db
      .select({
        scheduled: sql<number>`SUM(CASE WHEN ${appointments.status} = 'scheduled' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'completed' THEN 1 ELSE 0 END)`,
        cancelled: sql<number>`SUM(CASE WHEN ${appointments.status} = 'cancelled' THEN 1 ELSE 0 END)`,
        noShow: sql<number>`SUM(CASE WHEN ${appointments.status} = 'no_show' THEN 1 ELSE 0 END)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          sql`TO_CHAR(${appointments.appointmentDate}, 'YYYY-MM') = ${month}`
        )
      ),
    // Agendamentos mes anterior
    db
      .select({
        scheduled: sql<number>`SUM(CASE WHEN ${appointments.status} = 'scheduled' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN ${appointments.status} = 'completed' THEN 1 ELSE 0 END)`,
        cancelled: sql<number>`SUM(CASE WHEN ${appointments.status} = 'cancelled' THEN 1 ELSE 0 END)`,
        noShow: sql<number>`SUM(CASE WHEN ${appointments.status} = 'no_show' THEN 1 ELSE 0 END)`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.salonId, salonId),
          sql`TO_CHAR(${appointments.appointmentDate}, 'YYYY-MM') = ${prevMonthStr}`
        )
      ),
    // Total clientes
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(
        and(eq(clients.salonId, salonId), eq(clients.lgpdAnonymized, false))
      ),
    // Novos clientes mes atual
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          eq(clients.lgpdAnonymized, false),
          sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM') = ${month}`
        )
      ),
    // Novos clientes mes anterior
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          eq(clients.lgpdAnonymized, false),
          sql`TO_CHAR(${clients.createdAt}, 'YYYY-MM') = ${prevMonthStr}`
        )
      ),
    // Proximos agendamentos
    db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        status: appointments.status,
        clientName: clients.name,
        serviceName: services.name,
        professionalName: professionals.name,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .leftJoin(
        professionals,
        eq(appointments.professionalId, professionals.id)
      )
      .where(
        and(
          eq(appointments.salonId, salonId),
          sql`${appointments.appointmentDate} >= ${today}`,
          eq(appointments.status, "scheduled")
        )
      )
      .orderBy(appointments.appointmentDate, appointments.startTime)
      .limit(5),
    // Atividades recentes
    db
      .select({
        id: appointments.id,
        appointmentDate: appointments.appointmentDate,
        startTime: appointments.startTime,
        status: appointments.status,
        clientName: clients.name,
        serviceName: services.name,
        createdAt: appointments.createdAt,
      })
      .from(appointments)
      .leftJoin(clients, eq(appointments.clientId, clients.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(eq(appointments.salonId, salonId))
      .orderBy(desc(appointments.createdAt))
      .limit(10),
    // Consentimentos pendentes
    db
      .select({ count: sql<number>`COUNT(*)` })
      .from(clients)
      .where(
        and(
          eq(clients.salonId, salonId),
          eq(clients.lgpdAnonymized, false),
          eq(clients.consentGiven, false)
        )
      ),
    // Receita mes atual
    db
      .select({
        total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)`,
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.salonId, salonId),
          sql`TO_CHAR(${financialRecords.recordDate}, 'YYYY-MM') = ${month}`
        )
      ),
    // Receita mes anterior
    db
      .select({
        total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)`,
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.salonId, salonId),
          sql`TO_CHAR(${financialRecords.recordDate}, 'YYYY-MM') = ${prevMonthStr}`
        )
      ),
    // Receita por dia (mes atual) — alimenta o sparkline real do KPI
    db
      .select({
        total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)`,
      })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.salonId, salonId),
          sql`TO_CHAR(${financialRecords.recordDate}, 'YYYY-MM') = ${month}`
        )
      )
      .groupBy(financialRecords.recordDate)
      .orderBy(financialRecords.recordDate),
  ]);

  const totalAppointments =
    Number(appointmentsMonth[0]?.scheduled ?? 0) +
    Number(appointmentsMonth[0]?.completed ?? 0);
  const noShows = Number(appointmentsMonth[0]?.noShow ?? 0);
  const nsRate =
    totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0;

  // SUM/COUNT do Postgres voltam como string (numeric) — normalizar p/ número
  const revenue = Number(monthlyRevenue[0]?.total ?? 0);
  const prevRevenue = Number(prevMonthRevenue[0]?.total ?? 0);
  const revenueGrowth =
    prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

  return {
    appointmentsToday: Number(appointmentsToday[0]?.count ?? 0),
    appointmentsYesterday: Number(appointmentsYesterday[0]?.count ?? 0),
    appointmentsMonth: {
      scheduled: Number(appointmentsMonth[0]?.scheduled ?? 0),
      completed: Number(appointmentsMonth[0]?.completed ?? 0),
      cancelled: Number(appointmentsMonth[0]?.cancelled ?? 0),
      noShow: Number(appointmentsMonth[0]?.noShow ?? 0),
    },
    appointmentsPrevMonth: {
      scheduled: Number(appointmentsPrevMonth[0]?.scheduled ?? 0),
      completed: Number(appointmentsPrevMonth[0]?.completed ?? 0),
      cancelled: Number(appointmentsPrevMonth[0]?.cancelled ?? 0),
      noShow: Number(appointmentsPrevMonth[0]?.noShow ?? 0),
    },
    clientsTotal: Number(clientsTotal[0]?.count ?? 0),
    newClientsThisMonth: Number(newClientsThisMonth[0]?.count ?? 0),
    newClientsPrevMonth: Number(newClientsPrevMonth[0]?.count ?? 0),
    noShowRate: Math.round(nsRate * 10) / 10,
    upcomingAppointments,
    recentActivity,
    pendingConsents: Number(pendingConsents[0]?.count ?? 0),
    monthlyRevenue: revenue,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
    revenueByDay: revenueDaily.map(r => Number(r.total)),
  };
}

// ==========================================
// Agendamento Público (link /agendar/:slug — sem login)
// ==========================================

export async function getSalonBySlug(slug: string) {
  return getDb().query.salons.findFirst({
    where: and(eq(salons.slug, slug), eq(salons.isActive, true)),
  });
}

export async function getPublicServices(salonId: number) {
  return getDb()
    .select({
      id: services.id,
      name: services.name,
      price: services.price,
      durationMinutes: services.durationMinutes,
      category: services.category,
    })
    .from(services)
    .where(and(eq(services.salonId, salonId), eq(services.isActive, true)))
    .orderBy(services.name);
}

export async function getPublicProfessionals(salonId: number) {
  return getDb()
    .select({ id: professionals.id, name: professionals.name })
    .from(professionals)
    .where(
      and(
        eq(professionals.salonId, salonId),
        eq(professionals.isActive, true)
      )
    )
    .orderBy(professionals.name);
}

export async function getClientByPhone(salonId: number, phone: string) {
  return getDb().query.clients.findFirst({
    where: and(
      eq(clients.salonId, salonId),
      eq(clients.phone, phone),
      eq(clients.lgpdAnonymized, false)
    ),
  });
}

// ==========================================
// Status automático dos clientes (híbrido: regras + manual)
// ==========================================

/**
 * Recalcula lastVisitAt/totalVisits/totalSpent e o segmento automático
 * de todos os clientes do salão. Clientes com segmentManual = true só
 * têm os totais atualizados — o status escolhido pelo dono não mexe.
 *
 * Tem throttle de 60s por salão: o recálculo é chamado em toda
 * customer.list (várias telas) e cada UPDATE era uma ida e volta
 * sequencial ao banco remoto — era o principal gargalo de carregamento.
 * Mutações de cliente invalidam o throttle (invalidateClientSegments).
 */
const SEGMENT_REFRESH_TTL_MS = 60_000;
const segmentRefreshAt = new Map<number, number>();

export function invalidateClientSegments(salonId: number) {
  segmentRefreshAt.delete(salonId);
}

export async function refreshClientSegments(salonId: number) {
  const last = segmentRefreshAt.get(salonId);
  if (last && Date.now() - last < SEGMENT_REFRESH_TTL_MS) return;
  segmentRefreshAt.set(salonId, Date.now());

  const db = getDb();
  const [settingsRow, clientRows] = await Promise.all([
    db.query.salons.findFirst({
      where: eq(salons.id, salonId),
      columns: { settings: true },
    }),
    db.query.clients.findMany({
      where: and(eq(clients.salonId, salonId), eq(clients.lgpdAnonymized, false)),
    }),
  ]);
  const cfg = parseClientStatusSettings(settingsRow?.settings);

  // Agrega atendimentos concluídos por cliente (join com services p/ valor)
  const now = new Date();
  // início do mês no fuso de SP, calculado no SQL (servidor roda em UTC)
  const monthStart = sql<string>`(TO_CHAR(NOW() AT TIME ZONE 'America/Sao_Paulo', 'YYYY-MM') || '-01')::date`;
  const rows = await db
    .select({
      clientId: appointments.clientId,
      lastVisit: sql<string | null>`max(${appointments.appointmentDate})`,
      totalVisits: sql<number>`count(*)::int`,
      totalSpent: sql<string>`coalesce(sum(${services.price}), 0)`,
      monthVisits: sql<number>`count(*) filter (where ${appointments.appointmentDate} >= ${monthStart})::int`,
      monthSpent: sql<string>`coalesce(sum(${services.price}) filter (where ${appointments.appointmentDate} >= ${monthStart}), 0)`,
    })
    .from(appointments)
    .innerJoin(services, eq(appointments.serviceId, services.id))
    .where(
      and(eq(appointments.salonId, salonId), eq(appointments.status, "completed"))
    )
    .groupBy(appointments.clientId);

  const stats = new Map(rows.map(r => [r.clientId, r]));

  const pendingUpdates: { id: number; data: Partial<typeof clients.$inferInsert> }[] =
    [];
  for (const client of clientRows) {
    const s = stats.get(client.id);
    const lastVisitAt = s?.lastVisit ? new Date(s.lastVisit) : null;
    const totalVisits = s?.totalVisits ?? 0;
    const totalSpent = s?.totalSpent ?? "0";

    let segment = client.segment;
    if (!client.segmentManual) {
      if (totalVisits === 0) {
        segment = "new";
      } else {
        const isVip =
          cfg.mode === "spent"
            ? Number(s?.monthSpent ?? 0) >= cfg.vipThreshold
            : (s?.monthVisits ?? 0) >= cfg.vipThreshold;
        const daysSince = lastVisitAt
          ? Math.floor(
              (now.getTime() - lastVisitAt.getTime()) / (24 * 60 * 60 * 1000)
            )
          : 9999;
        if (isVip) segment = "vip";
        else if (daysSince > cfg.inactiveDays) segment = "inactive";
        else if (daysSince > cfg.atRiskDays) segment = "at_risk";
        else segment = "active";
      }
    }

    if (
      segment !== client.segment ||
      totalVisits !== client.totalVisits ||
      String(totalSpent) !== String(client.totalSpent) ||
      (lastVisitAt?.getTime() ?? null) !== (client.lastVisitAt?.getTime() ?? null)
    ) {
      pendingUpdates.push({
        id: client.id,
        data: { segment, totalVisits, totalSpent, lastVisitAt },
      });
    }
  }

  // UPDATEs em paralelo (antes eram sequenciais — N idas e voltas ao banco)
  await Promise.all(
    pendingUpdates.map(u =>
      db.update(clients).set(u.data).where(eq(clients.id, u.id))
    )
  );
}
