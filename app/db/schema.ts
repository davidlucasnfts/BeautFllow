import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  bigint,
  decimal,
  boolean,
  date,
  time,
  integer,
  index,
} from "drizzle-orm/pg-core";

// ==========================================
// Enums
// ==========================================
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const planEnum = pgEnum("plan", ["free", "essential", "pro", "business"]);
export const salonUserRoleEnum = pgEnum("salon_user_role", ["owner", "admin", "professional", "receptionist"]);
export const clientSegmentEnum = pgEnum("client_segment", ["new", "active", "vip", "at_risk", "inactive"]);
export const appointmentStatusEnum = pgEnum("appointment_status", ["scheduled", "confirmed", "checked_in", "in_progress", "completed", "no_show", "cancelled"]);
export const bookingSourceEnum = pgEnum("booking_source", ["online", "whatsapp", "phone", "walk_in", "staff"]);
export const communicationChannelEnum = pgEnum("communication_channel", ["whatsapp", "sms", "email", "phone", "in_app"]);
export const communicationDirectionEnum = pgEnum("communication_direction", ["outbound", "inbound"]);
export const communicationTypeEnum = pgEnum("communication_type", ["confirmation", "reminder", "check_in", "post_care", "reactivation", "campaign", "manual"]);
export const communicationStatusEnum = pgEnum("communication_status", ["pending", "sent", "delivered", "read", "failed"]);
export const recordTypeEnum = pgEnum("record_type", ["service", "product", "package", "refund", "other"]);
export const paymentMethodEnum = pgEnum("payment_method", ["pix", "credit_card", "debit_card", "cash", "other"]);

// ==========================================
// Core Users (OAuth-authenticated)
// ==========================================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

// ==========================================
// Local Auth (email + password)
// ==========================================
export const localUsers = pgTable("local_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("last_sign_in_at").defaultNow().notNull(),
});

export type LocalUser = typeof localUsers.$inferSelect;
export type InsertLocalUser = typeof localUsers.$inferInsert;

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ==========================================
// Salons (Tenants)
// ==========================================
export const salons = pgTable("salons", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 50 }),
  logoUrl: text("logoUrl"),
  plan: planEnum("plan").default("free").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  settings: text("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Salon = typeof salons.$inferSelect;
export type InsertSalon = typeof salons.$inferInsert;

// ==========================================
// Salon Users (RBAC per tenant)
// ==========================================
export const salonUsers = pgTable(
  "salon_users",
  {
    id: serial("id").primaryKey(),
    userId: bigint("userId", { mode: "number" }).notNull(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    role: salonUserRoleEnum("role").default("professional").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    userSalonIdx: index("user_salon_idx").on(table.userId, table.salonId),
    salonIdx: index("salon_users_salon_idx").on(table.salonId),
  })
);

export type SalonUser = typeof salonUsers.$inferSelect;
export type InsertSalonUser = typeof salonUsers.$inferInsert;

// ==========================================
// Clients (CRM)
// ==========================================
export const clients = pgTable(
  "clients",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }).notNull(),
    birthDate: date("birthDate"),
    cpf: varchar("cpf", { length: 14 }),
    notes: text("notes"),
    tags: text("tags"),
    segment: clientSegmentEnum("segment").default("new").notNull(),
    lastVisitAt: timestamp("lastVisitAt"),
    totalVisits: integer("totalVisits").default(0).notNull(),
    totalSpent: decimal("totalSpent", { precision: 12, scale: 2 }).default("0.00").notNull(),
    consentGiven: boolean("consentGiven").default(false).notNull(),
    consentGivenAt: timestamp("consentGivenAt"),
    lgpdAnonymized: boolean("lgpdAnonymized").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    salonIdx: index("clients_salon_idx").on(table.salonId),
    phoneIdx: index("clients_phone_idx").on(table.phone),
    segmentIdx: index("clients_segment_idx").on(table.segment),
  })
);

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// ==========================================
// Services Catalog
// ==========================================
export const services = pgTable(
  "services",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    durationMinutes: integer("durationMinutes").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    color: varchar("color", { length: 7 }).default("#6366f1"),
    isActive: boolean("isActive").default(true).notNull(),
    requiresConsent: boolean("requiresConsent").default(false).notNull(),
    preCareInstructions: text("preCareInstructions"),
    postCareInstructions: text("postCareInstructions"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    salonIdx: index("services_salon_idx").on(table.salonId),
  })
);

export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;

// ==========================================
// Professionals
// ==========================================
export const professionals = pgTable(
  "professionals",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 50 }),
    bio: text("bio"),
    color: varchar("color", { length: 7 }).default("#10b981"),
    commissionRate: decimal("commissionRate", { precision: 5, scale: 2 }).default("0.00"),
    workingHours: text("workingHours"),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    salonIdx: index("professionals_salon_idx").on(table.salonId),
  })
);

