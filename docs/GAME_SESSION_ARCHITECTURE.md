# Arquitectura de Sesiones de Juego Persistentes

## 📋 Análisis del Problema Actual

### Síntomas
1. **Recarga en lobby**: Ya no se puede iniciar el juego
2. **Pérdida de estado**: Los jugadores pierden su progreso
3. **Inconsistencias**: Estado dividido entre memoria (Maps) y base de datos
4. **Sin recuperación**: No hay mecanismo de reconexión al estado anterior

### Causas Raíz
```
❌ Estado en memoria (gameRooms Map) → Se pierde al desconectar socket
❌ Estado en BD (games table) → Persiste pero no sincroniza con memoria
❌ No hay "Game Session" como entidad persistente
❌ Socket.IO connection !== Game Session
```

---

## 🎮 Cómo lo Manejan Otros Juegos

### Kahoot / Quizizz / Mentimeter
**Arquitectura de 3 capas:**

1. **Session Layer** (Redis/Memory)
   - Estado temporal de juego activo
   - Respuestas en tiempo real
   - Ranking en vivo
   - TTL automático al finalizar

2. **Persistence Layer** (PostgreSQL/MongoDB)
   - Resultados finales
   - Historial de juegos
   - Estadísticas de usuarios
   - Configuración de juegos

3. **Connection Layer** (Socket.IO/WebSocket)
   - Solo maneja conexiones
   - Se reconecta automáticamente
   - NO almacena estado de juego

**Flujo de reconexión:**
```
1. Usuario recarga página
2. Frontend busca en localStorage: gameCode + userId
3. Backend valida: ¿Existe sesión activa con ese gameCode?
4. Si existe: Recupera estado y reinyecta al cliente
5. Si no existe: Redirige al dashboard
```

### Juegos Multiplayer en Tiempo Real (agar.io, slither.io)

**Patrón de Session Manager:**
```typescript
class GameSessionManager {
  activeSessions: Map<gameCode, GameSession>

  createSession(gameCode) {
    const session = new GameSession()
    session.startTime = now()
    session.expiresAt = now() + 1 hour
    activeSessions.set(gameCode, session)
  }

  getSession(gameCode) {
    const session = activeSessions.get(gameCode)
    if (session.isExpired()) {
      this.destroySession(gameCode)
      return null
    }
    return session
  }

  reconnectPlayer(gameCode, userId, socketId) {
    const session = this.getSession(gameCode)
    if (!session) return { success: false }

    session.updatePlayerSocket(userId, socketId)
    return {
      success: true,
      gameState: session.getCurrentState()
    }
  }
}
```

---

## 🏗️ Arquitectura Propuesta para AppQuiz

### Opción 1: Redis + PostgreSQL (Recomendada)

**Stack:**
- **Redis**: Estado de sesión activa (TTL: 2 horas)
- **PostgreSQL**: Estado permanente (resultados, historial)
- **Socket.IO 4.6+**: Connection State Recovery habilitado

**Estructura de Redis:**
```redis
# Game Session
game:session:{gameCode} → Hash
  - status: "lobby" | "active" | "finished"
  - teacher_id: 123
  - current_question: 2
  - started_at: timestamp
  - expires_at: timestamp
  - question_set_id: 456

# Players in Session
game:players:{gameCode} → Set
  - {user_id} → player data

# Player State
game:player:{gameCode}:{userId} → Hash
  - socket_id: "abc123"
  - nickname: "Player1"
  - is_ready: true
  - score: 5000
  - combo: 3
  - last_seen: timestamp

# Current Question
game:question:{gameCode} → Hash
  - question_id: 789
  - started_at: timestamp
  - time_limit: 30
  - answers_received: 15

# TTL automático
EXPIRE game:session:{gameCode} 7200  # 2 horas
```

**Ventajas:**
- ⚡ Ultra rápido (<1ms latency)
- 🔄 Persistencia automática con AOF
- 🚀 Escalabilidad horizontal
- 🔥 TTL automático limpia sesiones viejas
- 📊 Pub/Sub para sincronización multi-instancia

