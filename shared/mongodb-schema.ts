import mongoose, { Schema, Document } from 'mongoose';

// DailyMessageCount interface
export interface IDailyMessageCount extends Document {
  date: string; // YYYY-MM-DD format
  guildId: string;
  userId: string;
  username: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// GuildConfig interface
export interface IGuildConfig extends Document {
  guildId: string;
  logChannelId?: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

// DailyMessageCount schema
const dailyMessageCountSchema = new Schema<IDailyMessageCount>({
  date: { type: String, required: true },
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  messageCount: { type: Number, default: 0, required: true }
}, {
  timestamps: true,
  collection: 'daily_message_counts'
});

// Create compound index for unique daily message counts
dailyMessageCountSchema.index({ date: 1, guildId: 1, userId: 1 }, { unique: true });

// GuildConfig schema
const guildConfigSchema = new Schema<IGuildConfig>({
  guildId: { type: String, required: true, unique: true },
  logChannelId: { type: String, default: null },
  timezone: { type: String, default: "UTC", required: true }
}, {
  timestamps: true,
  collection: 'guild_configs'
});

// Export models
export const DailyMessageCountModel = mongoose.model<IDailyMessageCount>('DailyMessageCount', dailyMessageCountSchema);
export const GuildConfigModel = mongoose.model<IGuildConfig>('GuildConfig', guildConfigSchema);

// Types for compatibility with existing code
export type DailyMessageCount = {
  date: string;
  guildId: string;
  userId: string;
  username: string;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type GuildConfig = {
  guildId: string;
  logChannelId?: string | null;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type InsertDailyMessageCount = Omit<DailyMessageCount, 'createdAt' | 'updatedAt'>;
export type InsertGuildConfig = Omit<GuildConfig, 'createdAt' | 'updatedAt'>;