# Katu Bot - Discord Daily Message Counter

Un bot de Discord desarrollado en Node.js para contar mensajes diarios, crear rankings y configurar logging en servidores de Discord.

## 🚀 Características

### Funcionalidades principales
- **Conteo diario de mensajes**: Cuenta automáticamente los mensajes de usuarios por día
- **Sistema de ranking**: Top 100 usuarios más activos del día
- **Logs configurables**: Canal de logs opcional para actividades del bot
- **Comandos intuitivos**: Comandos con prefijo `!` fáciles de usar
- **Uptime 24/7**: Configurado para Replit con keep-alive automático

### Comandos disponibles

#### 👥 Comandos para usuarios
- `!ranking` o `!top` - Mostrar top 100 usuarios más activos del día
- `!mystats` - Ver tus estadísticas personales del día
- `!stats @usuario` - Ver estadísticas de otro usuario
- `!help` - Mostrar ayuda con todos los comandos

#### ⚙️ Comandos para administradores
- `!setlog #canal` - Configurar canal de logs del bot
- `!removelog` - Desactivar logs del bot

## 🔧 Configuración

### Requisitos previos
- Node.js 18 o superior
- Una aplicación de Discord configurada
- Token de bot de Discord

### Variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```env
DISCORD_TOKEN=tu_token_del_bot_aqui
PORT=5000
NODE_ENV=production
TIMEZONE=UTC
RESET_HOUR=0
DEBUG=false
