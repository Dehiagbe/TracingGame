
import { pgTable, text, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const attempts = pgTable("attempts", {
  id: serial("id").primaryKey(),
  shape: text("shape").notNull(),
  attentionScore: integer("attention_score").notNull(), // 0-100
  precisionScore: integer("precision_score").notNull(), // 0-100
  assistanceCount: integer("assistance_count").notNull(),
  durationMs: integer("duration_ms").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertAttemptSchema = createInsertSchema(attempts).omit({ 
  id: true, 
  completedAt: true 
});

export type Attempt = typeof attempts.$inferSelect;
export type InsertAttempt = z.infer<typeof insertAttemptSchema>;
