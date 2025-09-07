import mongoose, { Schema, Document } from 'mongoose';

// Interface para conteo diario de mensajes
export interface DailyMessageCount extends Document {
  date: string; // Format: YYYY-MM-DD
  guildId: string;
  userId: string;
  username: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para configuración de guilds
export interface GuildConfig extends Document {
  guildId: string;
  logChannelId?: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema para conteo diario de mensajes
const DailyMessageCountSchema = new Schema<DailyMessageCount>({
  date: { type: String, required: true },
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  messageCount: { type: Number, default: 0, required: true }
}, {
  timestamps: true,
  collection: 'daily_message_counts'
});

// Índice compuesto para optimizar consultas
DailyMessageCountSchema.index({ date: 1, guildId: 1, userId: 1 }, { unique: true });
DailyMessageCountSchema.index({ date: 1, guildId: 1, messageCount: -1 }); // Para rankings

// Schema para configuración de guilds
const GuildConfigSchema = new Schema<GuildConfig>({
  guildId: { type: String, required: true, unique: true },
  logChannelId: { type: String, required: false },
  timezone: { type: String, default: 'UTC', required: true }
}, {
  timestamps: true,
  collection: 'guild_configs'
});

// Modelos
export const DailyMessageCountModel = mongoose.model<DailyMessageCount>('DailyMessageCount', DailyMessageCountSchema);
export const GuildConfigModel = mongoose.model<GuildConfig>('GuildConfig', GuildConfigSchema);

// Tipos para compatibilidad con el código existente
export type InsertDailyMessageCount = {
  date: string;
  guildId: string;
  userId: string;
  username: string;
  messageCount?: number;
};

export type InsertGuildConfig = {
  guildId: string;
  logChannelId?: string | null;
  timezone?: string;
};