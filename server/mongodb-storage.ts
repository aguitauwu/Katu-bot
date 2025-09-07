import mongoose from 'mongoose';
import { 
  DailyMessageCountModel, 
  GuildConfigModel, 
  type DailyMessageCount, 
  type GuildConfig,
  type InsertDailyMessageCount,
  type InsertGuildConfig
} from '../shared/mongodb-schema.js';
import { IStorage } from './storage.js';

export class MongoStorage implements IStorage {
  private isConnected = false;

  async connect(connectionString: string): Promise<void> {
    try {
      if (this.isConnected) {
        return;
      }

      await mongoose.connect(connectionString);
      this.isConnected = true;
      console.log('✅ Conectado a MongoDB');
    } catch (error) {
      console.error('❌ Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async getDailyMessageCount(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    try {
      const result = await DailyMessageCountModel.findOne({ date, guildId, userId });
      return result || undefined;
    } catch (error) {
      console.error('Error getting daily message count:', error);
      return undefined;
    }
  }

  async incrementMessageCount(date: string, guildId: string, userId: string, username: string): Promise<DailyMessageCount> {
    try {
      const result = await DailyMessageCountModel.findOneAndUpdate(
        { date, guildId, userId },
        { 
          $inc: { messageCount: 1 },
          $set: { username } // Actualizar username en caso de que haya cambiado
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      return result;
    } catch (error) {
      console.error('Error incrementing message count:', error);
      throw error;
    }
  }

  async getDailyRanking(date: string, guildId: string, limit: number = 100): Promise<DailyMessageCount[]> {
    try {
      const results = await DailyMessageCountModel
        .find({ date, guildId })
        .sort({ messageCount: -1 })
        .limit(limit)
        .exec();
      return results;
    } catch (error) {
      console.error('Error getting daily ranking:', error);
      return [];
    }
  }

  async getUserDailyStats(date: string, guildId: string, userId: string): Promise<DailyMessageCount | undefined> {
    return this.getDailyMessageCount(date, guildId, userId);
  }

  async getTotalMessagesForDay(date: string, guildId: string): Promise<number> {
    try {
      const result = await DailyMessageCountModel.aggregate([
        { $match: { date, guildId } },
        { $group: { _id: null, total: { $sum: '$messageCount' } } }
      ]);
      return result.length > 0 ? result[0].total : 0;
    } catch (error) {
      console.error('Error getting total messages for day:', error);
      return 0;
    }
  }

  async getGuildConfig(guildId: string): Promise<GuildConfig | undefined> {
    try {
      const result = await GuildConfigModel.findOne({ guildId });
      return result || undefined;
    } catch (error) {
      console.error('Error getting guild config:', error);
      return undefined;
    }
  }

  async setGuildLogChannel(guildId: string, logChannelId: string | null): Promise<GuildConfig> {
    try {
      const result = await GuildConfigModel.findOneAndUpdate(
        { guildId },
        { 
          logChannelId: logChannelId || undefined,
          $setOnInsert: { timezone: 'UTC' }
        },
        { 
          upsert: true, 
          new: true,
          setDefaultsOnInsert: true
        }
      );
      return result;
    } catch (error) {
      console.error('Error setting guild log channel:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await mongoose.disconnect();
      this.isConnected = false;
      console.log('✅ Desconectado de MongoDB');
    } catch (error) {
      console.error('❌ Error desconectando de MongoDB:', error);
    }
  }

  // Método para limpiar datos antiguos (opcional)
  async cleanOldData(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      const cutoffDateString = cutoffDate.toISOString().split('T')[0];

      const result = await DailyMessageCountModel.deleteMany({
        date: { $lt: cutoffDateString }
      });

      console.log(`🧹 Limpieza de datos: eliminados ${result.deletedCount} registros antiguos`);
    } catch (error) {
      console.error('Error cleaning old data:', error);
    }
  }
}

export const mongoStorage = new MongoStorage();