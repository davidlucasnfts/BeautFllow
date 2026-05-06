import { relations } from "drizzle-orm";
import {
  users,
  salons,
  salonUsers,
  clients,
  services,
  professionals,
  appointments,
  consentForms,
  consentSignatures,
  communications,
  financialRecords,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  salonUsers: many(salonUsers),
}));

export const salonsRelations = relations(salons, ({ many }) => ({
  salonUsers: many(salonUsers),
  clients: many(clients),
  services: many(services),
  professionals: many(professionals),
  appointments: many(appointments),
  consentForms: many(consentForms),
  communications: many(communications),
  financialRecords: many(financialRecords),
}));

export const salonUsersRelations = relations(salonUsers, ({ one }) => ({
  user: one(users, { fields: [salonUsers.userId], references: [users.id] }),
  salon: one(salons, { fields: [salonUsers.salonId], references: [salons.id] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  salon: one(salons, { fields: [clients.salonId], references: [salons.id] }),
  appointments: many(appointments),
  communications: many(communications),
  financialRecords: many(financialRecords),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  salon: one(salons, { fields: [services.salonId], references: [salons.id] }),
  appointments: many(appointments),
  consentForms: many(consentForms),
}));

export const professionalsRelations = relations(professionals, ({ one, many }) => ({
  salon: one(salons, { fields: [professionals.salonId], references: [salons.id] }),
  appointments: many(appointments),
  financialRecords: many(financialRecords),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  salon: one(salons, { fields: [appointments.salonId], references: [salons.id] }),
  client: one(clients, { fields: [appointments.clientId], references: [clients.id] }),
  professional: one(professionals, { fields: [appointments.professionalId], references: [professionals.id] }),
  service: one(services, { fields: [appointments.serviceId], references: [services.id] }),
  communications: many(communications),
  financialRecords: many(financialRecords),
}));

export const consentFormsRelations = relations(consentForms, ({ one, many }) => ({
  salon: one(salons, { fields: [consentForms.salonId], references: [salons.id] }),
  signatures: many(consentSignatures),
}));

export const consentSignaturesRelations = relations(consentSignatures, ({ one }) => ({
  salon: one(salons, { fields: [consentSignatures.salonId], references: [salons.id] }),
  form: one(consentForms, { fields: [consentSignatures.formId], references: [consentForms.id] }),
  client: one(clients, { fields: [consentSignatures.clientId], references: [clients.id] }),
}));

export const communicationsRelations = relations(communications, ({ one }) => ({
  salon: one(salons, { fields: [communications.salonId], references: [salons.id] }),
  client: one(clients, { fields: [communications.clientId], references: [clients.id] }),
  appointment: one(appointments, { fields: [communications.appointmentId], references: [appointments.id] }),
}));

export const financialRecordsRelations = relations(financialRecords, ({ one }) => ({
  salon: one(salons, { fields: [financialRecords.salonId], references: [salons.id] }),
  client: one(clients, { fields: [financialRecords.clientId], references: [clients.id] }),
  professional: one(professionals, { fields: [financialRecords.professionalId], references: [professionals.id] }),
  appointment: one(appointments, { fields: [financialRecords.appointmentId], references: [appointments.id] }),
}));
