import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./connection";
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
    .onConflictDoUpdate({ target: salonUsers.userId, set: { role, isActive: true } });
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

export async function getClientsBySalon(salonId: number, limit = 100) {
  return getDb()
    .select()
    .from(clients)
    .where(and(eq(clients.salonId, salonId), eq(clients.lgpdAnonymized, false)))
    .orderBy(desc(clients.createdAt))
    .limit(limit);
}

export async function getClientById(id: number, salonId: number) {
  return getDb()
    .query.clients.findFirst({
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
      email: null,
      phone: "",
      cpf: null,
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

export async function getServicesBySalon(salonId: number) {
  return getDb()
    .select()
    .from(services)
    .where(and(eq(services.salonId, salonId), eq(services.isActive, true)))
    .orderBy(services.name);
}

export async function getServiceById(id: number, salonId: number) {
  return getDb()
    .query.services.findFirst({
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

// ==========================================
// Professionals
// ==========================================
export async function createProfessional(data: InsertProfessional) {
  const db = getDb();
  const [{ id }] = await db.insert(professionals).values(data).returning();
  return db.query.professionals.findFirst({ where: eq(professionals.id, id) });
}

export async function getProfessionalsBySalon(salonId: number) {
  return getDb()
    .select()
    .from(professionals)
    .where(and(eq(professionals.salonId, salonId), eq(professionals.isActive, true)))
    .orderBy(professionals.name);
}

export async function getProfessionalById(id: number, salonId: number) {
  return getDb()
    .query.professionals.findFirst({
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
  let conditions = [eq(appointments.salonId, salonId)];
  if (fromDate) conditions.push(sql`${appointments.appointmentDate} >= ${fromDate}`);
  if (toDate) conditions.push(sql`${appointments.appointmentDate} <= ${toDate}`);

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
  let conditions = [
    eq(appointments.salonId, salonId),
    eq(appointments.professionalId, professionalId),
  ];
  if (fromDate) conditions.push(sql`${appointments.appointmentDate} >= ${fromDate}`);
  if (toDate) conditions.push(sql`${appointments.appointmentDate} <= ${toDate}`);

  return getDb()
    .select()
    .from(appointments)
    .where(and(...conditions))
    .orderBy(appointments.appointmentDate, appointments.startTime);
}

export async function getAppointmentById(id: number, salonId: number) {
  return getDb()
    .query.appointments.findFirst({
      where: and(eq(appointments.id, id), eq(appointments.salonId, salonId)),
    });
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
  let conditions = [eq(financialRecords.salonId, salonId)];
  if (fromDate) conditions.push(sql`${financialRecords.recordDate} >= ${fromDate}`);
  if (toDate) conditions.push(sql`${financialRecords.recordDate} <= ${toDate}`);

  return getDb()
    .select()
    .from(financialRecords)
    .where(and(...conditions))
    .orderBy(desc(financialRecords.recordDate));
}

export async function getFinancialSummaryBySalon(salonId: number, month?: string) {
  // month format: YYYY-MM
  let dateCondition = sql`1=1`;
  if (month) {
    dateCondition = sql`TO_CHAR(${financialRecords.recordDate}, 'YYYY-MM') = ${month}`;
  }

  const result = await getDb()
    .select({
      totalRevenue: sql<number>`COALESCE(SUM(CASE WHEN ${financialRecords.type} != 'refund' THEN ${financialRecords.amount} ELSE 0 END), 0)`,
      totalRefunds: sql<number>`COALESCE(SUM(CASE WHEN ${financialRecords.type} = 'refund' THEN ABS(${financialRecords.amount}) ELSE 0 END), 0)`,
      totalCommission: sql<number>`COALESCE(SUM(${financialRecords.commissionAmount}), 0)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(financialRecords)
    .where(
      and(
        eq(financialRecords.salonId, salonId),
        // Filtro isPaid removido - nao existe no schema
        dateCondition
      )
    );

  return result[0];
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

export async function getCommunicationsByClient(clientId: number, salonId: number) {
  return getDb()
    .select()
    .from(communications)
    .where(and(eq(communications.clientId, clientId), eq(communications.salonId, salonId)))
    .orderBy(desc(communications.createdAt));
}

export async function getCommunicationsBySalon(salonId: number, limit = 50) {
  return getDb()
    .select()
    .from(communications)
    .where(eq(communications.salonId, salonId))
    .orderBy(desc(communications.createdAt))
    .limit(limit);
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
    .select()
    .from(consentForms)
    .where(and(eq(consentForms.salonId, salonId), eq(consentForms.isActive, true)))
    .orderBy(consentForms.title);
}

export async function getConsentFormById(id: number, salonId: number) {
  return getDb()
    .query.consentForms.findFirst({
      where: and(eq(consentForms.id, id), eq(consentForms.salonId, salonId)),
    });
}

export async function createConsentSignature(data: InsertConsentSignature) {
  const db = getDb();
  const [{ id }] = await db.insert(consentSignatures).values(data).returning();
  return db.query.consentSignatures.findFirst({
    where: eq(consentSignatures.id, id),
  });
}

export async function getConsentSignaturesByClient(clientId: number, salonId: number) {
  return getDb()
    .select()
    .from(consentSignatures)
    .where(and(eq(consentSignatures.clientId, clientId), eq(consentSignatures.salonId, salonId)))
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
export async function getDashboardMetrics(salonId: number, month: string) {
  const db = getDb();

  const today = new Date().toISOString().split("T")[0];
  const currentDate = new Date();
  const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
  const prevMonthStr = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, "0")}`;

  const [
    appointmentsToday,
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
      .where(and(eq(clients.salonId, salonId), eq(clients.lgpdAnonymized, false))),
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
      .leftJoin(professionals, eq(appointments.professionalId, professionals.id))
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
      .select({ total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)` })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.salonId, salonId),
          sql`TO_CHAR(${financialRecords.recordDate}, 'YYYY-MM') = ${month}`
        )
      ),
    // Receita mes anterior
    db
      .select({ total: sql<number>`COALESCE(SUM(${financialRecords.amount}), 0)` })
      .from(financialRecords)
      .where(
        and(
          eq(financialRecords.salonId, salonId),
          sql`TO_CHAR(${financialRecords.recordDate}, 'YYYY-MM') = ${prevMonthStr}`
        )
      ),
  ]);

  const totalAppointments = (appointmentsMonth[0]?.scheduled || 0) + (appointmentsMonth[0]?.completed || 0);
  const noShows = appointmentsMonth[0]?.noShow || 0;
  const nsRate = totalAppointments > 0 ? (noShows / totalAppointments) * 100 : 0;

  const revenue = monthlyRevenue[0]?.total || 0;
  const prevRevenue = prevMonthRevenue[0]?.total || 0;
  const revenueGrowth = prevRevenue > 0 ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0;

  return {
    appointmentsToday: appointmentsToday[0]?.count || 0,
    appointmentsMonth: {
      scheduled: appointmentsMonth[0]?.scheduled || 0,
      completed: appointmentsMonth[0]?.completed || 0,
      cancelled: appointmentsMonth[0]?.cancelled || 0,
      noShow: appointmentsMonth[0]?.noShow || 0,
    },
    appointmentsPrevMonth: {
      scheduled: appointmentsPrevMonth[0]?.scheduled || 0,
      completed: appointmentsPrevMonth[0]?.completed || 0,
      cancelled: appointmentsPrevMonth[0]?.cancelled || 0,
      noShow: appointmentsPrevMonth[0]?.noShow || 0,
    },
    clientsTotal: clientsTotal[0]?.count || 0,
    newClientsThisMonth: newClientsThisMonth[0]?.count || 0,
    newClientsPrevMonth: newClientsPrevMonth[0]?.count || 0,
    noShowRate: Math.round(nsRate * 10) / 10,
    upcomingAppointments,
    recentActivity,
    pendingConsents: pendingConsents[0]?.count || 0,
    monthlyRevenue: revenue,
    revenueGrowth: Math.round(revenueGrowth * 10) / 10,
  };
}
