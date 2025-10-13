# 🔴 Redis Setup & Architecture - AppQuiz

## 📋 ¿Por qué Redis?

**Problema Anterior:**
- Estado del juego en memoria (Maps de JavaScript)
- ❌ Recarga de página = pérdida de estado
- ❌ Sin reconexión automática
- ❌ No escalable a múltiples instancias

**Solución con Redis:**
- ✅ Estado persistente en Redis (TTL automático)
- ✅ Recargar página = sesión se recupera
- ✅ Reconexión automática
- ✅ Escalable a múltiples servidores
- ✅ Ultra rápido (<1ms access time)

---

## 🏗️ Nueva Arquitectura

```
┌─────────────────────────────────────────────┐
│           CLIENTE (Browser)                  │
│  React + Socket.IO Client                   │
└──────────────────┬──────────────────────────┘
                   │
                   │ WebSocket (Socket.IO)
                   │
┌──────────────────▼──────────────────────────┐
│           BACKEND (Node.js)                  │
│  Express + Socket.IO Server                 │
│                                              │
│  ┌──────────────────────────────────────┐  │
│  │   GameplayService                    │  │
│  │   • initializeGame()                 │  │
│  │   • processAnswer()                  │  │
│  │   • getLeaderboard()                 │  │
│  │   • recoverSession() ⭐ NUEVO       │  │
│  └──────────────┬───────────────────────┘  │
│                 │                            │
│  ┌──────────────▼───────────────────────┐  │
│  │   RedisGameSessionService ⭐ NUEVO   │  │
│  │   • createGameSession()              │  │
│  │   • getGameSession()                 │  │
│  │   • setPlayerState()                 │  │
│  │   • getLeaderboard()                 │  │
│  │   • initializeFromDatabase()         │  │
│  └──────────────┬───────────────────────┘  │
└─────────────────┼──────────────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ▼                 ▼
┌─────────────┐   ┌─────────────┐
│   REDIS     │   │ PostgreSQL  │
│ (Sesiones)  │   │ (Permanente)│
│             │   │             │
│ • Estado    │   │ • Resultados│
│   temporal  │   │   finales   │
│ • TTL 2h    │   │ • Historial │
│ • <1ms      │   │ • Users     │
└─────────────┘   └─────────────┘
```

---

## ⚙️ Instalación de Redis

### **Windows**

#### Opción 1: WSL (Recomendado)
```bash
# Instalar WSL si no lo tienes
wsl --install

# Dentro de WSL (Ubuntu)
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo service redis-server start

# Verificar
redis-cli ping
# Debería responder: PONG
```

#### Opción 2: Docker
```bash
# Descargar imagen de Redis
docker pull redis:latest

# Ejecutar contenedor
docker run --name redis-appquiz -p 6379:6379 -d redis

# Verificar
docker ps
```

#### Opción 3: Memurai (Redis nativo para Windows)
1. Descargar de: https://www.memurai.com/
2. Instalar (sigue el wizard)
3. Redis estará corriendo automáticamente en el puerto 6379

---

### **macOS**

```bash
# Usando Homebrew
brew install redis

# Iniciar Redis
brew services start redis

# Verificar
redis-cli ping
# Debería responder: PONG
```

---

### **Linux (Ubuntu/Debian)**

```bash
# Instalar Redis
sudo apt update
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server

# Habilitar inicio automático
sudo systemctl enable redis-server

# Verificar
redis-cli ping
# Debería responder: PONG
```

---

## 🔧 Configuración del Backend

### **1. Variables de Entorno**

Agregar al archivo `Backend/.env`:

```env
# Redis (Game Sessions)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### **2. Verificar Instalación**

El backend intentará conectarse automáticamente. Al iniciar, deberías ver:

```
✅ Redis connected successfully
🚀 Redis ready to accept commands
```

Si Redis **no está disponible**, verás:

```
⚠️ Redis connection failed, continuing without Redis cache
   Game sessions will not persist across server restarts
```

El backend funcionará sin Redis, pero sin persistencia de sesiones.

---

## 📦 Keys en Redis

Redis almacena las siguientes estructuras:

```
game:{gameCode}:state                  → Hash (Estado del juego)
game:{gameCode}:player:{userId}        → Hash (Estado del jugador)
game:{gameCode}:players                → Set (Lista de jugadores)
game:{gameCode}:leaderboard            → Sorted Set (Rankings por score)
game:{gameCode}:q:{questionId}:answers → Hash (Respuestas de pregunta)
games:active                           → Set (Juegos activos)
```

### **Inspeccionar Redis CLI**

```bash
# Conectarse a Redis
redis-cli

# Ver todas las keys
KEYS *

# Ver estado de un juego
GET game:ABC123:state

# Ver leaderboard
ZREVRANGE game:ABC123:leaderboard 0 -1 WITHSCORES

# Ver jugadores de un juego
SMEMBERS game:ABC123:players

# Ver cantidad de jugadores conectados
SCARD game:ABC123:players

