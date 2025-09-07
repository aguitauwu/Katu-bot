import { Message, EmbedBuilder } from 'discord.js';
import { getStorage } from './bot-storage.js';
import { getCurrentDateUTC, createRankingEmbed, createStatsEmbed, createHelpEmbed, logToChannel, isAdmin, paginateRanking } from './discord-utils.js';

export async function handleRankingCommand(message: Message): Promise<void> {
  try {
    const currentDate = getCurrentDateUTC();
    const guildId = message.guild!.id;
    
    const ranking = await getStorage().getDailyRanking(currentDate, guildId, 100);
    const totalMessages = await getStorage().getTotalMessagesForDay(currentDate, guildId);
    
    if (ranking.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📊 Ranking Diario')
        .setColor('#8207DB')
        .setDescription('No hay datos de mensajes para hoy. ¡Empezad a chatear!')
        .setTimestamp()
        .setFooter({ text: 'Powered by Katu Bot' });
      
      await message.reply({ embeds: [embed] });
      return;
    }

    // Paginate for large rankings
    const page = 1; // Could be extracted from command args later
    const paginatedRanking = paginateRanking(ranking, page, 20);
    
    const embed = createRankingEmbed(
      paginatedRanking.data.map((user, index) => ({
        username: user.username,
        messageCount: user.messageCount,
        userId: user.userId
      })),
      message.guild!,
      totalMessages,
      currentDate
    );

    if (paginatedRanking.totalPages > 1) {
      embed.setFooter({
        text: `Powered by Katu Bot • Página ${paginatedRanking.currentPage} de ${paginatedRanking.totalPages} • Total messages: ${totalMessages.toLocaleString()}`
      });
    }

    await message.reply({ embeds: [embed] });

    // Log activity
    const guildConfig = await getStorage().getGuildConfig(guildId);
    logToChannel(
      message.client,
      guildId,
      guildConfig?.logChannelId || null,
      `📊 ${message.author.username} solicitó el ranking diario`
    );

  } catch (error) {
    console.error('Error handling ranking command:', error);
    await message.reply('❌ Error al obtener el ranking. Inténtalo más tarde.');
  }
}

export async function handleMyStatsCommand(message: Message): Promise<void> {
  try {
    const currentDate = getCurrentDateUTC();
    const guildId = message.guild!.id;
    const userId = message.author.id;
    
    const userStats = await getStorage().getUserDailyStats(currentDate, guildId, userId);
    const ranking = await getStorage().getDailyRanking(currentDate, guildId, 1000);
    
    if (!userStats) {
      const embed = new EmbedBuilder()
        .setTitle('📈 Tus Estadísticas')
        .setColor('#8207DB')
        .setDescription('No tienes mensajes registrados hoy. ¡Envía algunos mensajes!')
        .setTimestamp()
        .setFooter({ text: 'Powered by Katu Bot' });
      
      await message.reply({ embeds: [embed] });
      return;
    }

    const userRank = ranking.findIndex(user => user.userId === userId) + 1;
    
    const embed = createStatsEmbed(
      message.author.username,
      userStats.messageCount,
      userRank,
      ranking.length,
      currentDate
    );

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error handling mystats command:', error);
    await message.reply('❌ Error al obtener tus estadísticas. Inténtalo más tarde.');
  }
}

export async function handleStatsCommand(message: Message, args: string[]): Promise<void> {
  try {
    const mention = message.mentions.users.first();
    if (!mention) {
      await message.reply('❌ Debes mencionar a un usuario. Ejemplo: `!stats @usuario`');
      return;
    }

    const currentDate = getCurrentDateUTC();
    const guildId = message.guild!.id;
    const userId = mention.id;
    
    const userStats = await getStorage().getUserDailyStats(currentDate, guildId, userId);
    const ranking = await getStorage().getDailyRanking(currentDate, guildId, 1000);
    
    if (!userStats) {
      const embed = new EmbedBuilder()
        .setTitle(`📈 Estadísticas de ${mention.username}`)
        .setColor('#8207DB')
        .setDescription('Este usuario no tiene mensajes registrados hoy.')
        .setTimestamp()
        .setFooter({ text: 'Powered by Katu Bot' });
      
      await message.reply({ embeds: [embed] });
      return;
    }

    const userRank = ranking.findIndex(user => user.userId === userId) + 1;
    
    const embed = createStatsEmbed(
      mention.username,
      userStats.messageCount,
      userRank,
      ranking.length,
      currentDate
    );

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error handling stats command:', error);
    await message.reply('❌ Error al obtener las estadísticas del usuario. Inténtalo más tarde.');
  }
}

export async function handleSetLogCommand(message: Message, args: string[]): Promise<void> {
  try {
    if (!isAdmin(message.member)) {
      await message.reply('❌ Solo los administradores pueden configurar el canal de logs.');
      return;
    }

    const channelMention = message.mentions.channels.first();
    if (!channelMention) {
      await message.reply('❌ Debes mencionar un canal. Ejemplo: `!setlog #bot-logs`');
      return;
    }

    if (!channelMention.isTextBased()) {
      await message.reply('❌ El canal debe ser un canal de texto.');
      return;
    }

    const guildId = message.guild!.id;
    await getStorage().setGuildLogChannel(guildId, channelMention.id);

    const embed = new EmbedBuilder()
      .setTitle('✅ Canal de Logs Configurado')
      .setColor('#8207DB')
      .setDescription(`Canal de logs establecido en ${channelMention}`)
      .setTimestamp()
      .setFooter({ text: 'Powered by Katu Bot' });

    await message.reply({ embeds: [embed] });

    // Send test log to the new channel
    logToChannel(
      message.client,
      guildId,
      channelMention.id,
      `✅ Canal de logs configurado por ${message.author.username}`
    );

  } catch (error) {
    console.error('Error handling setlog command:', error);
    await message.reply('❌ Error al configurar el canal de logs. Inténtalo más tarde.');
  }
}

export async function handleRemoveLogCommand(message: Message): Promise<void> {
  try {
    if (!isAdmin(message.member)) {
      await message.reply('❌ Solo los administradores pueden desactivar los logs.');
      return;
    }

    const guildId = message.guild!.id;
    const guildConfig = await getStorage().getGuildConfig(guildId);
    
    if (!guildConfig?.logChannelId) {
      await message.reply('❌ No hay un canal de logs configurado.');
      return;
    }

    // Log before removing
    logToChannel(
      message.client,
      guildId,
      guildConfig.logChannelId,
      `❌ Logs desactivados por ${message.author.username}`
    );

    await getStorage().setGuildLogChannel(guildId, null);

    const embed = new EmbedBuilder()
      .setTitle('✅ Logs Desactivados')
      .setColor('#8207DB')
      .setDescription('El canal de logs ha sido desactivado.')
      .setTimestamp()
      .setFooter({ text: 'Powered by Katu Bot' });

    await message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error handling removelog command:', error);
    await message.reply('❌ Error al desactivar los logs. Inténtalo más tarde.');
  }
}

export async function handleHelpCommand(message: Message): Promise<void> {
  try {
    const embed = createHelpEmbed();
    await message.reply({ embeds: [embed] });
  } catch (error) {
    console.error('Error handling help command:', error);
    await message.reply('❌ Error al mostrar la ayuda. Inténtalo más tarde.');
  }
}
