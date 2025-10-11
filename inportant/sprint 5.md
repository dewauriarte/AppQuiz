## **🔷 SPRINT 5: Core Gameplay \- Classic Mode (Semanas 9-10)**

### **🎯 Objetivos del Sprint**

* Gameplay completo Classic Mode
* Preguntas en tiempo real
* Sistema de scoring funcional
* Leaderboard live

### **📦 Backend Tasks**

#### **Game Flow Logic**

* \[ \] `socket.on('game:start')` \- Lógica completa

    * Obtener todas las preguntas del set
    * Shuffle si config.shuffle\_questions
    * Enviar primera pregunta (sin respuesta correcta)
    * Iniciar timer server-side
* \[ \] `sendQuestion(gameId, questionIndex)`

    * Get question con opciones
    * Shuffle opciones si config.shuffle\_options
    * Remove is\_correct de opciones
    * Broadcast: `question:new`
    * Start countdown timer

\[ \] `socket.on('answer:submit')` \- Lógica completa

{  
gameCode: string,  
questionId: number,  
optionId: number,  
timeTaken: number // ms  
}

*
    * Validar que timer no expiró
    * Check si respuesta correcta
    * Calcular puntos (base \+ speed \+ combo)
    * Actualizar score del player
    * Actualizar combo\_streak
    * Guardar en game\_answers
    * Emit a player: `answer:result`
    * Update leaderboard
    * Broadcast: `leaderboard:update`
* \[ \] Timer Management

    * Server-side countdown
    * Broadcast `timer:tick` cada segundo
    * Al llegar a 0: `question:timeout`
    * Dar 5 segundos para ver resultados
    * Avanzar a siguiente pregunta o terminar
* \[ \] End Game Logic

    * Calcular estadísticas finales
    * Determinar rankings
    * Calcular recompensas (XP, coins)
    * Guardar en game\_results
    * Otorgar recompensas
    * Broadcast: `game:finished`

#### **Scoring System**

\[ \] Implementar fórmula de puntos  
function calculatePoints(  isCorrect: boolean,  timeTaken: number,  timeLimit: number,  combo: number): number {  if (\!isCorrect) return 0;    const basePoints \= 1000;  const speedBonus \= Math.max(0, 500 \- (timeTaken / timeLimit) \* 500);  const comboMultiplier \= 1 \+ (combo \* 0.1);    return Math.floor((basePoints \+ speedBonus) \* comboMultiplier);}

*
* \[ \] Método `updatePlayerScore()`
* \[ \] Método `calculateLeaderboard()`
* \[ \] Método `calculateRewards(ranking, gameConfig)`

#### **Analytics**

* \[ \] Guardar estadísticas detalladas
    * game\_answers con todos los datos
    * game\_results con finales
    * Actualizar stats de questions (times\_answered, times\_correct)
    * Actualizar stats de question\_sets (times\_played, average\_score)

#### **Testing Backend**

* \[ \] Tests de game flow completo
* \[ \] Tests de scoring (diferentes scenarios)
* \[ \] Tests de timer logic
* \[ \] Tests de end game
* \[ \] Tests de recompensas
* \[ \] Load test: 100 players simultáneos

### **🎨 Frontend Tasks**

#### **Game Screens \- Student**

* \[ \] Waiting Screen (entre preguntas)
    * "Get ready..."
    * Countdown 3-2-1
    * Animación de transición
* \[ \] Question Screen
    * Número de pregunta (1/20)
    * Texto de pregunta (grande, legible)
    * Imagen si hay (question.media\_url)
    * Timer visual (progress bar \+ number)
    * 4 opciones como botones grandes
        * Colores distintos (rojo, azul, amarillo, verde)
        * Click para seleccionar
        * Disabled una vez respondido
    * Indicador "Answered" cuando envía
* \[ \] Answer Result Screen (5 segundos)
    * ✓ Correcto → Confetti \+ sound
    * ✗ Incorrecto → Shake animation
    * Puntos ganados (con animación)
    * Combo indicator si 3+
    * Mostrar respuesta correcta
    * Explicación educativa (si hay)
* \[ \] Leaderboard Intermedio (entre preguntas)
    * Top 5 con animación
    * Current player destacado
    * Scores
    * Cambios de posición (↑↓)
* \[ \] Final Results Screen
    * Podium top 3
    * Position del jugador
    * Score total
    * Accuracy %
    * Combo más alto
    * Recompensas ganadas (XP, coins)
    * Botón "Continue"

#### **Game Screens \- Teacher**

* \[ \] Control Panel (mientras juego activo)
    * Pregunta actual
    * Timer
    * Cantidad de respuestas recibidas (X/Y)
    * Mini leaderboard
    * Botón "Skip Question" (emergency)
    * Botón "Pause Game"
* \[ \] Live Statistics
    * Gráfico de respuestas (A, B, C, D)
    * Accuracy en tiempo real
    * Average response time
* \[ \] Post-Game Dashboard
    * Leaderboard final completo
    * Estadísticas por pregunta
    * Conceptos difíciles identificados
    * Recomendaciones
    * Botón "Export Results"

#### **Animations**

* \[ \] Framer Motion animations
    * Entrada de preguntas (fade \+ slide)
    * Botones de respuesta (hover \+ click)
    * Confetti al acertar
    * Shake al fallar
    * Leaderboard changes (smooth transitions)
* \[ \] Progress indicators
    * Timer circular
    * Loading skeletons
    * Smooth transitions

#### **Sound Effects (Opcional Sprint 5\)**

* \[ \] Correct answer sound
* \[ \] Wrong answer sound
* \[ \] Countdown ticks
* \[ \] Game start sound
* \[ \] Combo achievement sound

#### **Testing Frontend**

* \[ \] Tests de question screen
* \[ \] Tests de answer submission
* \[ \] Tests de leaderboard updates
* \[ \] Tests de end game screen
* \[ \] E2E test de juego completo

### **✅ Criterios de Aceptación**

* \[ \] Teacher inicia juego y todos ven countdown
* \[ \] Primera pregunta se muestra a todos simultáneamente
* \[ \] Timer funciona y es sincronizado
* \[ \] Estudiante puede seleccionar respuesta y enviar
* \[ \] Feedback inmediato (correcto/incorrecto)
* \[ \] Puntos se calculan correctamente (base \+ velocidad \+ combo)
* \[ \] Leaderboard se actualiza en tiempo real
* \[ \] Combo de 3+ muestra indicador especial
* \[ \] Al terminar tiempo, avanza automáticamente
* \[ \] Después de última pregunta, muestra resultados finales
* \[ \] Rankings correctos (ordenados por score)
* \[ \] Recompensas se otorgan (XP, coins guardados en BD)
* \[ \] Teacher puede ver estadísticas detalladas
* \[ \] No hay lag con 50+ jugadores
* \[ \] UI responsive y clara en móvil

### **📈 Métricas de Éxito**

* Juego completo (20 preguntas) toma \~10-15 min
* 0 errores de sincronización
* Latency \<50ms para answer submission
* 95%+ de mensajes WebSocket entregados
* 0 crashes durante gameplay
* FPS \>30 en animaciones

---