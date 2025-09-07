import { Client, GatewayIntentBits, Message, ActivityType } from 'discord.js';
import { getStorage } from './bot-storage.js';
import { getCurrentDateUTC, logToChannel } from './discord-utils';
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
  private readonly prefix = '!';

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
      console.log(`✅ Katu Bot está listo! Logueado como ${this.client.user?.tag}`);
      
      // Set bot activity status
      this.client.user?.setActivity('Contando mensajes diarios...', {
        type: ActivityType.Watching,
      });

      // Log startup to all configured log channels
      this.logToAllGuilds('🚀 Katu Bot iniciado y listo para contar mensajes');
    });

    this.client.on('messageCreate', (message) => {
      this.handleMessage(message);
    });

    this.client.on('guildCreate', (guild) => {
      console.log(`➕ Bot añadido al servidor: ${guild.name} (${guild.id})`);
      this.logToGuild(guild.id, `➕ Katu Bot añadido al servidor ${guild.name}`);
    });

    this.client.on('guildDelete', (guild) => {
      console.log(`➖ Bot removido del servidor: ${guild.name} (${guild.id})`);
    });

    this.client.on('error', (error) => {
      console.error('❌ Error del cliente Discord:', error);
    });
  }

  private async handleMessage(message: Message): Promise<void> {
    // Ignore messages from bots and webhooks
    if (message.author.bot || message.webhookId) return;
    
    // Ignore messages not in guilds
    if (!message.guild) return;

    try {
      // Handle commands
      if (message.content.startsWith(this.prefix)) {
        await this.handleCommand(message);
        return;
      }

      // Count the message
      await this.countMessage(message);
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  private async handleCommand(message: Message): Promise<void> {
    const args = message.content.slice(this.prefix.length).trim().split(/ +/);
    const command = args.shift()?.toLowerCase();

    if (!command) return;

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

      // Log new users (first message of the day)
      if (updatedCount.messageCount === 1) {
        this.logToGuild(
          guildId,
          `👋 Nuevo usuario detectado: ${username} envió su primer mensaje del día`
        );
      }
    } catch (error) {
      console.error('Error counting message:', error);
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
