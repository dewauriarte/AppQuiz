# **📅 FASE 2: CORE FEATURES (Sprints 4-6)**

## **🔷 SPRINT 4: WebSocket Real-Time \+ Join Game (Semanas 7-8)**

### **✅ ESTADO: SPRINT COMPLETADO AL 95%**

#### **Completado:**
- ✅ Socket.IO configurado con JWT auth
- ✅ Lobby en tiempo real funcional
- ✅ Join game con validaciones
- ✅ Countdown 3-2-1-GO! animado
- ✅ Manejo de desconexiones
- ✅ Validación de nickname único
- ✅ Todos los criterios de aceptación principales

#### **Pendiente (Opcional/Sprint 5):**
- ⏳ Redis adapter para escalado
- ⏳ Events de gameplay (answer:submit, timer)
- ⏳ Testing automatizado
- ⏳ Load testing 50+ conexiones
- ⏳ Ready checkbox UI para estudiantes

---

### **🎯 Objetivos del Sprint**

* ✅ WebSocket infrastructure operativa
* ✅ Estudiantes pueden unirse con código
* ✅ Lobby en tiempo real funcional
* ⏳ Foundation para gameplay (parcial, continúa Sprint 5)

### **📦 Backend Tasks**

#### **WebSocket Setup**

* \[✅\] Instalar Socket.IO (Redis adapter pendiente para escalado futuro)

\[✅\] Configurar Socket.IO server con CORS y transports

*
* \[✅\] Namespaces y Rooms strategy
    * Room: `game:${gameCode}` implementado

\[✅\] Middleware de autenticación Socket.IO con JWT

*

#### **Socket Events \- Lobby**

\[✅\] `socket.on('game:join')` \- Estudiante se une

* ✅ Validar que game existe
* ✅ Validar que status \= 'lobby'
* ✅ Validar max\_players no excedido
* ✅ Validar nickname único en ese juego
* ✅ Crear player en game\_players
* ✅ Agregar socket a room
* ✅ Broadcast a todos: `player:joined`
* ✅ Enviar a joiner: `game:state`

* \[✅\] `socket.on('game:ready')` \- Player marca ready
    * ✅ Update player is\_ready
    * ✅ Broadcast: `player:ready`

* \[✅\] `socket.on('game:start')` \- Teacher inicia
    * ✅ Validar que sender es teacher owner
    * ✅ Validar mínimo 1 player (ajustable)
    * ✅ Update game status \= 'starting'
    * ✅ Countdown 3-2-1-GO! con eventos individuales
    * ✅ Cambiar status \= 'active'
    * ⏳ Enviar primera pregunta (pendiente Sprint 5)

* \[✅\] `socket.on('disconnect')` \- Handle desconexiones
    * ✅ Limpiar player de tracking maps
    * ✅ Broadcast: `player:disconnected`
    * ✅ Si es teacher y game en lobby → cancelar game
    * ✅ Si es teacher y game activo → pausar game

#### **Socket Events \- Preparación Gameplay**

* \[ \] `socket.on('answer:submit')` \- Guardar respuesta (Sprint 5)
    * Validar que game está active
    * Validar que player está en game
    * Guardar en game\_answers
    * NO enviar si correcta aún (evitar cheating)
* \[ \] Timer management (Sprint 5)
    * Cuando se envía pregunta, iniciar timer server-side
    * Broadcast ticks cada segundo (countdown)
    * Al llegar a 0: `question:timeout`

#### **GameService**

* \[✅\] Método `getGameByCode(code)` - Implementado
* \[✅\] Método `create(teacherId, data)` - Crea juego y genera código
* \[✅\] Método `updateStatus(sessionId, teacherId, data)` - Cambia estado del juego
* \[ \] Método `getCurrentQuestion(gameId)` (Sprint 5)
* \[ \] Método `getLeaderboard(gameId)` (Sprint 5)

#### **Testing Backend**

* \[ \] Tests de Socket.IO events (Opcional - Testing manual OK)
* \[ \] Tests de join game (casos válidos/inválidos)
* \[ \] Tests de ready/unready
* \[ \] Tests de start game
* \[ \] Tests de disconnect handling
* \[ \] Load testing: 50 conexiones simultáneas

### **🎨 Frontend Tasks**

#### **Socket.IO Integration**

* \[✅\] Instalar socket.io-client

