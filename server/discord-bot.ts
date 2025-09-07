import { Client, GatewayIntentBits, Message, ActivityType } from 'discord.js';
import { getStorage } from './bot-storage.js';
import { getCurrentDateUTC, logToChannel } from './discord-utils';
import { Logger } from './logger';
import { conversationHandler } from './conversation-handler.js';
import {
  handleRankingCommand,
  handleMyStatsCommand,
  handleStatsCommand,
  handleSetLogCommand,
  handleRemoveLogCommand,
  handleHelpCommand
} from './discord-commands';

export class KatuBot {
  private client: Client;
  private readonly prefix = '.k';

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });

    this.setupEventHandlers();
    this.setupDailyReset();
  }

  private setupEventHandlers(): void {
    this.client.once('ready', () => {
      Logger.discord(`Bot autenticado exitosamente como ${this.client.user?.tag}`);
      
      // Set bot activity status
      this.client.user?.setActivity('Conversando con usuarios...', {
        type: ActivityType.Listening,
      });

      // Log startup to all configured log channels
      this.logToAllGuilds('🚀 Katu Bot iniciado con IA Gemini activada');
    });

    this.client.on('messageCreate', (message) => {
      this.handleMessage(message);
    });

    this.client.on('guildCreate', (guild) => {
      Logger.discord(`Bot añadido al servidor: ${guild.name} (ID: ${guild.id})`);
      this.logToGuild(guild.id, `➕ Katu Bot añadido al servidor ${guild.name}`);
    });

    this.client.on('guildDelete', (guild) => {
      Logger.discord(`Bot removido del servidor: ${guild.name} (ID: ${guild.id})`);
    });

    this.client.on('error', (error) => {
      Logger.error('Discord', 'Error del cliente Discord', error);
    });
  }

  private async handleMessage(message: Message): Promise<void> {
    // Ignore messages from bots and webhooks
    if (message.author.bot || message.webhookId) return;
    
    // Ignore messages not in guilds
    if (!message.guild) return;

    // Ignore empty messages
    if (!message.content.trim()) return;

    try {
      // Handle commands first
      if (message.content.startsWith(this.prefix)) {
        await this.handleCommand(message);
        return;
      }

      // Count the message
      await this.countMessage(message);

      // Check if bot should respond to this message
      if (await conversationHandler.shouldRespond(message)) {
        await conversationHandler.handleConversation(message);
      }
    } catch (error) {
      Logger.error('MessageHandler', `Error procesando mensaje en ${message.guild?.name}`, error);
    }
  }

  private async handleCommand(message: Message): Promise<void> {
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command || command.length === 0) return;

    Logger.command(message.guild?.name || 'DM', message.author.username, `.k${command}`);

    switch (command) {
      case 'ranking':
      case 'top':
        await handleRankingCommand(message);
        break;
      case 'mystats':
        await handleMyStatsCommand(message);
        break;
      case 'stats':
        await handleStatsCommand(message, args);
        break;
      case 'setlog':
        await handleSetLogCommand(message, args);
        break;
      case 'removelog':
        await handleRemoveLogCommand(message);
        break;
      case 'help':
        await handleHelpCommand(message);
        break;
      case 'ai':
      case 'chat':
        // Handle AI chat command
        const chatMessage = args.join(' ');
        if (chatMessage) {
          // Modify the message content to include the chat message
          const modifiedMessage = { ...message, content: chatMessage };
          await conversationHandler.handleConversation(modifiedMessage as any);
        } else {
          await message.reply('¿Sobre qué te gustaría conversar? Usa `.kai tu mensaje aquí` 🐱');
        }
        break;
    }
  }

  private async countMessage(message: Message): Promise<void> {
    try {
      const currentDate = getCurrentDateUTC();
      const guildId = message.guild!.id;
      const userId = message.author.id;
      const username = message.author.username;

      const updatedCount = await getStorage().incrementMessageCount(
        currentDate,
        guildId,
        userId,
        username
      );

      // Log message count and new users
      Logger.message(message.guild!.name, username, updatedCount.messageCount);
      
      if (updatedCount.messageCount === 1) {
        this.logToGuild(
          guildId,
          `👋 Nuevo usuario detectado: ${username} envió su primer mensaje del día`
        );
        Logger.info('NewUser', `Primer mensaje de ${username} en ${message.guild!.name}`);
      }
    } catch (error) {
      Logger.error('MessageCounter', `Error contando mensaje de ${message.author.username}`, error);
    }
  }

  private setupDailyReset(): void {
    // Calculate milliseconds until next midnight UTC
    const now = new Date();
    const nextMidnight = new Date(now);
    nextMidnight.setUTCDate(now.getUTCDate() + 1);
    nextMidnight.setUTCHours(0, 0, 0, 0);
    
    const msUntilMidnight = nextMidnight.getTime() - now.getTime();

    // Set timeout for first reset
    setTimeout(() => {
      this.performDailyReset();
      
      // Set interval for subsequent resets (every 24 hours)
      setInterval(() => {
        this.performDailyReset();
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    console.log(`⏰ Próximo reset diario programado para: ${nextMidnight.toISOString()}`);
  }

  private performDailyReset(): void {
    const currentDate = getCurrentDateUTC();
    console.log(`🔄 Realizando reset diario para: ${currentDate}`);
    
    // Log reset to all guilds
    this.logToAllGuilds(`🔄 Reset diario realizado - Comenzando conteo para ${currentDate}`);
  }

  private async logToGuild(guildId: string, message: string): Promise<void> {
    try {
      const guildConfig = await getStorage().getGuildConfig(guildId);
      logToChannel(this.client, guildId, guildConfig?.logChannelId || null, message);
    } catch (error) {
      console.error('Error logging to guild:', error);
    }
  }

  private async logToAllGuilds(message: string): Promise<void> {
    this.client.guilds.cache.forEach(async (guild) => {
      await this.logToGuild(guild.id, message);
    });
  }

  public async start(): Promise<void> {
    const token = process.env.DISCORD_TOKEN;
    
    if (!token) {
      throw new Error('❌ DISCORD_TOKEN no encontrado en las variables de entorno');
    }

    try {
      await this.client.login(token);
    } catch (error) {
      console.error('❌ Error al conectar con Discord:', error);
      throw error;
    }
  }

  public getClient(): Client {
    return this.client;
  }
}
