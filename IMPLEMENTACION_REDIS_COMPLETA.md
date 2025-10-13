# 🎮 Implementación Completa de Sesiones Persistentes con Redis

## 📋 Resumen

Se implementó una **arquitectura robusta de sesiones de juego persistentes** usando Redis como fuente única de verdad, siguiendo las mejores prácticas de aplicaciones como Kahoot y Quizizz.

## 🎯 Problema Solucionado

### Antes:
- ❌ Al recargar la página en el lobby, no se podía iniciar el juego
- ❌ Al recargar durante el juego, se perdía todo el progreso
- ❌ Estado fragmentado entre Maps en memoria, Redis parcial y PostgreSQL
- ❌ Orden de preguntas cambiaba cada vez (shuffle inconsistente)
- ❌ No había recuperación automática de estado

### Ahora:
- ✅ Recargar en lobby mantiene todo el estado
- ✅ Recargar durante el juego muestra la pregunta actual
- ✅ Estado 100% en Redis (fuente única de verdad)
- ✅ Orden de preguntas persistido y consistente
- ✅ Recuperación automática de estado completo

---

## 🏗️ Arquitectura Implementada

### Capa 1: Redis (Estado Temporal)
- **Sesión de juego activa**
- **Estado de jugadores en tiempo real**
- **Orden de preguntas (shuffled)**
- **Nicknames de jugadores**
- **Respuestas en caché**
- **Leaderboard en tiempo real**
- **TTL automático**: 2 horas (limpieza automática)

### Capa 2: PostgreSQL (Estado Permanente)
- **Resultados finales**
- **Historial de juegos**
- **Estadísticas de usuario**
- **Datos de configuración**

### Capa 3: Socket.IO (Solo Conexiones)
- **Conexiones en tiempo real**
- **Eventos de sincronización**
- **NO almacena estado de juego**

---

## 📁 Archivos Modificados

### Backend

#### 1. `Backend/src/config/redis.ts`
**Cambios**:
- ✅ Configuración de 3 clientes Redis (main, pub, sub)
- ✅ Event handlers para conexión
- ✅ Graceful shutdown

#### 2. `Backend/src/services/RedisGameSessionService.ts`
**Nuevas funcionalidades**:
- ✅ `setQuestionOrder()` - Persiste orden de preguntas shuffled
- ✅ `getQuestionOrder()` - Recupera orden persistido
- ✅ `setPlayerNickname()` - Guarda nicknames en Redis
- ✅ `getAllNicknames()` - Obtiene todos los nicknames
- ✅ `isNicknameInUse()` - Valida nicknames únicos
- ✅ `addPlayerToGame()` - Agrega jugador a set de jugadores
- ✅ `getPlayerIds()` - Lista IDs de jugadores
- ✅ `initializeFromDatabase()` - Recuperación completa desde BD

**Keys de Redis usadas**:
```
game:{gameCode}:state           - Estado del juego
game:{gameCode}:players         - Set de user IDs
game:{gameCode}:nicknames       - Hash userId->nickname
game:{gameCode}:questions       - Lista ordenada de question IDs (NUEVO)
game:{gameCode}:player:{userId} - Estado de jugador individual
game:{gameCode}:leaderboard     - Sorted set por score
game:{gameCode}:q:{qId}:answers - Respuestas de pregunta
games:active                    - Set de códigos de juegos activos
```

#### 3. `Backend/src/services/GameplayService.ts`
**Cambios críticos**:
- ✅ `initializeGame()` ahora guarda orden de preguntas en Redis
- ✅ `prepareQuestion()` usa orden desde Redis (no recalcula shuffle)
- ✅ `initializeQuestionOrder()` helper para regenerar orden
- ✅ Inicializa jugadores en Redis al crear sesión

**Antes**:
```typescript
// Shuffle cada vez - INCONSISTENTE
questions = shuffleArray([...questions]);
```

**Ahora**:
```typescript
// Shuffle UNA vez y persistir en Redis
questionIds = shuffleArray([...questionIds]);
await RedisGameSessionService.setQuestionOrder(gameCode, questionIds);

// Luego siempre usar orden desde Redis
const questionOrder = await RedisGameSessionService.getQuestionOrder(gameCode);
const currentQuestionId = questionOrder[gameSession.currentQuestionIndex];
```

