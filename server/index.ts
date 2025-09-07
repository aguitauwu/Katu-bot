import express from "express";
import { KatuBot } from "./bot";
import { getStorage } from "./storage";

const app = express();

// Initialize Katu Discord Bot
let katuBot: KatuBot;

(async () => {
  // Initialize storage first
  try {
    console.log('🗄️ Inicializando almacenamiento...');
    await getStorage();
    console.log('✅ Almacenamiento inicializado');
  } catch (error) {
    console.error('❌ Error al inicializar almacenamiento:', error);
    process.exit(1);
  }

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

  // Add health check endpoint for keep-alive only
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

  // Start simple server only for health checks
  const port = parseInt(process.env.PORT || '5000', 10);
  app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor de salud corriendo en puerto ${port}`);
    console.log(`🤖 Katu Bot está activo y funcionando`);
  });
})();
