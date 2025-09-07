import { initStorage } from './bot-storage.js';
import { KatuBot } from './discord-bot.js';
import { Logger } from './logger.js';

async function startBot() {
  try {
    Logger.info('Storage', 'Inicializando sistema de almacenamiento...');
    await initStorage();
    Logger.success('Storage', 'Sistema de almacenamiento inicializado correctamente');

    Logger.info('Discord', 'Iniciando Katu Bot...');
    const bot = new KatuBot();
    await bot.start();
    Logger.success('Discord', 'Katu Bot iniciado correctamente');
    Logger.info('Bot', 'Bot está activo y funcionando correctamente');

    // Graceful shutdown
    process.on('SIGINT', () => {
      Logger.info('Bot', 'Recibida señal SIGINT, cerrando bot...');
      bot.getClient().destroy();
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      Logger.info('Bot', 'Recibida señal SIGTERM, cerrando bot...');
      bot.getClient().destroy();
      process.exit(0);
    });

  } catch (error) {
    Logger.error('Bot', 'Error crítico al iniciar Katu Bot', error);
    process.exit(1);
  }
}

startBot();
