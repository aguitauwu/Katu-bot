#  KATU BOT - 

<div align="center">

<img src="assets/katu-avatar.png" alt="Katu Bot Avatar" width="200" height="200" style="border-radius: 50%; border: 3px solid #FF69B4;"/>

![KATU Banner](https://img.shields.io/badge/🐱✨-KATU_BOT-FF69B4?style=for-the-badge&labelColor=FF91A4)

[![Node.js](https://img.shields.io/badge/Node.js-18+-3776AB?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Discord.js](https://img.shields.io/badge/Discord.js-v14+-7289DA?style=flat-square&logo=discord&logoColor=white)](https://discord.js.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Latest-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Powered-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)
[![Kawaii](https://img.shields.io/badge/Kawaii-100%25-FF1493?style=flat-square)](.)

**¡Soy Katu Bot! ni yo se que soy ~**

*Bot especializado en rastrear mensajes diarios, generar rankings y pos hablar con ia*

## 🚀 **¡Úsalo AHORA en Replit!**

[![Run on Replit](https://img.shields.io/badge/🔥_Usar_en_Replit-4DFF4D?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/@regularcatfishz/Katu?s=app)

**¿Quieres probar Katu Bot inmediatamente sin instalación?** ¡Solo haz clic arriba! 🎉

[📋 Ver Comandos](#-comandos-disponibles) • [🌐 Usar en Replit](#-usar-en-replit-súper-fácil) • [🚀 Instalación Local](#-instalación-local) • [💻 VS Code/Cursor](#-instalación-en-editores) • [🗄️ Base de Datos](#-sistema-de-base-de-datos) • [📖 Documentación](#-documentación)

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

## 🤖✨ Asistente IA con Gemini

<div align="center">
<img src="https://img.shields.io/badge/🧠-Gemini_AI-4285F4?style=for-the-badge&labelColor=34A853&logo=google" alt="Gemini AI"/>
</div>

### 🌟 **¡Katu tiene personalidad propia!**

Katu Bot no es solo un contador de mensajes, ¡también e una ia ! 

**🐱 Personalidad:**
- *Cómo un humano we 🗣️🔥🔥** 
- **Powered by Google Gemini AI** 🧠

### 💬 **Cómo conversar con Katu:**

| Método | Comando | Ejemplo |
|--------|---------|---------|
| 🔗 **Mención** | `@katu [mensaje]` | `@katu ¿cuánto es 2+2?` |
| 🐱 **Palabra clave** | `katu [mensaje]` | `katu cuéntame un chiste` |

### 🎯 **Capacidades de la IA:**

- ✅ **Conversaciones naturales** en español
- ✅ **Resolución de problemas** matemáticos y lógicos  
- ✅ **Explicaciones técnicas** simplificadas
- ✅ **Recomendaciones** de anime, música, juegos
- ✅ **Ayuda con programación** y tecnología
- ✅ **Datos curiosos** y trivia general
- ✅ **Soporte emocional** con personalidad kawaii

### 🛡️ **Configuración IA:**

```env
# Requerido para funcionalidad IA
GEMINI_API_KEY=tu_api_key_de_gemini_aqui
```

**💡 Tip:** ¡Katu responde 24/7 y nunca se cansa de platicar contigo! *nya~* 🐱

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

## 🚀 Instalación Local

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

# AI Configuration (Gemini)
GEMINI_API_KEY=tu_api_key_de_gemini_aqui

# Database (MongoDB recomendado)
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/katubot

# Opcional: PostgreSQL como alternativa
# DATABASE_URL=postgresql://user:password@host:port/database

# Session & Security
SESSION_SECRET=tu_session_secret_aqui

# Environment
NODE_ENV=development
```

---

## 🌐 Usar en Replit (¡Súper Fácil!)

### 🚀 **Opción 1: Fork Directo**

[![Run on Replit](https://img.shields.io/badge/🔥_Fork_en_Replit-4DFF4D?style=for-the-badge&logo=replit&logoColor=white)](https://replit.com/@regularcatfishz/Katu?s=app)

**¡La forma más rápida de empezar!** 

1. **Haz clic en el botón de arriba** - Se abrirá el proyecto en Replit
2. **Haz Fork** - Crea tu propia copia del bot
3. **Configura las variables de entorno en Secrets:**
   - `DISCORD_TOKEN` - Token de tu bot de Discord
   - `GEMINI_API_KEY` - API key de Google Gemini
   - `MONGODB_URI` - URI de MongoDB (opcional)
4. **Presiona Run** - ¡Tu bot estará activo inmediatamente!

### 🎯 **Opción 2: Desde Cero en Replit**

1. **Crear nuevo Repl:**
   - Ve a [Replit.com](https://replit.com)
   - Crea nuevo Repl: Node.js
   - Nombra tu proyecto: "Katu-Bot"

2. **Importar código:**
   ```bash
   # En el terminal de Replit
   git clone https://github.com/aguitauwu/Katu-bot.git .
   npm install
   ```

3. **Configurar Secrets:**
   - Ir a **Secrets** tab (candado) en la barra lateral
   - Agregar las variables necesarias del `.env.example`

4. **Ejecutar:**
   ```bash
   npm run dev
   ```

### 💡 **Ventajas de Replit:**

- ✅ **Sin instalación**: Todo en el navegador
- ✅ **Hosting gratuito**: Tu bot estará online 24/7
- ✅ **Fácil configuración**: Secrets integrados
- ✅ **Colaboración**: Comparte tu bot fácilmente
- ✅ **Auto-restart**: Si se cae, se reinicia automáticamente

---

## 💻 Instalación en Editores

### 🎯 **Visual Studio Code**

<details>
<summary><b>📝 Configuración Completa</b></summary>

1. **Instalar VS Code y abrir proyecto:**
   ```bash
   # Descargar VS Code: https://code.visualstudio.com/
   # Clonar repositorio
   git clone https://github.com/aguitauwu/Katu-bot.git
   
   # Abrir en VS Code
   code Katu-bot
   ```

2. **Extensiones recomendadas (instalar automáticamente):**
   - **TypeScript and JavaScript Language Features** (incluida)
   - **Discord.js Snippets** - Autocompletado para Discord.js
   - **MongoDB for VS Code** - Explorador de MongoDB integrado
   - **GitLens** - Historial y blame de Git avanzado
   - **ESLint** - Linting de código TypeScript
   - **Prettier** - Formateo automático de código
   - **Auto Import - TypeScript** - Imports automáticos

3. **Configuración del workspace (.vscode/settings.json):**
   ```json
   {
     "typescript.preferences.importModuleSpecifier": "relative",
     "editor.formatOnSave": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
     "files.exclude": {
       "**/node_modules": true,
       "**/dist": true,
       "**/.env": false
     },
     "typescript.suggest.autoImports": true,
     "editor.quickSuggestions": {
       "strings": true
     }
   }
   ```

4. **Setup completo paso a paso:**
   ```bash
   # Terminal integrado: Ctrl+Shift+`
   
   # 1. Instalar dependencias
   npm install
   
   # 2. Configurar variables de entorno
   cp .env.example .env
   # Editar .env con tus credenciales (Ctrl+P -> .env)
   
   # 3. Configurar Discord Bot:
   # - Ir a https://discord.com/developers/applications
   # - Crear nueva aplicación
   # - Bot > Reset Token > Copiar token
   # - Pegar en DISCORD_TOKEN en .env
   # - Habilitar "Message Content Intent"
   
   # 4. Configurar Gemini IA:
   # - Ir a https://aistudio.google.com/app/apikey
   # - Crear API Key
   # - Pegar en GEMINI_API_KEY en .env
   
   # 5. Configurar MongoDB:
   # - Registrarte en https://cloud.mongodb.com
   # - Crear cluster gratuito
   # - Obtener connection string
   # - Pegar en MONGODB_URI en .env
   
   # 6. Ejecutar proyecto
   npm run dev
   
   # ✅ Verificar en terminal: "🤖 Bot autenticado exitosamente"
   ```

5. **Features útiles de VS Code:**
   - **Ctrl+P**: Búsqueda rápida de archivos
   - **Ctrl+Shift+P**: Paleta de comandos
   - **F12**: Ir a definición
   - **Ctrl+`**: Terminal integrado
   - **Ctrl+Shift+\`**: Nueva terminal
   - **Ctrl+K+C**: Comentar líneas
   - **Alt+↑/↓**: Mover líneas

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