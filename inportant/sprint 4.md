# **📅 FASE 2: CORE FEATURES (Sprints 4-6)**

## **🔷 SPRINT 4: WebSocket Real-Time \+ Join Game (Semanas 7-8)**

### **🎯 Objetivos del Sprint**

* WebSocket infrastructure operativa
* Estudiantes pueden unirse con código
* Lobby en tiempo real funcional
* Foundation para gameplay

### **📦 Backend Tasks**

#### **WebSocket Setup**

* \[ \] Instalar Socket.IO \+ Redis adapter

\[ \] Configurar Socket.IO server  
const io \= new Server(server, {  cors: { origin: process.env.CLIENT\_URL },  transports: \['websocket', 'polling'\]});// Redis adapter para scalingconst pubClient \= createClient({ url: process.env.REDIS\_URL });const subClient \= pubClient.duplicate();io.adapter(createAdapter(pubClient, subClient));

*
* \[ \] Namespaces y Rooms strategy
    * Namespace: `/game`
    * Room: `game:${gameCode}`

\[ \] Middleware de autenticación Socket.IO  
io.use((socket, next) \=\> {  const token \= socket.handshake.auth.token;  // Verify JWT  // Attach user to socket  next();});

*

#### **Socket Events \- Lobby**

\[ \] `socket.on('join:game')` \- Estudiante se une

{  
gameCode: string,  
nickname: string,  
userId?: number // opcional si guest  
}

*
    * Validar que game existe
    * Validar que status \= 'lobby'
    * Validar max\_players no excedido
    * Validar nickname único en ese juego
    * Crear player en game\_players
    * Agregar socket a room
    * Broadcast a todos: `player:joined`
    * Enviar a joiner: `game:state`
* \[ \] `socket.on('lobby:ready')` \- Player marca ready

    * Update player is\_ready
    * Broadcast: `player:ready`
* \[ \] `socket.on('game:start')` \- Teacher inicia

    * Validar que sender es teacher owner
    * Validar mínimo 2 players
    * Update game status \= 'starting'
    * Broadcast: `game:starting`
    * Countdown 3-2-1
    * Cambiar status \= 'active'
    * Enviar primera pregunta
* \[ \] `socket.on('disconnect')` \- Handle desconexiones

    * Marcar player como disconnected
    * Broadcast: `player:left`
    * Si es teacher y game en lobby → cancelar game
    * Si es teacher y game activo → pausar game

#### **Socket Events \- Preparación Gameplay**

* \[ \] `socket.on('answer:submit')` \- Guardar respuesta
    * Validar que game está active
    * Validar que player está en game
    * Guardar en game\_answers
    * NO enviar si correcta aún (evitar cheating)
* \[ \] Timer management
    * Cuando se envía pregunta, iniciar timer server-side
    * Broadcast ticks cada segundo (countdown)
    * Al llegar a 0: `question:timeout`

#### **GameService.js**

* \[ \] Método `getGameByCode(code)`
* \[ \] Método `addPlayerToGame(gameId, player)`
* \[ \] Método `startGame(gameId)`
* \[ \] Método `getCurrentQuestion(gameId)`
* \[ \] Método `getLeaderboard(gameId)`

#### **Testing Backend**

* \[ \] Tests de Socket.IO events
* \[ \] Tests de join game (casos válidos/inválidos)
* \[ \] Tests de ready/unready
* \[ \] Tests de start game
* \[ \] Tests de disconnect handling
* \[ \] Load testing: 50 conexiones simultáneas

### **🎨 Frontend Tasks**

#### **Socket.IO Integration**

* \[ \] Instalar socket.io-client

\[ \] Crear SocketContext  
interface SocketContextValue {  socket: Socket | null;  isConnected: boolean;  joinGame: (code: string, nickname: string) \=\> void;  leaveGame: () \=\> void;}

*
* \[ \] useSocket hook
* \[ \] Connection management
    * Auto-reconnect
    * Handle connection errors
    * Show connection status

#### **Join Game Flow (Student)**

* \[ \] Página "Join Game"
    * Input para game code (6 chars, auto-uppercase)
    * Input para nickname
    * Botón "Join"
    * Validación client-side
    * Loading state
* \[ \] Student Lobby Screen
    * Game info (nombre del quiz, teacher)
    * Lista de jugadores (real-time updates)
    * Avatar/nickname display
    * "Ready" checkbox
    * Indicador "Waiting for teacher to start..."
    * Botón "Leave"

#### **Teacher Lobby Screen (Mejorado)**

* \[ \] Conexión WebSocket desde teacher
* \[ \] Lista de jugadores real-time
    * Animación cuando se une alguien
    * Indicador de ready
    * Avatars/nombres
    * Contador total
* \[ \] Botón "Start Game"
    * Disabled si \<2 players
    * Confirmation modal
* \[ \] Countdown animation (3-2-1-GO\!)

#### **Game Store (Zustand)**

\[ \] Game state management  
interface GameStore {  gameCode: string | null;  gameState: 'lobby' | 'starting' | 'active' | 'finished';  players: Player\[\];  currentPlayer: Player | null;  isReady: boolean;  setReady: (ready: boolean) \=\> void;}

*

#### **Components**

* \[ \] GameCodeInput component
    * Auto-format uppercase
    * Max 6 characters
    * Validation feedback
* \[ \] PlayerList component
    * Grid/list view
    * Player cards con avatar
    * Ready indicator
    * Animations (entrada/salida)
* \[ \] CountdownAnimation component
    * 3-2-1-GO animation
    * Sound effects (opcional)

#### **Testing Frontend**

* \[ \] Tests de join game flow
* \[ \] Tests de lobby real-time
* \[ \] Tests de disconnect handling
* \[ \] Tests de WebSocket events

### **✅ Criterios de Aceptación**

* \[ \] Estudiante puede unirse con game code válido
* \[ \] Estudiante ve lobby actualizado en tiempo real
* \[ \] Otros jugadores aparecen cuando se unen
* \[ \] Nickname único por juego (error si duplicado)
* \[ \] Max players respetado (error si lleno)
* \[ \] Teacher ve lista de jugadores actualizándose
* \[ \] Teacher puede iniciar juego cuando 2+ players
* \[ \] Countdown 3-2-1 se muestra a todos
* \[ \] Desconexiones se manejan gracefully
* \[ \] Reconexión funciona correctamente
* \[ \] UI muestra estado de conexión claramente

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