#### 4. `Backend/src/socket/gameHandlers.ts`
**Cambios mayores**:
- ❌ Eliminado: `gameRooms` Map (en memoria)
- ❌ Eliminado: `playerNicknames` Map (en memoria)
- ✅ TODO el estado ahora en Redis

**Eventos modificados**:
- `game:join` - Valida nicknames desde Redis
- `game:join-room` - Recupera sesión desde Redis si no existe
- `game:start` - Obtiene jugadores desde Redis
- `game:leave` - Actualiza Redis y BD
- `disconnect` - Busca juegos activos en Redis

**Nuevo evento**:
- ✅ `game:get-state` - Recupera estado completo desde Redis
  - Retorna: gameSession, playerState, leaderboard, allPlayers, currentQuestion

### Frontend

#### 5. `Frontend/src/pages/GamePlayPage.tsx`
**Cambios críticos**:
- ✅ Al unirse al room, si el juego está `active` o `starting`, emite `game:get-state`
- ✅ Recupera pregunta actual desde Redis
- ✅ Restaura leaderboard y total de jugadores
- ✅ Mapea formato de datos correctamente
- ✅ Muestra toast de confirmación al recuperar

**Flujo de recuperación**:
```typescript
1. socket.emit('game:join-room') → Unirse al room
2. if (gameStatus === 'active') → Verificar si juego activo
3. socket.emit('game:get-state') → Pedir estado completo
4. Restaurar: currentQuestion, leaderboard, players
5. setPhase('question') → Cambiar a vista de pregunta
```

#### 6. `Frontend/src/pages/GameLobbyPage.tsx`
**Cambios**:
- ✅ Actualiza jugadores desde respuesta de `game:join-room`
- ✅ Muestra toast de confirmación al conectar
- ✅ Redirige automáticamente si el juego ya empezó

---

## 🔄 Flujo Completo de Recuperación

### Escenario: Recargar durante el juego

1. **Usuario recarga página** (F5)

2. **Frontend**: `GamePlayPage` se monta
   ```typescript
   socket.emit('game:join-room', { gameCode })
   ```

3. **Backend**: Handler `game:join-room`
   ```typescript
   // Verificar si sesión existe en Redis
   const sessionExists = await RedisGameSessionService.getGameSession(gameCode);

   if (!sessionExists) {
     // Recuperar desde BD
     await GameplayService.recoverSession(gameCode);
   }

   // Marcar jugador como conectado
   await GameplayService.setPlayerConnection(gameCode, userId, true);
   ```

4. **Frontend**: Callback de `join-room`
   ```typescript
   if (gameStatus === 'active') {
     socket.emit('game:get-state', { gameCode })
   }
   ```

5. **Backend**: Handler `game:get-state`
   ```typescript
   const gameSession = await RedisGameSessionService.getGameSession(gameCode);
   const playerState = await RedisGameSessionService.getPlayerState(gameCode, userId);
   const currentQuestion = await GameplayService.prepareQuestion(gameCode); // Usa orden de Redis
   const leaderboard = await GameplayService.getLeaderboard(gameCode);

   // Retornar todo el estado
   callback({ success: true, state: { ... } });
   ```

6. **Frontend**: Restaurar UI
   ```typescript
   setCurrentQuestion(questionData);
   setLeaderboard(state.leaderboard);
   setPhase('question');
   toast.success('Estado recuperado');
   ```

7. **Usuario ve la pregunta actual** - Sin pérdida de datos

---

## 🧪 Cómo Probar

### 1. Asegurar que Redis esté corriendo
```bash
redis-server
```

### 2. Iniciar Backend
```bash
cd Backend
npm run dev
```

Debe mostrar:
```
✅ Redis connected successfully
✅ Database connected successfully
🚀 Redis ready to accept commands
```

### 3. Iniciar Frontend
```bash
cd Frontend
npm run dev
```

### 4. Crear juego y recargar
1. Login como teacher
2. Crear juego
3. **Recargar página (F5)**
4. ✅ Debe volver al lobby con el mismo código