**Desventajas:**
- 📦 Dependencia adicional (Redis)
- 💾 Requiere más memoria
- 🔧 Más complejo de configurar

---

### Opción 2: Solo PostgreSQL + sessionStorage (Más Simple)

**Stack:**
- **PostgreSQL**: TODO el estado (con índices optimizados)
- **sessionStorage**: Cache del lado del cliente
- **Polling inteligente**: Verificar estado cada 2s solo si hay cambios

**Cambios en BD:**
```sql
-- Agregar campos de sesión
ALTER TABLE games ADD COLUMN session_data JSONB;
ALTER TABLE games ADD COLUMN last_activity TIMESTAMP DEFAULT NOW();
ALTER TABLE games ADD COLUMN expires_at TIMESTAMP;

CREATE INDEX idx_games_active ON games(status)
  WHERE status IN ('lobby', 'starting', 'active');

-- Agregar socket_id a game_players para reconexión
ALTER TABLE game_players ADD COLUMN socket_id VARCHAR(100);
ALTER TABLE game_players ADD COLUMN last_seen TIMESTAMP DEFAULT NOW();

-- Estado de pregunta actual
CREATE TABLE game_question_state (
  game_id INT PRIMARY KEY REFERENCES games(game_id),
  current_question_index INT DEFAULT 0,
  question_started_at TIMESTAMP,
  time_remaining INT,
  answers_received INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Frontend sessionStorage:**
```typescript
// Guardar al unirse al juego
sessionStorage.setItem('activeGame', JSON.stringify({
  gameCode: 'ABC123',
  userId: 123,
  joinedAt: Date.now(),
  role: 'student' | 'teacher'
}))

