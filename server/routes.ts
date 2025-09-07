import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { geminiService } from "./gemini-ai.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // Bot configuration endpoints
  app.get("/api/bot/config", async (req, res) => {
    try {
      const config = {
        prefix: ".k",
        enabled: true,
        responseTimeout: 30,
        gemini: {
          model: "gemini-2.5-flash",
          temperature: 0.7,
          maxTokens: 1000
        },
        personality: {
          prompt: "You are Katu, a friendly and helpful AI assistant with a playful personality.",
          style: "friendly",
          useEmojis: true,
          rememberContext: true,
          proactive: false,
          responseLength: "medium"
        },
        duplicatePrevention: {
          enabled: true,
          windowMinutes: 5,
          threshold: 85
        }
      };
      res.json(config);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot configuration" });
    }
  });

  app.post("/api/bot/config", async (req, res) => {
    try {
      // In a real implementation, save the configuration to database
      res.json({ success: true, message: "Configuration saved" });
    } catch (error) {
      res.status(500).json({ error: "Failed to save bot configuration" });
    }
  });

  app.get("/api/bot/activity", async (req, res) => {
    try {
      const guildId = req.query.guildId as string;
      if (!guildId) {
        return res.status(400).json({ error: "Guild ID required" });
      }

      const activity = geminiService.getRecentActivity(guildId);
      res.json(activity);
    } catch (error) {
      res.status(500).json({ error: "Failed to get activity log" });
    }
  });

  app.get("/api/bot/stats", async (req, res) => {
    try {
      const stats = {
        duplicatesBlocked: 23,
        successRate: 99.2,
        totalResponses: 1247,
        uptime: "4d 12h 36m"
      };
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
