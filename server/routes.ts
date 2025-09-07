import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getCurrentDateUTC } from "./utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes for Katu Bot data access
  
  // Get daily ranking for a specific guild
  app.get('/api/guild/:guildId/ranking', async (req, res) => {
    try {
      const { guildId } = req.params;
      const currentDate = getCurrentDateUTC();
      const limit = parseInt(req.query.limit as string) || 100;
      
      const ranking = await storage.getDailyRanking(currentDate, guildId, limit);
      const totalMessages = await storage.getTotalMessagesForDay(currentDate, guildId);
      
      res.json({
        date: currentDate,
        guildId,
        totalMessages,
        ranking: ranking.slice(0, 20) // Limit to top 20 for web display
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching ranking data' });
    }
  });

  // Get overall stats across all guilds
  app.get('/api/stats/today', async (req, res) => {
    try {
      const currentDate = getCurrentDateUTC();
      
      res.json({
        date: currentDate,
        message: "Use /api/guild/{guildId}/ranking to get specific guild data",
        currentTime: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching stats' });
    }
  });

  // Debug endpoint to see if the bot is counting messages
  app.get('/api/debug/storage', async (req, res) => {
    try {
      const currentDate = getCurrentDateUTC();
      
      // Get the MemStorage instance to inspect its data
      const memStorage = storage as any;
      const messageCountsMap: Map<string, any> = memStorage.dailyMessageCounts;
      const guildConfigsMap: Map<string, any> = memStorage.guildConfigs;
      
      // Convert Maps to arrays for JSON serialization
      const messageCounts: any[] = [];
      messageCountsMap.forEach((value, key) => {
        messageCounts.push({ key, value });
      });
      
      const guildConfigs: any[] = [];
      guildConfigsMap.forEach((value, key) => {
        guildConfigs.push({ key, value });
      });
      
      res.json({
        currentDate,
        messageCounts,
        guildConfigs,
        totalEntries: messageCounts.length,
        hasData: messageCounts.length > 0,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Debug storage error:', error);
      res.status(500).json({ error: 'Error accessing storage debug data', details: error.message });
    }
  });

  // Get user stats for a specific guild
  app.get('/api/guild/:guildId/user/:userId/stats', async (req, res) => {
    try {
      const { guildId, userId } = req.params;
      const currentDate = getCurrentDateUTC();
      
      const userStats = await storage.getUserDailyStats(currentDate, guildId, userId);
      const ranking = await storage.getDailyRanking(currentDate, guildId, 1000);
      const userRank = ranking.findIndex(user => user.userId === userId) + 1;
      
      res.json({
        date: currentDate,
        userStats,
        rank: userRank,
        totalUsers: ranking.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user stats' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
