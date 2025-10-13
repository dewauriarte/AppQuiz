#

# 🔷 SPRINT 11: Board Mode RPG (Semanas 21-22)

## 🎯 Objetivos

* Modo tablero tipo Mario Party educativo
* Eventos aleatorios en casillas
* Progresión visual con avatar + mascota
* Dado animado para movimiento

---

## Backend Tasks

### **Board Mode Logic**

* [x] Configuración de tablero en game.config
  * board_size: 30-50 casillas
  * board_layout: linear (serpiente) o circular
  * event_positions: array de índices con eventos
  * win_condition: llegar a última casilla
* [x] Método `initializeBoardGame(gameId)`
  * Crear board_events por gameId
  * Asignar eventos aleatorios a casillas
  * Spawn probabilities según tabla board_events
  * Guardar en game metadata
  * Colocar jugadores en posición 0
* [x] Método `rollDice(gameId, playerId)`
  * Generar número aleatorio 1-6
  * Actualizar board_position del jugador
  * Verificar evento en nueva posición
  * Ejecutar evento si existe
  * Broadcast: player moved + new position
  * Return: diceValue, newPosition, event

### **Board Events System**

* [x] Método `executeEvent(eventType, playerId)`
  * bonus_coins: agregar coins al jugador
  * bonus_xp: agregar XP extra
  * bonus_gems: agregar gemas
  * trap_lose_coins: restar coins (-50)
  * trap_go_back: retroceder 3 casillas
  * teleport_forward: avanzar 5 casillas
  * quiz_challenge: pregunta extra (doble reward)
  * powerup: otorgar powerup random
  * mystery_box: recompensa aleatoria
  * boss_encounter: iniciar boss fight (placeholder)
  * Actualizar player stats
  * Broadcast evento a todos
* [x] Eventos especiales cada X casillas
  * Cada 10 casillas: mini checkpoint (bonus)
  * Cada 20 casillas: tienda para comprar items
  * Última casilla: podium finish

### **Game Flow Board Mode**

* [x] Turnos por jugador
  * Orden definido al iniciar (aleatorio)
  * Solo el jugador en turno puede tirar dado
  * Timeout de 15 segundos por turno
  * Si no tira: auto-roll (frontend debe implementar)
* [x] Combinar con preguntas
  * Cada X turnos: pregunta de quiz (configuración lista)
  * Responder correcta: dado con +1 bonus (pendiente integración)
  * Responder incorrecta: dado normal (pendiente integración)
  * Alternar entre movimiento y preguntas (configuración lista)
* [x] Win condition
  * Primer jugador en llegar a casilla final
  * O mayor score después de N turnos
  * Otorgar rewards según ranking

### **Endpoints**

* [x] `POST /api/games/:gameCode/board/roll` - Tirar dado
* [x] `GET /api/games/:gameCode/board/state` - Estado del tablero
* [x] `POST /api/games/:gameCode/board/buy-item` - Comprar en tienda (stub)

### **Socket Events**

* [x] `board:roll-dice` - Player tira dado
* [x] `board:player-moved` - Broadcast movimiento
* [x] `board:event-triggered` - Evento ejecutado
* [x] `board:turn-change` - Cambio de turno
* [x] `board:game-finished` - Alguien llegó al final

### **Testing Backend**

* [x] Tests de roll dice (1-6 range) - ✅ Completo
* [x] Tests de eventos - ✅ Completo
* [x] Tests de win condition - ✅ Completo

---

## Frontend Tasks

### **Board Game Screen**

* [x] BoardGameCanvas component (React Konva)
  * ✅ Renderizar 30-50 casillas en path
  * ✅ Layout serpiente (zig-zag)
  * ✅ Casillas normales: gris
  * ✅ Casillas con evento: color según tipo
  * ✅ Checkpoints: doradas grandes
  * ✅ Casilla final: copa brillante
* [x] PlayerToken component
  * ✅ Avatar del jugador en miniatura
  * ⚠️ Mascota al lado (pendiente integración con pet system)
  * ✅ Animación de salto al moverse
  * ✅ Smooth transition entre casillas
  * ✅ Stacked si varios en misma casilla

### **Dice Roller**

* [x] DiceRoller component
  * ✅ Dado 3D isométrico (Framer Motion)
  * ✅ Click para tirar (si es tu turno)
  * ✅ Animación de rotación (Framer Motion)
  * ✅ Resultado destacado (cara con puntos)
  * ✅ Disabled si no es tu turno
  * ✅ Auto-roll si timeout (countdown visual)

### **Board Events UI**

* [x] EventPopup component
  * ✅ Aparece al caer en evento
  * ✅ Icono grande del evento
  * ✅ Descripción personalizada por evento
  * ✅ Efecto visual:
    * ✅ Bonus: partículas doradas + confetti
    * ✅ Trap: shake + rojo
    * ✅ Teleport: portal animado
  * ✅ Auto-dismiss en 3 segundos
* [x] EventIndicators en casillas
  * ✅ Iconos en casillas con eventos (ya en BoardGameCanvas)
  * ✅ Hover: tooltip con tipo de evento
  * ✅ Mystery boxes: animación continua

### **Game HUD**

* [x] BoardGameHUD component
  * ✅ Panel izquierdo:
    * ✅ Current turn indicator
    * ✅ Turn timer (15s countdown)
    * ✅ Dice result history
  * ✅ Panel derecho:
    * ✅ Mini leaderboard (top 5)
    * ✅ Tu posición en tablero
    * ✅ Coins/gems/escudos/powerups
  * ✅ Centro:
    * ✅ Botón "Roll Dice" integrado
    * ✅ Message center: "Waiting for Player X..."

### **Turn System UI**

* [x] TurnIndicator
  * ✅ Banner: "Your Turn!" o "Player X's Turn"
  * ✅ Arrow apuntando al jugador activo (PlayerTurnArrow)
  * ✅ Highlight de token del jugador en turno
  * ✅ Sound cue al cambiar turno (audio notifications)

### **Checkpoint Shop**

* [x] CheckpointShop modal
  * ✅ Aparece al caer en checkpoint
  * ✅ Mini tienda con 4 items:
    * ✅ Extra dice roll (100 coins)
    * ✅ Teleport forward (200 coins)
    * ✅ Steal coins from player (300 coins)
    * ✅ Shield (150 coins)
  * ✅ Botón "Skip" para continuar

### **Animations**

* [x] Player movement (smooth path) - PlayerMovementAnimation
* [x] Dice roll (3D rotation) - Ya en DiceRoller
* [x] Event triggers (particles) - ParticleExplosion
* [x] Coin collection (fly to HUD) - CoinCollectionAnimation
* [x] Trap activation (shake screen) - ScreenShakeEffect

### **Testing Frontend**

* [ ] Tests de dice roll animation
* [ ] Tests de player movement
* [ ] Tests de event triggers

---

## ✅ Criterios de Aceptación

* [x] Tablero se renderiza correctamente (30-50 casillas)
* [x] Jugadores se mueven según resultado del dado
* [x] Eventos se ejecutan al caer en casillas
* [x] Sistema de turnos funciona correctamente
* [x] Animaciones son smooth y claras
* [x] Primer jugador en llegar gana
* [x] Rewards se otorgan según ranking
* [x] UI muestra claramente de quién es el turno
* [x] Timeout auto-roll funciona
* [x] Eventos dan bonuses/penalizaciones reales

---