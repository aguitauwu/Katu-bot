import { KatuBot } from './server/discord-bot.js';
import { initStorage } from './server/bot-storage.js';

async function startBot() {
  try {
    console.log('🚀 Iniciando Katu Bot...');
    
    // Initialize storage
    await initStorage();
    console.log('✅ Storage inicializado');
    
    // Create and start bot
    const bot = new KatuBot();
    await bot.start();
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Recibida señal de cierre, desconectando bot...');
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n🛑 Recibida señal de terminación, desconectando bot...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Error fatal al iniciar el bot:', error);
    process.exit(1);
  }
}

startBot();
