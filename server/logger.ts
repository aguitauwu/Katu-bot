export class Logger {
  private static formatTime(): string {
    return new Date().toISOString().replace('T', ' ').substr(0, 19);
  }

  private static formatMessage(level: string, component: string, message: string): string {
    const timestamp = this.formatTime();
    const emoji = this.getLevelEmoji(level);
    return `[${timestamp}] ${emoji} [${component}] ${message}`;
  }

  private static getLevelEmoji(level: string): string {
    switch (level.toUpperCase()) {
      case 'INFO': return '📘';
      case 'SUCCESS': return '✅';
      case 'WARN': return '⚠️';
      case 'ERROR': return '❌';
      case 'DEBUG': return '🔍';
      case 'DATABASE': return '🗄️';
      case 'DISCORD': return '🤖';
      case 'NETWORK': return '🌐';
      case 'STARTUP': return '🚀';
      case 'SHUTDOWN': return '🛑';
      case 'MESSAGE': return '💬';
      case 'COMMAND': return '⚡';
      default: return '📝';
    }
  }

  static info(component: string, message: string): void {
    console.log(this.formatMessage('INFO', component, message));
  }

  static success(component: string, message: string): void {
    console.log(this.formatMessage('SUCCESS', component, message));
  }

  static warn(component: string, message: string): void {
    console.warn(this.formatMessage('WARN', component, message));
  }

  static error(component: string, message: string, error?: any): void {
    console.error(this.formatMessage('ERROR', component, message));
    if (error) {
      console.error('Error details:', error);
    }
  }

  static debug(component: string, message: string): void {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.formatMessage('DEBUG', component, message));
    }
  }

  static database(message: string): void {
    console.log(this.formatMessage('DATABASE', 'Storage', message));
  }

  static discord(message: string): void {
    console.log(this.formatMessage('DISCORD', 'Bot', message));
  }

  static network(component: string, message: string): void {
    console.log(this.formatMessage('NETWORK', component, message));
  }

  static startup(component: string, message: string): void {
    console.log(this.formatMessage('STARTUP', component, message));
  }

  static shutdown(component: string, message: string): void {
    console.log(this.formatMessage('SHUTDOWN', component, message));
  }

  static message(guildName: string, username: string, messageCount: number): void {
    console.log(this.formatMessage('MESSAGE', 'Counter', 
      `${username} en ${guildName} - Total: ${messageCount} mensajes`));
  }

  static command(guildName: string, username: string, command: string): void {
    console.log(this.formatMessage('COMMAND', 'Handler', 
      `${username} en ${guildName} ejecutó: ${command}`));
  }

  static stats(): void {
    const memUsage = process.memoryUsage();
    const uptime = process.uptime();
    console.log(this.formatMessage('INFO', 'System', 
      `Memoria: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB | Uptime: ${Math.round(uptime)}s`));
  }
}