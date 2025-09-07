import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { KatuBot } from "./bot";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Katu Discord Bot
let katuBot: KatuBot;

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Initialize Discord Bot
  try {
    console.log('🤖 Iniciando Katu Bot...');
    katuBot = new KatuBot();
    await katuBot.start();
    console.log('✅ Katu Bot iniciado correctamente');
  } catch (error) {
    console.error('❌ Error al iniciar Katu Bot:', error);
    process.exit(1);
  }

  const server = await registerRoutes(app);

  // Add health check endpoint for keep-alive
  app.get('/health', (req, res) => {
    res.json({
      status: 'ok',
      bot: {
        status: katuBot?.getClient().isReady() ? 'online' : 'offline',
        guilds: katuBot?.getClient().guilds.cache.size || 0,
        uptime: process.uptime()
      },
      timestamp: new Date().toISOString()
    });
  });

  // Add bot info endpoint
  app.get('/api/bot/info', (req, res) => {
    if (!katuBot?.getClient().isReady()) {
      return res.status(503).json({ error: 'Bot not ready' });
    }

    const client = katuBot.getClient();
    res.json({
      name: 'Katu Bot',
      id: client.user?.id,
      tag: client.user?.tag,
      guilds: client.guilds.cache.size,
      users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
      uptime: process.uptime(),
      status: 'online'
    });
  });

  // Temporary debug endpoint to test if message counting works
  app.get('/api/test/storage', (req, res) => {
    try {
      const { storage } = require('./storage');
      const { getCurrentDateUTC } = require('./utils');
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
        timestamp: new Date().toISOString(),
        botStatus: katuBot?.getClient().isReady() ? 'online' : 'offline'
      });
    } catch (error) {
      console.error('Test storage error:', error);
      res.status(500).json({ error: 'Error accessing test storage', details: error.message });
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`🚀 Servidor corriendo en puerto ${port}`);
    log(`🤖 Katu Bot Dashboard: http://localhost:${port}`);
  });
})();
