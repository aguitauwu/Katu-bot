import { EmbedBuilder, Guild, User } from 'discord.js';

export function getCurrentDateUTC(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD format
}

export function createRankingEmbed(
  ranking: Array<{ username: string; messageCount: number; userId: string }>,
  guild: Guild,
  totalMessages: number,
  date: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📊 Top ${ranking.length} Usuarios Activos - ${date}`)
    .setColor('#8207DB')
    .setTimestamp()
    .setFooter({
      text: `Powered by Katu Bot • Total messages processed: ${totalMessages.toLocaleString()}`,
    });

  if (guild.iconURL()) {
    embed.setThumbnail(guild.iconURL());
  }

  let description = '';
  ranking.forEach((user, index) => {
    const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
    description += `${medal} **${user.username}** - ${user.messageCount} mensajes\n`;
  });

  if (description.length === 0) {
    description = 'No hay datos de mensajes para hoy.';
  }

  embed.setDescription(description);
  return embed;
}

export function createStatsEmbed(
  username: string,
  messageCount: number,
  rank: number,
  totalUsers: number,
  date: string
): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle(`📈 Estadísticas de ${username}`)
    .setColor('#8207DB')
    .setTimestamp()
    .setFooter({
      text: 'Powered by Katu Bot',
    });

  embed.addFields([
    { name: '📅 Fecha', value: date, inline: true },
    { name: '💬 Mensajes', value: messageCount.toString(), inline: true },
    { name: '🏆 Ranking', value: `#${rank} de ${totalUsers}`, inline: true },
  ]);

  return embed;
}

export function createHelpEmbed(): EmbedBuilder {
  const embed = new EmbedBuilder()
    .setTitle('🤖 Comandos de Katu Bot')
    .setColor('#8207DB')
    .setDescription('Bot contador de mensajes diarios con sistema de ranking')
    .setTimestamp()
    .setFooter({
      text: 'Powered by Katu Bot',
    });

  embed.addFields([
    {
      name: '👥 Comandos para Usuarios',
      value: `\`.kranking\` o \`.ktop\` - Ver top 100 usuarios más activos del día
\`.kmystats\` - Ver tus estadísticas personales
\`.kstats @usuario\` - Ver estadísticas de otro usuario
\`.khelp\` - Mostrar esta ayuda`,
      inline: false,
    },
    {
      name: '⚙️ Comandos para Administradores',
      value: `\`.ksetlog #canal\` - Configurar canal de logs
\`.kremovelog\` - Desactivar logs del bot`,
      inline: false,
    },
    {
      name: '📋 Información',
      value: `• Los contadores se resetean automáticamente a las 12:00 AM UTC
• Solo se cuentan mensajes de usuarios (no bots)
• Datos separados por servidor
• Bot activo 24/7`,
      inline: false,
    },
  ]);

  return embed;
}

export function logToChannel(
  client: any,
  guildId: string,
  logChannelId: string | null,
  message: string
): void {
  if (!logChannelId) return;

  try {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const logChannel = guild.channels.cache.get(logChannelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setColor('#8207DB')
      .setDescription(message)
      .setTimestamp()
      .setFooter({ text: 'Katu Bot Log' });

    logChannel.send({ embeds: [embed] });
  } catch (error) {
    console.error('Error sending log message:', error);
  }
}

export function isAdmin(member: any): boolean {
  return member.permissions.has('Administrator');
}

export function paginateRanking(ranking: any[], page: number = 1, pageSize: number = 20): {
  data: any[],
  totalPages: number,
  currentPage: number,
  hasNext: boolean,
  hasPrev: boolean
} {
  const totalPages = Math.ceil(ranking.length / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = ranking.slice(startIndex, endIndex);

  return {
    data,
    totalPages,
    currentPage: page,
    hasNext: page < totalPages,
    hasPrev: page > 1
  };
}
