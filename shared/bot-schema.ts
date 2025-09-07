import { pgTable, text, varchar, integer, timestamp, primaryKey } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Daily message count table
export const dailyMessageCounts = pgTable("daily_message_counts", {
  date: text("date").notNull(), // YYYY-MM-DD format
  guildId: varchar("guild_id", { length: 20 }).notNull(),
  userId: varchar("user_id", { length: 20 }).notNull(),
  username: text("username").notNull(),
  messageCount: integer("message_count").default(0).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.date, table.guildId, table.userId] })
}));

// Guild configuration table
export const guildConfigs = pgTable("guild_configs", {
  guildId: varchar("guild_id", { length: 20 }).primaryKey(),
  logChannelId: varchar("log_channel_id", { length: 20 }),
  timezone: text("timezone").default("UTC").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

// Insert schemas
export const insertDailyMessageCountSchema = createInsertSchema(dailyMessageCounts).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertGuildConfigSchema = createInsertSchema(guildConfigs).omit({
  createdAt: true,
  updatedAt: true,
});

// Types
export type DailyMessageCount = typeof dailyMessageCounts.$inferSelect;
export type InsertDailyMessageCount = z.infer<typeof insertDailyMessageCountSchema>;
export type GuildConfig = typeof guildConfigs.$inferSelect;
export type InsertGuildConfig = z.infer<typeof insertGuildConfigSchema>;
