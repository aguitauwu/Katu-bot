import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Daily message counts organized by date and guild
export const dailyMessageCounts = pgTable("daily_message_counts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  date: text("date").notNull(), // Format: YYYY-MM-DD
  guildId: text("guild_id").notNull(),
  userId: text("user_id").notNull(),
  username: text("username").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Guild configurations for log channels
export const guildConfigs = pgTable("guild_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  guildId: text("guild_id").notNull().unique(),
  logChannelId: text("log_channel_id"),
  timezone: text("timezone").default("UTC").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDailyMessageCountSchema = createInsertSchema(dailyMessageCounts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGuildConfigSchema = createInsertSchema(guildConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertDailyMessageCount = z.infer<typeof insertDailyMessageCountSchema>;
export type DailyMessageCount = typeof dailyMessageCounts.$inferSelect;

export type InsertGuildConfig = z.infer<typeof insertGuildConfigSchema>;
export type GuildConfig = typeof guildConfigs.$inferSelect;
