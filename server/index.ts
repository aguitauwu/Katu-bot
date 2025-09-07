import { KatuBot } from './bot';
import { getStorage } from './storage';

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
    console.log('🤖 Katu Bot está activo y funcionando');
  } catch (error) {
    console.error('❌ Error al iniciar Katu Bot:', error);
    process.exit(1);
  }

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n🛑 Recibida señal de cierre, desconectando bot...');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Recibida señal de terminación, desconectando bot...');
    process.exit(0);
  });
})();