### 5. Iniciar juego y recargar
1. Iniciar el juego
2. Esperar a que aparezca una pregunta
3. **Recargar página (F5)**
4. ✅ Debe mostrar la misma pregunta

### 6. Verificar en Redis
```bash
redis-cli
SMEMBERS games:active
GET game:ABC123:state
LRANGE game:ABC123:questions 0 -1
```

---

## 📊 Datos Persistidos en Redis

### Estado de Juego (game:{code}:state)
```json
{
  "gameId": 1,
  "gameCode": "ABC123",
  "teacherId": 1,
  "questionSetId": 1,
  "totalQuestions": 10,
  "currentQuestionIndex": 2,
  "status": "active",
  "questionStartTime": 1234567890,
  "config": { "shuffle_questions": true },
  "createdAt": 1234567890,
  "startedAt": 1234567890
}
```

### Orden de Preguntas (game:{code}:questions)
```json
[45, 23, 67, 12, 89, 34, 56, 78, 90, 11]
// IDs de preguntas en orden shuffled (PERSISTIDO)
```

### Estado de Jugador (game:{code}:player:{userId})
```json
{
  "userId": 5,
  "nickname": "JohnDoe",
  "score": 850,
  "correctAnswers": 7,
  "wrongAnswers": 1,
  "comboStreak": 3,
  "highestCombo": 5,
  "totalTimeTaken": 45000,
  "isConnected": true
}
```

---

## 🎯 Ventajas de esta Arquitectura

1. **Persistencia a Recargas**
   - El estado sobrevive a recargas de página
   - Reconexión automática sin pérdida de datos

2. **Escalabilidad**
   - Soporte para múltiples instancias del servidor
   - Pub/Sub de Redis para sincronización

3. **Rendimiento**
   - Acceso < 1ms desde Redis
   - PostgreSQL solo para datos permanentes

4. **Limpieza Automática**
   - TTL de 2 horas elimina sesiones viejas
   - No requiere limpieza manual

5. **Consistencia**
   - Orden de preguntas shuffled persistido
   - Misma pregunta al recargar

6. **Confiabilidad**
   - Recuperación desde BD si Redis falla
   - Logs detallados para debugging

---

## 🚨 Troubleshooting

### Problema: "Cargando infinitamente"
**Solución**:
1. Verificar que Redis esté corriendo: `redis-cli ping`
2. Revisar logs del backend buscar errores
3. Abrir consola del navegador (F12) y ver logs
4. Verificar que el evento `game:get-state` se emita

### Problema: "Error al unirse al juego"
**Solución**:
1. Verificar que el juego exista en BD
2. Verificar que Redis tenga la sesión
3. Si la sesión expiró (TTL), crear juego nuevo

### Problema: "Pregunta diferente al recargar"
**Solución**:
1. Verificar que `game:{code}:questions` existe en Redis
2. Ver logs del backend: "Question order not found"
3. Reiniciar el juego desde lobby

---

## 📝 Próximos Pasos (Opcional)

1. **Guardar orden en BD** - Para recovery perfecto si Redis se reinicia
2. **Snapshot periódico** - Guardar estado en BD cada N minutos
3. **Métricas con Redis** - Tracking de performance
4. **Cluster de Redis** - Para alta disponibilidad en producción

---

## ✅ Checklist de Implementación

- [x] Configuración de Redis
- [x] RedisGameSessionService con todas las funciones
- [x] Persistencia de orden de preguntas
- [x] Persistencia de nicknames
- [x] GameplayService usa Redis como fuente única
- [x] Eliminación de Maps en memoria en gameHandlers
- [x] Evento `game:get-state` implementado
- [x] Frontend recupera estado al recargar
- [x] Logs detallados para debugging
- [x] Documentación completa
- [x] Guía de pruebas

---

**Estado**: ✅ **IMPLEMENTACIÓN COMPLETA**

**Arquitectura**: 🎯 **Siguiendo mejores prácticas de Kahoot/Quizizz**

**Resultado**: 🚀 **Sesiones persistentes 100% funcionales con Redis**