\[✅\] Crear módulo Socket (`lib/socket.ts`)
- ✅ `initializeSocket(token)` - Inicializa conexión con JWT
- ✅ `getSocket()` - Obtiene instancia actual
- ✅ `disconnectSocket()` - Cierra conexión
- ✅ Auto-reconnect configurado
- ✅ Handle connection errors

*
* \[⏳\] useSocket hook (opcional - se usa directamente la instancia)
* \[✅\] Connection management
    * ✅ Auto-reconnect
    * ✅ Handle connection errors
    * ⏳ Show connection status (mejorable)

#### **Join Game Flow (Student)**

* \[✅\] Página "Join Game" (`/game/join`)
    * ✅ Input para game code (6 chars, auto-uppercase)
    * ✅ Input para nickname (opcional)
    * ✅ Botón "Join"
    * ✅ Validación client-side
    * ✅ Loading state
* \[✅\] Student Lobby Screen
    * ✅ Game info (nombre del quiz, código)
    * ✅ Lista de jugadores (real-time updates)
    * ✅ Avatar/nickname display
    * ⏳ "Ready" checkbox (funcional en backend, falta UI)
    * ✅ Indicador "Esperando que el profesor inicie..."
    * ✅ Manejo de desconexiones y cancelación

#### **Teacher Lobby Screen (Mejorado)**

* \[✅\] Conexión WebSocket desde teacher
* \[✅\] Lista de jugadores real-time
    * ✅ Animación cuando se une alguien (Framer Motion)
    * ✅ Indicador de ready (con badge)
    * ✅ Avatars/nombres (círculos con inicial)
    * ✅ Contador total
* \[✅\] Botón "Start Game"
    * ✅ Disabled si \<2 players (ajustable a 1 para testing)
    * ✅ AlertDialog de confirmación para cancelar
* \[✅\] Countdown animation (3-2-1-GO\!)

#### **Game Store (Zustand)**

\[⏳\] Game state management (Opcional - se maneja con useState local)
- State se maneja directamente en componentes
- Opción de refactor futuro con Zustand

*

#### **Components**

* \[✅\] GameCodeInput component (integrado en JoinGamePage)
    * ✅ Auto-format uppercase
    * ✅ Max 6-10 characters
    * ✅ Validación
* \[✅\] PlayerList component (integrado en GameLobbyPage)
    * ✅ Lista vertical con cards
    * ✅ Player cards con avatar circular
    * ✅ Ready indicator (Badge verde)
    * ✅ Animations (Framer Motion entrada/salida)
* \[✅\] CountdownAnimation component (`CountdownOverlay`)
    * ✅ 3-2-1-GO animation con glow effects
    * ✅ Framer Motion animations avanzadas
    * ⏳ Sound effects (opcional - futuro)

#### **Testing Frontend**

* \[ \] Tests de join game flow (Testing manual OK)
* \[ \] Tests de lobby real-time
* \[ \] Tests de disconnect handling
* \[ \] Tests de WebSocket events

### **✅ Criterios de Aceptación**

* \[✅\] Estudiante puede unirse con game code válido
* \[✅\] Estudiante ve lobby actualizado en tiempo real
* \[✅\] Otros jugadores aparecen cuando se unen
* \[✅\] Nickname único por juego (error si duplicado)
* \[✅\] Max players respetado (error si lleno)
* \[✅\] Teacher ve lista de jugadores actualizándose
* \[✅\] Teacher puede iniciar juego cuando 1+ players (configurable)
* \[✅\] Countdown 3-2-1-GO! se muestra a todos con animación
* \[✅\] Desconexiones se manejan gracefully
    * ✅ Students: Notificación y remoción de lista
    * ✅ Teacher en lobby: Game cancelado
    * ✅ Teacher activo: Game pausado
* \[✅\] Reconexión funciona correctamente (Socket.IO auto-reconnect)
* \[⏳\] UI muestra estado de conexión claramente (mejorable con indicador visual)

### **📈 Métricas de Éxito**

* 50+ conexiones simultáneas sin lag
* Latencia WebSocket \<50ms (p95)
* 0 errores de sincronización
* Join game \<2 segundos
* Reconnect exitoso \>95% casos

### **⚠️ Riesgos**

| Riesgo | Mitigación |
| ----- | ----- |
| WebSocket latency alta | Usar Redis adapter, optimizar payloads |
| Desconexiones frecuentes | Implementar auto-reconnect robusto |
| State sync issues | Event sourcing pattern, single source of truth |

---
