import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Members table
export const members = pgTable("members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["Admin", "NonAdmin"] }).notNull().default("NonAdmin"),
  studentStatus: text("student_status", { enum: ["PhD", "MTech", "BTech", "Intern"] }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  internExpirationDate: timestamp("intern_expiration_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  presenterId: varchar("presenter_id").notNull(),
  type: text("type", { enum: ["PaperPresentation", "WorkPresentation", "Tutorial"] }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format in IST
  endTime: text("end_time").notNull(), // HH:MM format in IST
  description: text("description"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
  deletedAt: timestamp("deleted_at"),
});

// Rotation table
export const rotation = pgTable("rotation", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  memberId: varchar("member_id").notNull(),
  orderIndex: integer("order_index").notNull(),
  active: boolean("active").notNull().default(true),
  lastPresentedAt: timestamp("last_presented_at"),
});

// Announcements table
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at"),
  deletedAt: timestamp("deleted_at"),
});

// Audit log table
export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  action: text("action", { enum: ["CREATE", "UPDATE", "DELETE"] }).notNull(),
  entityType: text("entity_type", { enum: ["MEMBER", "MEETING", "ROTATION", "ANNOUNCEMENT"] }).notNull(),
  entityId: varchar("entity_id").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  metadata: text("metadata"), // JSON string for additional data
});

// Insert schemas
export const insertMemberSchema = createInsertSchema(members).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const insertRotationSchema = createInsertSchema(rotation).omit({
  id: true,
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({
  id: true,
  createdAt: true,
  deletedAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
});

// Types
export type Member = typeof members.$inferSelect;
export type InsertMember = z.infer<typeof insertMemberSchema>;
export type Meeting = typeof meetings.$inferSelect;
export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Rotation = typeof rotation.$inferSelect;
export type InsertRotation = z.infer<typeof insertRotationSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;

// Additional types for frontend
export type MeetingType = "PaperPresentation" | "WorkPresentation" | "Tutorial";
export type StudentStatus = "PhD" | "MTech" | "BTech" | "Intern";
export type AuditAction = "CREATE" | "UPDATE" | "DELETE";
export type EntityType = "MEMBER" | "MEETING" | "ROTATION" | "ANNOUNCEMENT";