# Limpiar todas las keys (¡CUIDADO!)
FLUSHDB
```

---

## 🔄 Flujo de Sesiones

### **Inicio de Juego**
1. Teacher crea juego → `games` table (PostgreSQL)
2. Players se unen → `game_players` table (PostgreSQL)
3. Teacher inicia juego → **Crear sesión en Redis**
4. Estado del juego vive en Redis

### **Durante el Juego**
1. Preguntas y respuestas → **Redis** (rápido)
2. Leaderboard actualiza → **Redis Sorted Set**
3. Respuestas se guardan → **PostgreSQL** (asíncrono)

### **Recarga de Página** ⭐ NUEVO
1. Player recarga navegador
2. Frontend detecta juego activo
3. Emite `game:join-room` con gameCode
4. Backend verifica Redis:
   - ✅ Si existe sesión → Reconectar
   - ❌ Si no existe → Recuperar desde PostgreSQL
5. Player continúa donde se quedó

### **Fin del Juego**
1. Última pregunta respondida
2. Calcular resultados finales → **PostgreSQL**
3. Otorgar recompensas → **PostgreSQL**
4. Limpiar sesión → **Redis** (DELETE keys)

---

## ⏱️ TTL (Time To Live)

Las sesiones en Redis expiran automáticamente:

```typescript
gameSession: 7200 segundos (2 horas)
playerState: 7200 segundos (2 horas)
answerCache: 3600 segundos (1 hora)
```

Si un juego queda abandonado, Redis lo limpia automáticamente.

---

## 🚀 Deployment en Producción

### **Opciones de Redis Cloud**

1. **Upstash** (Recomendado) ⭐
   - Gratis hasta 10,000 comandos/día
   - Serverless (pay per use)
   - Setup: https://upstash.com/
   ```env
   REDIS_HOST=your-redis.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   ```

2. **Redis Cloud** (Redis Labs)
   - Gratis hasta 30MB
   - Setup: https://redis.com/try-free/
   
3. **Railway**
   - Redis como plugin
   - $5/mes
   - Auto-provisioning

4. **Render**
   - Redis managed service
   - $7/mes para 25MB

---

## 🧪 Testing Redis

### **Test Básico**
```bash
# Terminal 1: Iniciar Redis
redis-server

# Terminal 2: Backend
cd Backend
npm run dev

# Terminal 3: Frontend
cd Frontend
npm run dev

# Terminal 4: Redis CLI (opcional)
redis-cli
MONITOR  # Ver todos los comandos en tiempo real
```

### **Test de Persistencia**
1. Crear un juego como teacher
2. Unirse como student
3. Iniciar juego
4. Ver pregunta
5. **Recargar navegador** del student
6. ✅ Debería volver a la misma pregunta
7. Responder pregunta
8. Verificar que score se mantuvo

---

## 📊 Monitoring

### **Ver Estado de Redis**
```bash
redis-cli INFO

# Secciones útiles:
redis-cli INFO stats        # Estadísticas
redis-cli INFO memory       # Uso de memoria
redis-cli INFO clients      # Clientes conectados
redis-cli INFO keyspace     # Keys por DB
```

### **Comandos Útiles**
```bash
# Ver memoria usada
redis-cli INFO memory | grep used_memory_human

# Ver cantidad de keys
redis-cli DBSIZE

# Ver uptime
redis-cli INFO server | grep uptime_in_seconds

# Ver conexiones activas
redis-cli CLIENT LIST
```

---

## ⚠️ Troubleshooting

### **Error: Connection Refused**
```
❌ Redis connection error: Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solución:**
```bash
# Verificar si Redis está corriendo
redis-cli ping

# Si no responde, iniciar Redis
# Windows (WSL): sudo service redis-server start
# macOS: brew services start redis
# Linux: sudo systemctl start redis-server
```

### **Error: Auth Failed**
```
❌ Redis connection error: Error: NOAUTH Authentication required
```

**Solución:**
```bash
# Si Redis tiene contraseña configurada, agregarla al .env
REDIS_PASSWORD=tu-contraseña
```

### **Backend funciona sin Redis**
El backend está diseñado para ser **tolerante a fallos**. Si Redis no está disponible:
- ⚠️ Continuará funcionando
- ❌ Sin persistencia de sesiones
- ❌ Recargar página perderá estado

---

## 🎯 Beneficios Clave

| Característica | Sin Redis | Con Redis |
|----------------|-----------|-----------|
| Recargar página | ❌ Pierde estado | ✅ Recupera sesión |
| Reconexión | ❌ No soportado | ✅ Automática |
| Performance | ⚡ Rápido (memoria) | ⚡⚡ Ultra rápido (<1ms) |
| Escalabilidad | ❌ 1 servidor | ✅ Multi-servidor |
| Persistencia | ❌ Solo RAM | ✅ Redis + PostgreSQL |
| TTL automático | ❌ Manual | ✅ Limpieza automática |

---

## 🆘 Soporte

Si tienes problemas con Redis:

1. Verificar logs del backend: `npm run dev`
2. Verificar Redis CLI: `redis-cli ping`
3. Revisar variables de entorno: `echo $REDIS_HOST`
4. Consultar docs de Redis: https://redis.io/docs/

---

**✅ Con Redis configurado, tu plataforma AppQuiz ahora es:**
- 🔄 **Resiliente** a recargas de página
- 🚀 **Escalable** a miles de jugadores
- ⚡ **Ultra rápida** con <1ms de latency
- 🛡️ **Robusta** con persistencia automática

🎮 **¡Listo para jugar sin interrupciones!**

