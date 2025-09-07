import { KatuBot } from './discord-bot';
import { initStorage, getStorage } from './bot-storage';
import { Logger } from './logger';

// Initialize Katu Discord Bot
let katuBot: KatuBot;

(async () => {
  // Initialize storage first
  try {
    Logger.startup('Storage', 'Inicializando sistema de almacenamiento...');
    await initStorage();
    Logger.success('Storage', 'Sistema de almacenamiento inicializado correctamente');
  } catch (error) {
    Logger.error('Storage', 'Error crítico al inicializar almacenamiento', error);
    process.exit(1);
  }

  // Initialize Discord Bot
  try {
    Logger.startup('Discord', 'Iniciando Katu Bot...');
    katuBot = new KatuBot();
    await katuBot.start();
    Logger.success('Discord', 'Katu Bot iniciado correctamente');
    Logger.discord('Bot está activo y funcionando correctamente');
    
    // Log system stats every 30 minutes
    setInterval(() => Logger.stats(), 30 * 60 * 1000);
  } catch (error) {
    Logger.error('Discord', 'Error crítico al iniciar Katu Bot', error);
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    Logger.shutdown('System', 'Recibida señal SIGINT, iniciando cierre graceful...');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    Logger.shutdown('System', 'Recibida señal SIGTERM, iniciando cierre graceful...');
    process.exit(0);
  });
})();