// Verificar al cargar cualquier página
useEffect(() => {
  const activeGame = sessionStorage.getItem('activeGame')
  if (activeGame) {
    const { gameCode, userId } = JSON.parse(activeGame)
    // Intentar reconectar
    socket.emit('game:reconnect', { gameCode, userId })
  }
}, [])
```

**Ventajas:**
- ✅ Sin dependencias adicionales
- 🏗️ Arquitectura más simple
- 🔍 Más fácil de debuggear
- 💰 Menor costo de infraestructura

**Desventajas:**
- 🐌 Más lento (10-50ms latency vs <1ms)
- 🔄 Más carga en PostgreSQL
- 📈 Difícil escalar a miles de usuarios simultáneos

---

## 🎯 Solución Recomendada: Híbrido Pragmático

**Para el Sprint actual (Rápido):**
1. Usar PostgreSQL + sessionStorage
2. Implementar event `game:reconnect`
3. Guardar estado en BD más frecuentemente
4. Frontend usa sessionStorage para detectar sesión activa

**Para el futuro (Escalabilidad):**
1. Migrar a Redis cuando haya >100 juegos simultáneos
2. Implementar Socket.IO Connection State Recovery
3. Usar Redis Pub/Sub para múltiples instancias

---

## 📝 Plan de Implementación (Sprint Actual)

### Backend

#### 1. Nuevo evento: `game:reconnect`
```typescript
socket.on('game:reconnect', async ({ gameCode, userId }, callback) => {
  const game = await prisma.games.findUnique({
    where: { game_code: gameCode },
    include: { game_players: true }
  })

  if (!game) return callback({ success: false, reason: 'game_not_found' })
  if (game.status === 'finished' || game.status === 'cancelled') {
    return callback({ success: false, reason: 'game_ended' })
  }

  // Actualizar socket_id del jugador
  await prisma.game_players.updateMany({
    where: { game_id: game.game_id, user_id: userId },
    data: {
      socket_id: socket.id,
      last_seen: new Date()
    }
  })

  // Unirse al room
  socket.join(`game:${gameCode}`)

  // Obtener estado actual
  const gameState = await GameplayService.getGameState(gameCode)

  callback({
    success: true,
    game,
    gameState,
    shouldRedirectTo: game.status === 'lobby' ? 'lobby' : 'gameplay'
  })
})
```

#### 2. Servicio: `GameplayService.getGameState()`
```typescript
async getGameState(gameCode: string) {
  const game = await prisma.games.findUnique({
    where: { game_code: gameCode },
    include: {
      game_players: {
        include: { users: true },
        orderBy: { score: 'desc' }
      }
    }
  })

  const currentQuestion = gameStates.get(gameCode)?.currentQuestion || null
  const timeRemaining = gameStates.get(gameCode)?.timeRemaining || 0

  return {
    status: game.status,
    currentQuestion,
    timeRemaining,
    leaderboard: game.game_players.map(p => ({
      rank: ...,
      user_id: p.user_id,
      nickname: p.nickname,
      score: p.score,
      // ...
    }))
  }
}
```

#### 3. Persistir estado de pregunta
```typescript
// En sendQuestion()
await prisma.games.update({
  where: { game_code: gameCode },
  data: {
    session_data: {
      currentQuestionIndex: ...,
      questionStartedAt: new Date(),
      timeLimit: 30
    },
    last_activity: new Date()
  }
})
```

### Frontend

#### 1. Hook: `useGameSession()`
```typescript
function useGameSession() {
  const navigate = useNavigate()
  const socket = getSocket()

  useEffect(() => {
    const activeGame = sessionStorage.getItem('activeGame')
    if (activeGame && socket) {
      const { gameCode, userId } = JSON.parse(activeGame)

      socket.emit('game:reconnect', { gameCode, userId }, (response) => {
        if (response.success) {
          // Redirigir a la página correcta
          navigate(response.shouldRedirectTo === 'lobby'
            ? `/game/lobby/${gameCode}`
            : `/game/play/${gameCode}`
          )
        } else {
          // Sesión expirada, limpiar
          sessionStorage.removeItem('activeGame')
        }
      })
    }
  }, [socket])
}
```

#### 2. Guardar sesión al unirse
```typescript
// En GameLobbyPage al unirse exitosamente
socket.emit('game:join', { gameCode }, (response) => {
  if (response.success) {
    sessionStorage.setItem('activeGame', JSON.stringify({
      gameCode,
      userId: user.id,
      joinedAt: Date.now(),
      role: user.role
    }))
  }
})
```

#### 3. Limpiar sesión al salir
```typescript
// En FinalResultsScreen o al cancelar juego
useEffect(() => {
  if (phase === 'finished') {
    sessionStorage.removeItem('activeGame')
  }
}, [phase])
```

---

## 🔥 Beneficios de Esta Solución

✅ **Sin dependencias nuevas** (no necesita Redis ahora)
✅ **Reconexión automática** al recargar página
✅ **Estado persistente** en PostgreSQL
✅ **Sesión del navegador** maneja el contexto
✅ **Compatible con Sprint 5** (sin refactor mayor)
✅ **Escalable** (migrar a Redis después si es necesario)

---

## 🧪 Casos de Prueba

1. ✅ **Recarga en lobby (estudiante)** → Vuelve al lobby, puede marcar listo
2. ✅ **Recarga en lobby (profesor)** → Vuelve al lobby, puede iniciar juego
3. ✅ **Recarga durante juego (estudiante)** → Vuelve al juego en la pregunta actual
4. ✅ **Recarga durante juego (profesor)** → Vuelve al panel de control
5. ✅ **Recarga en resultados finales** → Muestra resultados, limpia sesión
6. ✅ **Cerrar tab y reabrir** → NO reconecta (sessionStorage solo en tab)
7. ✅ **Juego cancelado** → Limpia sesión, redirige a dashboard
8. ✅ **Nueva tab con mismo gameCode** → Nueva conexión independiente

---

## 📚 Referencias

- [Socket.IO Connection State Recovery](https://socket.io/docs/v4/connection-state-recovery)
- [Building Real-Time Multiplayer with Socket.IO and Redis](https://dev.to/dowerdev/building-a-real-time-multiplayer-game-server-with-socketio-and-redis-architecture-and-583m)
- [Redis for Gaming Session Management](https://redis.io/industries/gaming/)
- [Kahoot Clone Architecture with Firebase](https://rotemtam.medium.com/build-a-kahoot-clone-with-angularjs-and-firebase-b8b30891d968)
