# 🐱✨ KATU BOT - Bot Contador de Mensajes Kawaii

<div align="center">

![KATU Banner](https://img.shields.io/badge/🐱✨-KATU_BOT-FF69B4?style=for-the-badge&labelColor=FF91A4)

[![Node.js](https://img.shields.io/badge/Node.js-18+-3776AB?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14+-7289DA?style=flat-square&logo=discord&logoColor=white)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Powered-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Kawaii](https://img.shields.io/badge/Kawaii-100%25-FF1493?style=flat-square)](.)

**¡Nya~ 🐱 ¡Soy Katu Bot! Un contador de mensajes súper kawaii para Discord uwu~ ✨💖**

*Bot especializado en rastrear mensajes diarios, generar rankings adorables y gestionar estadísticas de servidor con personalidad gatuna*

[📋 Ver Comandos](#-comandos-disponibles) • [🚀 Instalación](#-instalación-rápida) • [💻 VS Code/Cursor](#-instalación-en-editores) • [🗄️ Base de Datos](#-sistema-de-base-de-datos) • [📖 Documentación](#-documentación)

</div>

---

## ✨ Características Principales

<table>
<tr>
<td width="50%">

### 🐱 **Contador de Mensajes**
- **Tracking diario**: Cuenta mensajes por usuario cada día
- **Rankings automáticos**: Top usuarios más activos
- **Estadísticas personales**: Stats individuales por usuario
- **Reset diario**: Reinicio automático a medianoche UTC

### 🗄️ **Sistema de Almacenamiento**
- **MongoDB principal**: Base de datos NoSQL robusta
- **PostgreSQL**: Soporte alternativo con Drizzle ORM
- **Memoria fallback**: Sistema de respaldo en memoria
- **Auto-failover**: Cambio automático entre sistemas

</td>
<td width="50%">

### 🤖 **Gestión de Servidores**
- **Canales de log**: Configuración de logs por servidor
- **Multi-servidor**: Soporte para múltiples servidores Discord
- **Configuración flexible**: Ajustes personalizables por guild
- **Logs detallados**: Sistema de logging avanzado con emojis

### 🛡️ **Administración**
- **Comandos admin**: Control para administradores
- **Logs automáticos**: Registro de actividades
- **Sistema de permisos**: Control de acceso por roles
- **Monitoreo**: Estadísticas del sistema en tiempo real

</td>
</tr>
</table>

---

## 📋 Comandos Disponibles

### 👥 **Comandos para Usuarios**
| Comando | Descripción | Ejemplo |
|---------|-------------|---------|
| `!ranking` / `!top` | 📊 Ver ranking diario del servidor | `!ranking` |
| `!mystats` | 📈 Ver tus estadísticas personales | `!mystats` |
| `!stats @usuario` | 🔍 Ver stats de otro usuario | `!stats @Katu` |
| `!help` | ❓ Ver lista de comandos | `!help` |

### 🛡️ **Comandos para Administradores**
| Comando | Descripción | Permisos |
|---------|-------------|----------|
| `!setlog #canal` | 🔧 Configurar canal de logs | Administrador |
| `!removelog` | 🗑️ Remover canal de logs | Administrador |

---

## 🚀 Instalación Rápida

### 📋 **Prerrequisitos**

```bash
Node.js 18+ ✅
Discord Developer Account ✅  
MongoDB Database ✅ (recomendado)
Discord Bot Token ✅
```

### 🔧 **Instalación**

```bash
# 1. Clonar repositorio
git clone https://github.com/aguitauwu/Katu-bot.git
cd Katu-bot

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Ejecutar
npm run dev
```

### 🔗 **Variables de Entorno (.env)**

```env
# Discord Configuration
DISCORD_TOKEN=tu_token_del_bot_aqui

# Database (MongoDB recomendado)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/katubot

# Opcional: PostgreSQL como alternativa
# DATABASE_URL=postgresql://user:password@host:port/database

# Environment
NODE_ENV=development
```

---

## 💻 Instalación en Editores

### 🎯 **Visual Studio Code**

<details>
<summary><b>📝 Configuración Completa</b></summary>

1. **Instalar VS Code y abrir proyecto:**
   ```bash
   # Clonar y abrir
   git clone https://github.com/aguitauwu/Katu-bot.git
   code Katu-bot
   ```

2. **Extensiones recomendadas (automáticamente sugeridas):**
   - TypeScript and JavaScript Language Features
   - Discord.js Snippets
   - MongoDB for VS Code
   - GitLens
   - ESLint

3. **Configuración del workspace (.vscode/settings.json):**
   ```json
   {
     "typescript.preferences.importModuleSpecifier": "relative",
     "editor.formatOnSave": true,
     "files.exclude": {
       "**/node_modules": true,
       "**/dist": true
     }
   }
   ```

4. **Ejecutar desde VS Code:**
   - Terminal integrado: `Ctrl+Shift+\`` 
   - Ejecutar: `npm run dev`
   - Ver logs en tiempo real

</details>

### 🎯 **Cursor**

<details>
<summary><b>🤖 Configuración con IA</b></summary>

1. **Instalar Cursor y abrir:**
   ```bash
   # Descargar desde https://cursor.sh/
   # Abrir: File > Open Folder > Katu-bot
   ```

2. **Ventajas de Cursor:**
   - IA integrada detecta Discord.js automáticamente
   - `Ctrl+K` para chat con IA sobre el código
   - `Ctrl+L` para explicaciones línea por línea

3. **Configuración .cursorrules (opcional):**
   ```
   This is a Discord bot project using:
   - Discord.js v14 + TypeScript
   - MongoDB with Mongoose
   - Message counting and ranking system
   
   Focus on Discord bot patterns and MongoDB operations.
   ```

4. **Flujo de trabajo:**
   ```bash
   npm install
   # Configurar .env con ayuda de IA
   npm run dev
   ```

</details>

### 🎯 **Windsurf**

<details>
<summary><b>🌊 Configuración Windsurf</b></summary>

1. **Instalar Windsurf:**
   ```bash
   # Descargar desde https://codeium.com/windsurf
   # Abrir proyecto: File > Open Folder > Katu-bot
   ```

2. **Características únicas:**
   - Codeium AI integrado
   - `Ctrl+I` para comandos de IA
   - Detección automática de TypeScript y Node.js

3. **Setup recomendado:**
   ```bash
   # Terminal integrado
   npm install
   
   # Usar IA para configuración
   # "Help me set up Discord bot environment variables"
   
   npm run dev
   ```

4. **Configuración del workspace:**
   ```json
   {
     "codeium.enableConfig": true,
     "files.associations": {
       "*.env": "properties"
     }
   }
   ```

</details>

### 🔧 **Configuración Común**

Para todos los editores, sigue estos pasos:

```bash
# 1. Dependencias
npm install

# 2. Variables de entorno
cp .env.example .env
# Editar con tus credenciales

# 3. Base de datos (MongoDB Atlas recomendado)
# - Registrarte en https://cloud.mongodb.com
# - Crear cluster gratuito
# - Obtener URI de conexión
# - Agregar como MONGODB_URI en .env

# 4. Discord Bot
# - https://discord.com/developers/applications
# - Crear aplicación
# - Bot > Reset Token
# - Habilitar Message Content Intent

# 5. Ejecutar
npm run dev

# ✅ Verificar logs: "🤖 Bot autenticado exitosamente"
```

---

## 🗄️ Sistema de Base de Datos

### 🎯 **MongoDB (Principal)**

```javascript
// Esquemas automáticos
DailyMessageCount: {
  date: "2025-09-07",           // Fecha YYYY-MM-DD
  guildId: "123456789",         // ID del servidor
  userId: "987654321",          // ID del usuario
  username: "Usuario",          // Nombre del usuario
  messageCount: 42,             // Cantidad de mensajes
  createdAt: Date,              // Fecha de creación
  updatedAt: Date               // Última actualización
}

GuildConfig: {
  guildId: "123456789",         // ID del servidor
  logChannelId: "channel_id",   // Canal de logs (opcional)
  timezone: "UTC",              // Zona horaria
  createdAt: Date,
  updatedAt: Date
}
```

### 🔄 **Sistema de Fallback**

1. **🥇 MongoDB** - Base de datos principal (NoSQL)
2. **🥈 PostgreSQL** - Alternativa robusta (SQL)
3. **🥉 Memoria** - Fallback básico (volátil)

**El bot selecciona automáticamente la mejor opción disponible.**

---

## 🎮 Funcionalidades

### 📊 **Sistema de Conteo Inteligente**

- ✅ **Conteo automático**: Cada mensaje se registra instantáneamente
- ❌ **Exclusiones**: Bots y webhooks no cuentan
- 🕐 **Reset diario**: Automático a medianoche UTC
- 👥 **Multi-usuario**: Seguimiento independiente por usuario
- 🏆 **Rankings**: Top 100 usuarios más activos

### 📝 **Logs Avanzados**

```bash
# Ejemplos de logs del sistema
[2025-09-07 21:44:03] 🚀 [Storage] Inicializando sistema...
[2025-09-07 21:44:03] 🗄️ [Storage] Conectado a MongoDB
[2025-09-07 21:44:03] 🤖 [Bot] Bot autenticado como katu#9791
[2025-09-07 21:44:15] 💬 [Counter] usuario en Servidor - Total: 5 mensajes
[2025-09-07 21:44:20] ⚡ [Handler] usuario ejecutó: !ranking
```

### 🛡️ **Administración**

- **🔧 Configuración**: Canal de logs por servidor
- **⚙️ Permisos**: Comandos restringidos para admins
- **📊 Monitoreo**: Stats del sistema cada 30 minutos
- **🔄 Auto-restart**: Manejo graceful de errores

---

## 🤖 Arquitectura Técnica

### 🏗️ **Estructura**

```
Katu-bot/
├── server/
│   ├── index.ts              # 🚀 Punto de entrada
│   ├── discord-bot.ts        # 🤖 Lógica del bot
│   ├── bot-storage.ts        # 🗄️ Sistema de almacenamiento
│   ├── discord-commands.ts   # ⚡ Handlers de comandos
│   ├── discord-utils.ts      # 🛠️ Utilidades
│   └── logger.ts             # 📝 Sistema de logs
├── shared/
│   ├── bot-schema.ts         # 📋 Esquemas PostgreSQL
│   └── mongodb-schema.ts     # 📋 Esquemas MongoDB
├── package.json              # 📦 Dependencias
├── .env.example             # ⚙️ Variables de entorno
└── README.md                # 📖 Documentación
```

### 🔧 **Stack Tecnológico**

- **🟢 Runtime**: Node.js 18+
- **🔷 Lenguaje**: TypeScript
- **🤖 Bot Framework**: Discord.js v14
- **🍃 Base de Datos**: MongoDB + Mongoose
- **🐘 Alternativa**: PostgreSQL + Drizzle
- **📝 Build**: TSX para desarrollo

---

## 🆘 Soporte

### 🐛 **Problemas Comunes**

<details>
<summary><b>❌ Error: "Cannot find module"</b></summary>

```bash
# Solución
rm -rf node_modules package-lock.json
npm install
```
</details>

<details>
<summary><b>🔑 Error: "Invalid token"</b></summary>

1. Verificar token en `.env`
2. Regenerar token en Discord Developer Portal
3. Asegurar que Message Content Intent esté habilitado
</details>

<details>
<summary><b>🗄️ Error de base de datos</b></summary>

1. Verificar MONGODB_URI en `.env`
2. Comprobar conexión de red
3. El bot automáticamente usará memoria como fallback
</details>

### 📞 **Contacto**

- **🐛 Issues**: [GitHub Issues](https://github.com/aguitauwu/Katu-bot/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/aguitauwu/Katu-bot/discussions)
- **📧 Email**: Contacto directo del desarrollador

---

## 🤝 Contribuir

### 🌟 **Cómo Ayudar**

1. **🍴 Fork** el repositorio
2. **🌿 Crear** rama: `git checkout -b feature/nueva-funcionalidad`
3. **💾 Commit**: `git commit -m 'Add: función kawaii'`
4. **📤 Push**: `git push origin feature/nueva-funcionalidad`
5. **📥 Pull Request**: Abrir PR con descripción detallada

### 📋 **Guidelines**

- ✅ Mantener personalidad kawaii en mensajes
- ✅ Usar TypeScript estricto
- ✅ Incluir logs descriptivos con emojis
- ✅ Documentar nuevas funciones
- ✅ Testear antes de PR

---

## 📄 Licencia

**MIT License** - Libre para usar, modificar y distribuir

---

<div align="center">

## 🌸 **¡Gracias por usar Katu Bot!**

**Si te gusta este proyecto, ¡dale una ⭐ nya~!**

[![GitHub Stars](https://img.shields.io/github/stars/aguitauwu/Katu-bot?style=social)](https://github.com/aguitauwu/Katu-bot/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/aguitauwu/Katu-bot?style=social)](https://github.com/aguitauwu/Katu-bot/network/members)

*🐱 *ronronea suavemente* Hecho con 💖 por la comunidad kawaii de programación!*

**¡Nya~ Gracias por elegir Katu Bot para tu servidor de Discord! 🐱✨**

[**🔗 Repositorio Principal**](https://github.com/aguitauwu/Katu-bot) • [**📋 Issues**](https://github.com/aguitauwu/Katu-bot/issues) • [**💬 Discussions**](https://github.com/aguitauwu/Katu-bot/discussions)

</div>