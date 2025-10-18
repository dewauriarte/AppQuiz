

# 🔷 SPRINT 12: Survival Mode - Battle Royale (Semanas 23-24)

## 🎯 Objetivos

* Modo supervivencia con eliminación progresiva
* Estilo "Battle Royale Educativo"
* Zona segura que se reduce
* Últimos 10 jugadores → final épica

---

## 📦 Backend Tasks

### **Survival Mode Logic**

* [ ] Configuración en game.config
  * max_players: 50-100
  * total_rounds: 10-15
  * elimination_rate: 20% por ronda
  * safe_zone_size: reduce cada ronda
  * final_round_players: 10
* [ ] Método `initializeSurvivalGame(gameId)`
  * Crear metadata de survival
  * Definir rondas y eliminaciones
  * Inicializar safe_zone = 100%
  * Todos los players is_eliminated = false
* [ ] Método `startSurvivalRound(gameId, roundNumber)`
  * Enviar pregunta a todos los jugadores no eliminados
  * Iniciar timer
  * Trackear respuestas
  * Al terminar timer: calcular eliminaciones

### **Elimination System**

* [ ] Método `processEliminationRound(gameId)`
  * Obtener jugadores activos ordenados por score
  * Calcular cuántos eliminar (20% o fixed number)
  * Marcar últimos N como is_eliminated = true
  * Registrar eliminación en game_results
  * Broadcast: lista de eliminados
  * Actualizar safe_zone_size
  * Si quedan ≤10: activar final round
* [ ] Método `calculateSurvivalScore(playerId, answers)`
  * Score = correctas × 100 + speed bonus
  * Penalty por respuestas incorrectas
  * Bonus por combo streak
  * Return: survival score

### **Safe Zone Mechanics**

* [ ] Safe zone progression
  * Ronda 1-3: 100% zona segura (todos compiten)
  * Ronda 4-6: 80% zona (más presión)
  * Ronda 7-9: 60% zona (crítico)
  * Ronda 10+: 40% zona (final)
* [ ] Visual representation
  * Metadata de zona guardada en game
  * Frontend renderiza círculo/área
  * Players fuera de zona: penalización

### **Final Round**

* [ ] Método `startFinalRound(gameId)`
  * Solo quedan ≤10 jugadores
  * Preguntas más difíciles
  * Timer más corto (20s)
  * No más eliminaciones masivas
  * 1 eliminado por pregunta
  * Últimos 3 → podium
* [ ] Método `processFinalElimination(gameId)`
  * Eliminar 1 jugador con peor score
  * Continuar hasta quedar 3
  * Declarar ganador

### **Rewards System**

* [ ] Rewards escalonados
  * 1er lugar: 5000 coins + 200 gems + título especial
  * Top 3: 3000 coins + 100 gems
  * Top 10: 1500 coins + 50 gems
  * Top 25: 500 coins + 10 gems
  * Participación: 100 coins
* [ ] Achievement: "Survivor" (top 10), "Champion" (win)

### **Endpoints**

* [ ] `POST /api/games/:id/survival/answer` - Responder en survival
* [ ] `GET /api/games/:id/survival/status` - Estado survival

### **Socket Events**

* [ ] `survival:round-start` - Nueva ronda
* [ ] `survival:round-end` - Resultados + eliminados
* [ ] `survival:safe-zone-update` - Zona se reduce
* [ ] `survival:final-round` - Top 10 activado
* [ ] `survival:game-finished` - Ganador declarado

### **Testing Backend**

* [ ] Tests de cálculo de eliminaciones
* [ ] Tests de final round
* [ ] Tests de rewards

---

## 🎨 Frontend Tasks

### **Survival Lobby**

* [ ] SurvivalLobby component
  * Contador de jugadores: "45/100"
  * Grid de avatares (hasta 100)
  * Status "Waiting for players..."
  * Countdown para empezar
  * Reglas claras mostradas

### **Survival HUD**

* [ ] SurvivalGameHUD
  * **Top bar:**
    * Round indicator: "Round 3/10"
    * Players alive: "32/100" con icono
    * Your rank: "#12"
  * **Safe zone indicator:**
    * Circular meter (como Fortnite)
    * % de zona segura
    * Color: verde → amarillo → rojo
  * **Mini leaderboard:**
    * Top 5 actual
    * Your position destacada

### **Survival Question Screen**

* [ ] Similar a Classic Mode pero:
  * Timer más agresivo (visual rojo)
  * Indicador "Elimination Zone!" si estás en riesgo
  * Presión visual aumentada

### **Elimination Screen**

* [ ] EliminationResults component
  * Aparece al final de cada ronda
  * **Lista de eliminados:**
    * Avatares en rojo con X
    * "Better luck next time!"
  * **Lista de supervivientes:**
    * Avatares brillantes
    * Current ranking
  * **Safe zone animation:**
    * Círculo reduciéndose
    * Partículas en los bordes
  * Countdown a siguiente ronda (10s)

### **Eliminated Screen (para jugadores eliminados)**

* [ ] YouWereEliminated component
  * Pantalla con fondo oscuro
  * "You were eliminated!"
  * Final rank: "#23/50"
  * Rewards ganadas
  * Botón "Watch Final" (spectate)
  * Botón "Leave Game"

### **Final Round UI**

* [ ] FinalRoundScreen
  * "FINAL ROUND" banner épico
  * "Top 10 Survivors!"
  * Grid de 10 avatares restantes
  * Música épica cue
  * Countdown dramático

### **Victory Screen**

* [ ] SurvivalVictoryScreen
  * Podium con top 3
  * Crown animation para ganador
  * Stats finales:
    * Rounds survived
    * Total eliminations
    * Accuracy
    * Final score
  * Rewards destacadas
  * Título desbloqueado (si aplica)

### **Spectate Mode (para eliminados)**

* [ ] SpectateView
  * Ver gameplay de jugadores activos
  * Cambiar entre jugadores
  * Mini leaderboard actualizado
  * Chat de espectadores (opcional)

### **Animations**

* [ ] Safe zone shrinking (pulsing circle)
* [ ] Elimination animation (fade to black)
* [ ] Survival badge (glow effect)
* [ ] Victory royale explosion

### **Testing Frontend**

* [ ] Tests de UI de eliminación
* [ ] Tests de spectate mode
* [ ] Tests de final round

---

## ✅ Criterios de Aceptación

* [ ] Hasta 100 jugadores pueden unirse
* [ ] Rondas de preguntas funcionan correctamente
* [ ] Eliminación de 20% jugadores cada ronda
* [ ] Safe zone se reduce visualmente
* [ ] Jugadores ven cuando están en riesgo
* [ ] Final round activa con top 10
* [ ] Eliminación 1 a 1 en final
* [ ] Ganador se declara correctamente
* [ ] Rewards se otorgan según ranking
* [ ] Jugadores eliminados pueden spectate
* [ ] UI es tensa y emocionante

---