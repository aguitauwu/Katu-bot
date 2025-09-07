import { type DailyMessageCount, type InsertDailyMessageCount, type GuildConfig, type InsertGuildConfig } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Daily message count operations
  getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined>;
  incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount>;
  getDailyRanking(date: string, guildId: string, limit?: number): Promise<DailyMessageCount[]>;
  getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined>;
  getTotalMessagesForDay(date: string, guildId: string): Promise<number>;
  
  // Guild configuration operations
  getGuildConfig(guildId: string): Promise<GuildConfig | undefined>;
  setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig>;
}

export class MemStorage implements IStorage {
  private dailyMessageCounts: Map<string, DailyMessageCount>;
  private guildConfigs: Map<string, GuildConfig>;

  constructor() {
    this.dailyMessageCounts = new Map();
    this.guildConfigs = new Map();
  }

  private getMessageCountKey(date: string, guildId: string, userId: string): string {
    return `${date}:${guildId}:${userId}`;
  }

  async getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    const key = this.getMessageCountKey(date, guildId, userId);
    return this.dailyMessageCounts.get(key);
  }

  async incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount> {
    const key = this.getMessageCountKey(date, guildId, userId);
    const existing = this.dailyMessageCounts.get(key);
    
    if (existing) {
      const updated: DailyMessageCount = {
        ...existing,
        messageCount: existing.messageCount + 1,
        username, // Update username in case it changed
        updatedAt: new Date(),
      };
      this.dailyMessageCounts.set(key, updated);
      return updated;
    } else {
      const newCount: DailyMessageCount = {
        id: randomUUID(),
        date,
        guildId,
        userId,
        username,
        messageCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.dailyMessageCounts.set(key, newCount);
      return newCount;
    }
  }

  async getDailyRanking(date: string, guildId: string, limit: number = 100): Promise<DailyMessageCount[]> {
    const counts = Array.from(this.dailyMessageCounts.values())
      .filter(count => count.date === date && count.guildId === guildId)
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, limit);
    
    return counts;
  }

  async getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    return this.getDailyMessageCount(date, guildId, userId);
  }

  async getTotalMessagesForDay(date: string, guildId: string): Promise<number> {
    const counts = Array.from(this.dailyMessageCounts.values())
      .filter(count => count.date === date && count.guildId === guildId);
    
    return counts.reduce((total, count) => total + count.messageCount, 0);
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig | undefined> {
    return this.guildConfigs.get(guildId);
  }

  async setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig> {
    const existing = this.guildConfigs.get(guildId);
    
    if (existing) {
      const updated: GuildConfig = {
        ...existing,
        logChannelId,
        updatedAt: new Date(),
      };
      this.guildConfigs.set(guildId, updated);
      return updated;
    } else {
      const newConfig: GuildConfig = {
        id: randomUUID(),
        guildId,
        logChannelId,
        timezone: "UTC",
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.guildConfigs.set(guildId, newConfig);
      return newConfig;
    }
  }
}

export const storage = new MemStorage();
