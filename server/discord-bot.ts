import { Client, GatewayIntentBits, Message, ActivityType } from 'discord.js';
import { getStorage } from './bot-storage.js';
import { getCurrentDateUTC, logToChannel } from './discord-utils';
import { Logger } from './logger';
import { conversationHandler } from './conversation-handler.js';
import { geminiService } from './gemini-ai.js';
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
          await message.reply('¿Sobre qué te gustaría conversar? Usa `.kai [mensaje]` 🐱');
        }
        break;
      case 'kai':
        await this.handleKaiCommand(message, args);
        break;
    }
  }

  private async handleKaiCommand(message: Message, args: string[]): Promise<void> {
    try {
      const userMessage = args.join(' ');
      
      // Si no hay mensaje, mostrar saludo
      if (!userMessage || userMessage.trim().length === 0) {
        await message.reply('¡Hola! 🐾 Soy katu, tu asistente neko favorita~ ¿En qué puedo ayudarte hoy? Usa `.kai [mensaje]` para conversar conmigo, nya! ✨');
        return;
      }

      // Mostrar indicador de escritura
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }

      Logger.info('KaiCommand', `Processing .kai command from ${message.author.username}: "${userMessage}"`);
      
      // Generar respuesta de AI directamente
      const aiResponse = await geminiService.generateResponse(
        userMessage.trim(),
        message.author.id,
        message.guild!.id,
        message.author.username
      );
      
      // Enviar respuesta con límite de mensajes
      await this.sendKaiResponse(message, aiResponse.response);
      
      Logger.success('KaiCommand', `Responded to ${message.author.username} in ${message.guild!.name}`);
      
    } catch (error) {
      Logger.error('KaiCommand', `Error in .kai command for ${message.author.username}`, error);
      
      try {
        await message.reply("Nya~ Algo salió mal mientras procesaba tu mensaje. ¿Podrías intentarlo de nuevo en un momento? 🐱💫");
      } catch (replyError) {
        Logger.error('KaiCommand', 'Failed to send error message', replyError);
      }
    }
  }

  private async sendKaiResponse(message: Message, response: string): Promise<void> {
    const maxLength = 2000;
    
    // Si la respuesta es corta, enviarla directamente
    if (response.length <= maxLength) {
      await message.reply(response);
      return;
    }
    
    // Dividir en chunks
    const chunks = this.splitMessage(response, maxLength);
    
    // Si hay más de 3 chunks, hacer un resumen
    if (chunks.length > 3) {
      try {
        Logger.info('KaiCommand', `Response too long (${chunks.length} chunks), generating summary`);
        
        const summaryResponse = await geminiService.generateResponse(
          `Por favor, haz un resumen más conciso de tu respuesta anterior: "${response}"`,
          message.author.id,
          message.guild!.id,
          message.author.username
        );
        
        const summaryChunks = this.splitMessage(summaryResponse.response, maxLength);
        
        // Si el resumen también es muy largo, usar solo los primeros 3 chunks
        const finalChunks = summaryChunks.length > 3 ? summaryChunks.slice(0, 3) : summaryChunks;
        
        for (let i = 0; i < finalChunks.length; i++) {
          if (i === 0) {
            await message.reply(finalChunks[i]);
          } else {
            if ('send' in message.channel) {
              await message.channel.send(finalChunks[i]);
            }
          }
          
          if (i < finalChunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
        
      } catch (summaryError) {
        Logger.error('KaiCommand', 'Error generating summary, using first 3 chunks', summaryError);
        
        // Si falla el resumen, usar los primeros 3 chunks originales
        for (let i = 0; i < 3; i++) {
          if (i === 0) {
            await message.reply(chunks[i]);
          } else {
            if ('send' in message.channel) {
              await message.channel.send(chunks[i]);
            }
          }
          
          if (i < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    } else {
      // Enviar todos los chunks (máximo 3)
      for (let i = 0; i < chunks.length; i++) {
        if (i === 0) {
          await message.reply(chunks[i]);
        } else {
          if ('send' in message.channel) {
            await message.channel.send(chunks[i]);
          }
        }
        
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }
  }

  private splitMessage(message: string, maxLength: number): string[] {
    if (message.length <= maxLength) {
      return [message];
    }
    
    const chunks: string[] = [];
    let currentChunk = '';
    
    // Dividir por oraciones primero
    const sentences = message.split(/[.!?]\s+/);
    
    for (const sentence of sentences) {
      if ((currentChunk + sentence).length <= maxLength - 2) {
        currentChunk += sentence + '. ';
      } else {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
        
        // Si una oración es muy larga, dividir por palabras
        if (sentence.length > maxLength) {
          const words = sentence.split(' ');
          let wordChunk = '';
          
          for (const word of words) {
            if ((wordChunk + word).length <= maxLength - 1) {
              wordChunk += word + ' ';
            } else {
              if (wordChunk) {
                chunks.push(wordChunk.trim());
                wordChunk = '';
              }
              
              // Si una palabra es muy larga, agregarla tal como está
              if (word.length > maxLength) {
                chunks.push(word);
              } else {
                wordChunk = word + ' ';
              }
            }
          }
          
          if (wordChunk) {
            currentChunk = wordChunk;
          }
        } else {
          currentChunk = sentence + '. ';
        }
      }
    }
    
    if (currentChunk) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
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