export type Professional = typeof professionals.$inferSelect;
export type InsertProfessional = typeof professionals.$inferInsert;

// ==========================================
// Appointments
// ==========================================
export const appointments = pgTable(
  "appointments",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    clientId: bigint("clientId", { mode: "number" }).notNull(),
    serviceId: bigint("serviceId", { mode: "number" }).notNull(),
    professionalId: bigint("professionalId", { mode: "number" }),
    appointmentDate: date("appointmentDate").notNull(),
    startTime: time("startTime").notNull(),
    endTime: time("endTime"),
    status: appointmentStatusEnum("status").default("scheduled").notNull(),
    notes: text("notes"),
    source: bookingSourceEnum("source").default("staff").notNull(),
    checkedInAt: timestamp("checkedInAt"),
    completedAt: timestamp("completedAt"),
    cancelledAt: timestamp("cancelledAt"),
    cancellationReason: text("cancellationReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    salonIdx: index("appointments_salon_idx").on(table.salonId),
    dateIdx: index("appointments_date_idx").on(table.appointmentDate),
    clientIdx: index("appointments_client_idx").on(table.clientId),
  })
);

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

// ==========================================
// Communications (Omnichannel)
// ==========================================
export const communications = pgTable(
  "communications",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    clientId: bigint("clientId", { mode: "number" }).notNull(),
    appointmentId: bigint("appointmentId", { mode: "number" }),
    type: communicationTypeEnum("type").default("manual").notNull(),
    channel: communicationChannelEnum("channel").default("whatsapp").notNull(),
    direction: communicationDirectionEnum("direction").default("outbound").notNull(),
    content: text("content").notNull(),
    status: communicationStatusEnum("status").default("pending").notNull(),
    sentAt: timestamp("sentAt"),
    deliveredAt: timestamp("deliveredAt"),
    readAt: timestamp("readAt"),
    externalId: varchar("externalId", { length: 255 }),
    errorMessage: text("errorMessage"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    salonIdx: index("communications_salon_idx").on(table.salonId),
    clientIdx: index("communications_client_idx").on(table.clientId),
  })
);

export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = typeof communications.$inferInsert;

// ==========================================
// Financial Records
// ==========================================
export const financialRecords = pgTable(
  "financial_records",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    clientId: bigint("clientId", { mode: "number" }),
    professionalId: bigint("professionalId", { mode: "number" }),
    appointmentId: bigint("appointmentId", { mode: "number" }),
    type: recordTypeEnum("type").default("service").notNull(),
    description: varchar("description", { length: 255 }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    commissionAmount: decimal("commissionAmount", { precision: 10, scale: 2 }).default("0.00"),
    paymentMethod: paymentMethodEnum("paymentMethod").default("pix").notNull(),
    recordDate: date("recordDate").notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    salonIdx: index("financial_salon_idx").on(table.salonId),
    dateIdx: index("financial_date_idx").on(table.recordDate),
  })
);

export type FinancialRecord = typeof financialRecords.$inferSelect;
export type InsertFinancialRecord = typeof financialRecords.$inferInsert;

// ==========================================
// Consent Forms
// ==========================================
export const consentForms = pgTable(
  "consent_forms",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    isRequired: boolean("isRequired").default(true).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    salonIdx: index("consent_forms_salon_idx").on(table.salonId),
  })
);

export type ConsentForm = typeof consentForms.$inferSelect;
export type InsertConsentForm = typeof consentForms.$inferInsert;

// ==========================================
// Consent Signatures
// ==========================================
export const consentSignatures = pgTable(
  "consent_signatures",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }).notNull(),
    clientId: bigint("clientId", { mode: "number" }).notNull(),
    formId: bigint("formId", { mode: "number" }).notNull(),
    signatureData: text("signatureData"),
    signedAt: timestamp("signedAt").defaultNow().notNull(),
    ipAddress: varchar("ipAddress", { length: 45 }),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    clientIdx: index("consent_signatures_client_idx").on(table.clientId),
    formIdx: index("consent_signatures_form_idx").on(table.formId),
  })
);

export type ConsentSignature = typeof consentSignatures.$inferSelect;
export type InsertConsentSignature = typeof consentSignatures.$inferInsert;

// ==========================================
// Audit Logs
// ==========================================
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    salonId: bigint("salonId", { mode: "number" }),
    userId: bigint("userId", { mode: "number" }),
    action: varchar("action", { length: 50 }).notNull(),
    entityType: varchar("entityType", { length: 50 }).notNull(),
    entityId: bigint("entityId", { mode: "number" }),
    oldValue: text("oldValue"),
    newValue: text("newValue"),
    ipAddress: varchar("ipAddress", { length: 45 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    salonIdx: index("audit_logs_salon_idx").on(table.salonId),
    createdAtIdx: index("audit_logs_created_at_idx").on(table.createdAt),
  })
);

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
