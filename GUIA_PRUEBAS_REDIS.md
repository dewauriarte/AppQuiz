# Guía de Pruebas - Sistema de Sesiones Persistentes con Redis

## ✅ Pre-requisitos

1. **Redis debe estar corriendo**:
   - Windows: `redis-server` o iniciar servicio de Windows
   - Verificar: debería decir "Ready to accept connections"

2. **Backend debe estar corriendo**:
   ```bash
   cd Backend
   npm run dev
   ```
   - Debe mostrar: "✅ Redis connected successfully"
   - Debe mostrar: "✅ Database connected successfully"

3. **Frontend debe estar corriendo**:
   ```bash
   cd Frontend
   npm run dev
   ```

## 🧪 Casos de Prueba

### Caso 1: Crear juego y recargar en lobby
1. Login como teacher
2. Crear un juego nuevo
3. Copiar el código del juego
4. **Recargar la página (F5)**
5. **Resultado esperado**:
   - Debe volver al lobby automáticamente
   - Los jugadores que estaban deben seguir apareciendo

### Caso 2: Unirse como estudiante y recargar
1. Login como estudiante (otra ventana/incógnito)
2. Unirse al juego con el código
3. Marcar "Estoy listo"
4. **Recargar la página (F5)**
5. **Resultado esperado**:
   - Debe volver al lobby
   - Debe mantener el estado "Listo"

### Caso 3: Iniciar juego y recargar durante pregunta
1. Teacher inicia el juego
2. Esperar a que aparezca una pregunta
3. **Recargar la página (F5)** mientras la pregunta está mostrándose
4. **Resultado esperado**:
   - La misma pregunta debe aparecer
   - El tiempo debe seguir corriendo
   - El leaderboard debe mostrarse correctamente

### Caso 4: Recargar después de responder
1. Responder una pregunta
2. Ver tu score actualizado
3. **Recargar la página (F5)**
4. **Resultado esperado**:
   - Tu score debe mantenerse
   - La siguiente pregunta debe aparecer normalmente

## 🐛 Problemas Comunes

### Problema: "Cargando infinitamente"

**Causa**: Puede ser que Redis no esté corriendo o que el backend no se haya reiniciado.

**Solución**:
1. Verificar consola del navegador (F12) → ver errores en rojo
2. Verificar terminal del backend → buscar errores
3. Verificar que Redis esté corriendo:
   ```bash
   redis-cli ping
   # Debe responder: PONG
   ```

### Problema: "Error al unirse al juego"

**Causa**: La sesión en Redis expiró o se limpió.

**Solución**:
1. Si el juego está en lobby, volver a crearlo
2. Si el juego estaba activo, lamentablemente se perdió (TTL de 2 horas)

### Problema: "La pregunta no es la misma al recargar"

**Causa**: El orden de preguntas no se guardó en Redis.

**Solución**:
1. Verificar logs del backend para ver si hay errores en `setQuestionOrder`
2. Verificar que Redis tenga la key `game:{gameCode}:questions`

## 📋 Logs a Revisar

### Backend (Terminal)
Buscar estos mensajes:
- `✅ Redis connected successfully`
- `✅ Game initialized in Redis: {gameCode}`
- `♻️ Recovering existing game session: {gameCode}`
- `🔄 Attempting to recover session for {gameCode}`

### Frontend (Consola del navegador)
Buscar estos mensajes:
- `[GamePlayPage] ✅ Unido al room exitosamente`
- `[GamePlayPage] 🔄 Recuperando estado del juego desde Redis...`
- `[GamePlayPage] ✅ Estado recuperado:`
- `[GamePlayPage] ✅ Pregunta restaurada:`

### Redis (Verificar directamente)
```bash
redis-cli

# Ver todas las keys de juegos activos
SMEMBERS games:active

# Ver estado de un juego específico (reemplazar ABC123 con tu código)
GET game:ABC123:state

# Ver orden de preguntas
LRANGE game:ABC123:questions 0 -1

# Ver jugadores
SMEMBERS game:ABC123:players

# Salir
exit
```

## 🎯 Flujo Completo de Prueba

1. **Iniciar servicios** (Redis, Backend, Frontend)
2. **Crear juego** como teacher
3. **Unirse** como 2 estudiantes desde ventanas diferentes
4. **Recargar** página del teacher → debe volver al lobby
5. **Iniciar juego** desde el teacher
6. **Esperar** a que aparezca primera pregunta
7. **Recargar** página de un estudiante → debe ver la misma pregunta
8. **Responder** la pregunta
9. **Recargar** página del teacher → debe ver respuestas recibidas
10. **Continuar** hasta terminar el juego

Si todos estos pasos funcionan correctamente, **el sistema de sesiones persistentes está trabajando perfectamente**.

## 🚨 Si Nada Funciona

1. **Limpiar Redis completamente**:
   ```bash
   redis-cli FLUSHDB
   ```

2. **Reiniciar todo en orden**:
   - Detener Frontend (Ctrl+C)
   - Detener Backend (Ctrl+C)
   - Detener Redis (Ctrl+C)
   - Iniciar Redis → `redis-server`
   - Iniciar Backend → `cd Backend && npm run dev`
   - Iniciar Frontend → `cd Frontend && npm run dev`

3. **Crear juego nuevo** desde cero

4. **Revisar logs** paso a paso
