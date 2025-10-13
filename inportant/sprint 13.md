# 🚀 SPRINTS 7-13: FUNCIONALIDADES COMPLETAS

---

# 🔷 SPRINT 7: Avatares + Tienda + Inventario (Semanas 13-14)

## 🎯 Objetivos

* Sistema de avatares personalizables funcional
* Tienda de items con animaciones llamativas
* Inventario organizado por categorías
* Preview de items en avatar antes de comprar

---

## 📦 Backend Tasks

### **Sistema de Avatares**

* [ ] Modelo de avatar en user_profiles
  * avatar_url (imagen completa)
  * avatar_parts (JSONB con piezas: hair, eyes, clothes, accessories)
  * avatar_frame_url (marco del perfil)
  * Actualizar al equipar items
* [ ] `PUT /api/users/avatar` - Actualizar avatar completo
  * Validar que items pertenecen al usuario
  * Validar que son equipables en avatar
  * Actualizar avatar_url (generar composición)
  * Return: nuevo avatar_url

### **Shop System**

* [ ] `GET /api/shop/items` - Listar items disponibles
  * Filtros: category, rarity, price_range, is_available
  * Paginación (20 items por página)
  * Ordenar por: newest, price_asc, price_desc, rarity
  * Incluir: name, description, image_url, price_coins, price_gems, rarity, stock
* [ ] `GET /api/shop/items/:id` - Detalle de item
  * Info completa del item
  * Preview_url para visualización
  * Stats/habilidades si es pet o boost
  * Required_level, required_achievement_id
  * Times_purchased (popularidad)
* [ ] `POST /api/shop/purchase` - Comprar item
  * Validar que user tiene suficiente currency
  * Validar level requerido
  * Validar stock disponible si es limited
  * Crear transacción en currency_transactions
  * Agregar a user_inventory
  * Guardar en purchase_history
  * Restar currency de user_currencies
  * Actualizar stock si aplica
  * Return: item comprado + nuevo balance

### **Inventory System**

* [ ] `GET /api/inventory` - Ver inventario del usuario
  * Agrupar por categoría (skins, accessories, pets, boosts)
  * Mostrar quantity si es stackable
  * Mostrar is_equipped status
  * Incluir metadata del item
  * Ordenar por: newest, rarity, name
* [ ] `PUT /api/inventory/:id/equip` - Equipar item
  * Validar que item pertenece al usuario
  * Si es skin/accessory: actualizar avatar
  * Si es pet: marcar como activo (desactivar otros)
  * Si es boost: activar efecto
  * Actualizar is_equipped = true
  * Return: avatar actualizado
* [ ] `PUT /api/inventory/:id/unequip` - Desequipar item
  * Quitar del avatar
  * Actualizar is_equipped = false
* [ ] `POST /api/inventory/:id/favorite` - Marcar favorito
  * Toggle is_favorite
  * Para organizar inventario

### **Seeding Inicial**

* [ ] Poblar shop_items con 30-50 items
  * 15 skins (common → legendary)
  * 10 accesorios (hats, glasses, badges)
  * 5 frames de perfil
  * 5 emotes
  * 5 boosts temporales
  * Precios balanceados (100 coins → 5000 coins)

### **Testing Backend**

* [ ] Tests de compra (casos exitosos y errores)
* [ ] Tests de validación de currency
* [ ] Tests de stock limitado
* [ ] Tests de equipar/desequipar

---

## 🎨 Frontend Tasks

### **Avatar System**

* [ ] AvatarBuilder component
  * Vista previa del avatar completo
  * Selector de piezas por categoría
  * Drag & drop de accesorios
  * Botón "Save Avatar"
  * Reset a default
* [ ] AvatarDisplay component
  * Mostrar avatar en dashboard
  * Mostrar en profile
  * Mostrar en leaderboards
  * Tamaños: small (32px), medium (64px), large (128px)
* [ ] AvatarFrame component
  * Marco decorativo alrededor del avatar
  * Animación de brillo según rareza

### **Shop Pages**

* [ ] Shop Main Page (/shop)
  * Grid de items con cards
  * Filtros sidebar (categoría, rareza, precio)
  * Búsqueda por nombre
  * Sort dropdown (newest, price, rarity)
  * Tabs por categoría (All, Skins, Accessories, Frames)
* [ ] ItemCard component
  * Imagen del item
  * Nombre + rareza badge
  * Precio (coins/gems)
  * Rarity glow effect
  * Hover: flip animation suave
  * "Sold Out" overlay si stock = 0
  * Lock icon si required_level no cumplido
* [ ] ItemDetailModal component
  * Imagen grande del item
  * Descripción completa
  * Stats si aplica
  * Preview en avatar ("Try it on")
  * Botón "Buy Now" con precio
  * Botón "Add to Favorites"
  * Animación de entrada (scale + fade)

### **Purchase Flow**

* [ ] PurchaseConfirmation dialog
  * Mostrar item a comprar
  * Precio total
  * Balance actual vs balance después
  * Confirmación: "Are you sure?"
  * Loading state durante compra
* [ ] PurchaseSuccess animation
  * Confetti celebration
  * Item preview animado
  * "Item added to inventory!"
  * Botón "Equip Now" o "View Inventory"

### **Inventory Pages**

* [ ] Inventory Main Page (/inventory)
  * Grid de items owned
  * Tabs por categoría
  * Badge "Equipped" en items activos
  * Filtro "Favorites Only"
  * Empty state amigable si no tiene items
* [ ] InventoryItemCard
  * Similar a ItemCard pero muestra quantity
  * Botón "Equip" o "Unequip"
  * Botón "Favorite" (star icon)
  * Click: abrir detalles

### **Animations**

* [ ] Card flip on hover (Framer Motion)
* [ ] Rarity glow effects (CSS)
  * Common: gris
  * Uncommon: verde
  * Rare: azul
  * Epic: morado
  * Legendary: dorado
* [ ] Purchase confetti (react-confetti)
* [ ] Smooth transitions entre equipar items

### **Testing Frontend**

* [ ] Tests de compra flow
* [ ] Tests de equipar items
* [ ] Tests de filtros

---

## ✅ Criterios de Aceptación

* [ ] Usuario puede ver catálogo de items en shop
* [ ] Usuario puede filtrar y buscar items
* [ ] Usuario puede ver preview de item antes de comprar
* [ ] Usuario puede comprar items con coins o gems
* [ ] Balance se actualiza correctamente tras compra
* [ ] Items comprados aparecen en inventario
* [ ] Usuario puede equipar/desequipar items
* [ ] Avatar se actualiza visualmente al equipar
* [ ] Animaciones son smooth y celebratorias
* [ ] Validaciones funcionan (nivel, currency, stock)

---

# 🔷 SPRINT 8: Mascotas + Colección (Semanas 15-16)

## 🎯 Objetivos

* Sistema de mascotas con habilidades activas
* Vista "Yo + Mi Mascota" en dashboard
* Galería de colección con stats
* Mascotas dan bonificaciones reales en juego

---

## 📦 Backend Tasks

### **Pet System Core**

* [ ] Poblar tabla `pets` con catálogo inicial
  * 5 common (CSS sprites)
  * 3 uncommon (Lottie)
  * 2 rare (Rive)
  * 1 epic (Rive avanzado)
  * 1 legendary (Three.js 3D)
  * Definir abilities en JSONB para cada uno
* [ ] `GET /api/pets` - Catálogo de mascotas
  * Listar todas las mascotas disponibles
  * Filtros: rarity, category
  * Incluir: name, description, abilities, unlock_requirements
  * Indicar si user ya la tiene (owned: true/false)
* [ ] `GET /api/pets/:id` - Detalle de mascota
  * Info completa
  * Stats de habilidades
  * Preview de animación (sprite_url/lottie_url)
  * Evolution stages (3 etapas)
  * XP requerida para evolucionar
* [ ] `POST /api/pets/adopt` - Adoptar mascota
  * Validar currency suficiente
  * Validar unlock_requirements (level, achievement)
  * Crear en user_pets
  * Restar currency
  * Return: mascota adoptada
* [ ] `PUT /api/pets/:userPetId/activate` - Activar mascota
  * Marcar is_active = true en user_pets
  * Desactivar otras mascotas (solo 1 activa)
  * Return: mascota activa

### **Pet Abilities Integration**

* [ ] Método `applyPetBonus(userId, baseReward)`
  * Obtener mascota activa del usuario
  * Leer abilities de la mascota
  * Aplicar bonuses:
    * xp_boost: baseXP * (1 + boost/100)
    * coin_finder: baseCoins * (1 + boost/100)
    * luck_boost: mejorar RNG de drops
  * Return: recompensas mejoradas
* [ ] Integrar en EndGame rewards
  * Llamar a applyPetBonus antes de otorgar rewards
  * Mostrar breakdown: "Base: 100 XP, Pet Bonus: +15 XP"
* [ ] Sistema de Happiness
  * Happiness decae 5 puntos por día sin interactuar
  * Restaurar con "Feed Pet" (cuesta 50 coins)
  * Happiness < 50 → habilidades al 50%
  * Happiness = 100 → habilidades al 100%

### **Pet Progression**

* [ ] `POST /api/pets/:userPetId/feed` - Alimentar mascota
  * Restaurar happiness a 100
  * Costo: 50 coins
  * Actualizar last_interaction
  * Incrementar times_fed
  * Return: nueva happiness
* [ ] Pet gana XP con el jugador
  * Cada juego completado: pet gana 10% del XP del jugador
  * Actualizar current_xp en user_pets
  * Check si alcanza next evolution stage
  * Auto-evolve si cumple XP requerida
* [ ] Método `evolvePet(userPetId)`
  * Verificar current_xp >= xp_to_next_stage
  * Incrementar evolution_stage (1→2→3)
  * Actualizar sprite_url al siguiente stage
  * Mejorar abilities (+5% por evolución)
  * Crear notificación "Your pet evolved!"
  * Animación especial de evolución

### **Endpoints**

* [ ] `GET /api/users/pets` - Mascotas del usuario
* [ ] `GET /api/users/pets/active` - Mascota activa
* [ ] `POST /api/pets/adopt` - Adoptar
* [ ] `PUT /api/pets/:id/activate` - Activar
* [ ] `POST /api/pets/:id/feed` - Alimentar
* [ ] `GET /api/pets/:id/stats` - Stats de mascota

### **Testing Backend**

* [ ] Tests de adopción
* [ ] Tests de bonificaciones aplicadas
* [ ] Tests de evolución
* [ ] Tests de happiness decay

---

## 🎨 Frontend Tasks

### **Pet Collection Page**

* [ ] PetGallery (/pets)
  * Grid de mascotas disponibles
  * Owned vs Not Owned (locked)
  * Filtros: rarity, category, owned
  * Empty state para comenzar colección
* [ ] PetCard component
  * Animación de la mascota (sprite/Lottie/Rive/3D)
  * Nombre + rareza
  * Badge "Owned" o "Locked"
  * Stats preview (XP boost, coin finder)
  * Click: abrir detalles

### **Pet Detail Modal**

* [ ] PetDetailView component
  * Animación grande de la mascota
  * Nombre + descripción + lore
  * **Stats detallados:**
    * Abilities (iconos + porcentajes)
    * Current level
    * Evolution stage (1/3)
    * XP progress bar hacia siguiente etapa
    * Happiness meter (corazones)
    * Games played together
  * Botones:
    * "Adopt" (si no la tiene)
    * "Activate" (si la tiene pero no activa)
    * "Feed" (si happiness < 100)
    * "View Evolution Stages" (preview 3 formas)

### **Dashboard Integration**

* [ ] "Yo + Mi Mascota" section
  * Avatar del usuario a la izquierda
  * Mascota activa a la derecha (animada)
  * Ambos sobre un mini-escenario
  * Happiness hearts flotando
  * Botón "Change Pet"
* [ ] PetStatusWidget
  * Mini card de mascota activa
  * Level + XP bar
  * Happiness hearts
  * Active bonuses destacados:
    * "+15% XP" badge
    * "+10% Coins" badge
  * Click: abrir detalles rápidos

### **Pet Animations**

* [ ] CSS Sprite Animation (Common)
  * Idle animation (4 frames loop)
  * 200px × 200px sprites
* [ ] Lottie Integration (Uncommon)
  * Import Lottie component
  * Loop animation suave
* [ ] Rive Integration (Rare/Epic)
  * State machine: idle, happy (happiness > 80), sad (< 50)
  * Interactive (click para reacción)
* [ ] Three.js 3D (Legendary)
  * Modelo 3D rotable con mouse
  * Iluminación dinámica
  * Sombras suaves

### **Evolution Animation**

* [ ] PetEvolutionScreen component
  * Fullscreen overlay
  * Mascota brillando con partículas
  * Transformación de stage 1 → 2 → 3
  * Sound effect épico
  * "Your pet evolved!" con confetti
  * Mostrar nuevos stats mejorados
  * Botón "Amazing!"

### **Pet Shop Section**

* [ ] Shop tab "Pets"
  * Grid de mascotas adoptables
  * Precio en coins/gems
  * Locked si no cumple level
  * Preview de abilities
  * Botón "Adopt Now"

### **Testing Frontend**

* [ ] Tests de adopción flow
* [ ] Tests de activar mascota
* [ ] Tests de animaciones

---

## ✅ Criterios de Aceptación

* [ ] Usuario puede ver catálogo de mascotas
* [ ] Usuario puede adoptar mascotas con coins/gems
* [ ] Usuario puede activar 1 mascota a la vez
* [ ] Mascota activa aparece en dashboard junto al avatar
* [ ] Mascota da bonificaciones reales (+XP, +coins)
* [ ] Usuario puede ver stats de cada mascota
* [ ] Mascotas evolucionan al ganar XP
* [ ] Happiness afecta efectividad de habilidades
* [ ] Usuario puede alimentar mascotas
* [ ] Animaciones funcionan según rareza (sprite/Lottie/Rive/3D)
* [ ] UI muestra "Yo + Mi Mascota" claramente

---

# 🔷 SPRINT 9: Sistema de Logros (Semanas 17-18)

## 🎯 Objetivos

* Sistema de achievements completo
* Tracking automático de progreso
* Notificaciones de desbloqueo
* Showcase de logros en perfil

---

## 📦 Backend Tasks

### **Achievement System**

* [ ] Poblar tabla `achievements` con 30-50 logros
  * Quiz category: "First Steps", "Perfect Score", "Speed Demon"
  * Social: "Social Butterfly", "Team Player"
  * Progression: "Level 10", "Level 50", "Level 100"
  * Collection: "5 Pets", "10 Skins"
  * Mastery: "Math Master", "Science Genius"
  * Special: "Weekend Warrior", "Night Owl"
  * Seasonal: eventos especiales
* [ ] `GET /api/achievements` - Listar achievements
  * Filtros: category, rarity, is_unlocked
  * Incluir progreso del usuario
  * Ordenar por: newest, rarity, progress
  * No mostrar is_secret si no está desbloqueado
* [ ] `GET /api/achievements/:id` - Detalle
  * Info completa (si no es secreto)
  * Progreso: current / requirement
  * Recompensas al desbloquear
  * % de jugadores que lo tienen

### **Achievement Tracking**

* [ ] Método `checkAchievements(userId, eventType, eventData)`
  * Ejecutar tras acciones clave:
    * Completar quiz
    * Ganar juego
    * Alcanzar nivel
    * Agregar amigo
    * Adoptar mascota
  * Iterar achievements aplicables
  * Actualizar progress en user_achievements
  * Si progress >= requirement: unlockAchievement()
* [ ] Método `unlockAchievement(userId, achievementId)`
  * Marcar is_unlocked = true
  * Registrar unlocked_at timestamp
  * Otorgar recompensas (coins, gems, XP, title, item)
  * Crear notificación con celebración
  * Broadcast a amigos si es logro raro
  * Incrementar times_completed si es repeatable
* [ ] Achievement triggers por evento
  * `quiz_completed`: "First Steps" (1 quiz)
  * `perfect_score`: "Perfectionist" (100% accuracy)
  * `games_won`: "Champion" (50 victorias)
  * `level_reached`: "Level X" (por nivel)
  * `friends_added`: "Social" (10 amigos)
  * `pets_collected`: "Collector" (5 mascotas)
  * `streak_milestone`: "Week Warrior" (7 días consecutivos)

### **Progress Tracking**

* [ ] Auto-crear user_achievements al crear usuario
  * Insertar todos los achievements con progress = 0
  * Así siempre hay registro para trackear
* [ ] Método `getAchievementProgress(userId)`
  * Retornar todos los achievements con progreso
  * Calcular % completado global
  * Listar próximos a desbloquear (>70% progreso)
* [ ] Método `getShowcasedAchievements(userId)`
  * Retornar achievements con is_showcased = true
  * Máximo 5 showcased
  * Mostrar en perfil público

### **Endpoints**

* [ ] `GET /api/achievements` - Listar todos
* [ ] `GET /api/achievements/:id` - Detalle
* [ ] `GET /api/users/:id/achievements` - Logros del usuario
* [ ] `PUT /api/users/achievements/:id/showcase` - Destacar logro
* [ ] `GET /api/achievements/progress` - Progreso global

### **Testing Backend**

* [ ] Tests de tracking automático
* [ ] Tests de unlock con rewards
* [ ] Tests de achievements repeatables
* [ ] Tests de achievements secretos

---

## 🎨 Frontend Tasks

### **Achievements Page**

* [ ] AchievementsGallery (/achievements)
  * Grid de achievement cards
  * Tabs por categoría (All, Quiz, Social, etc.)
  * Filtro "Unlocked Only"
  * Progress indicator global: "15/50 achievements"
  * Barra de progreso total
* [ ] AchievementCard component
  * Badge icon animado
  * Nombre + descripción
  * Rareza con glow
  * Progress bar si no desbloqueado
  * "Locked" overlay con candado si secreto
  * Hover: tooltip con recompensas
  * Click: abrir detalles

### **Achievement Unlock Animation**

* [ ] AchievementUnlockModal
  * Fullscreen overlay con fondo oscuro
  * Badge aparece con zoom + glow
  * Nombre del achievement
  * "+500 coins, +50 gems" animados
  * Confetti dorado
  * Sound effect de logro
  * Botón "Claim Rewards"
* [ ] Toast notification
  * Mini card en esquina superior derecha
  * Badge + "Achievement Unlocked!"
  * Auto-dismiss en 5 segundos
  * Click: abrir modal completo

### **Profile Integration**

* [ ] "Mis Logros" section en perfil
  * Showcase de 5 achievements destacados
  * Grid más grande para estos 5
  * Botón "Manage Showcase"
  * Progress summary: "15/50 unlocked"
  * Link a "View All Achievements"
* [ ] ShowcaseManager modal
  * Lista de achievements desbloqueados
  * Checkbox para seleccionar 5
  * Preview de cómo se verán
  * Botón "Save Showcase"

### **Dashboard Widget**

* [ ] RecentAchievements widget
  * Últimos 3 logros desbloqueados
  * Mini cards con badge
  * "View All" link
  * Empty state: "Start your journey!"

### **Testing Frontend**

* [ ] Tests de animación de unlock
* [ ] Tests de showcase selection
* [ ] Tests de filtros

---

## ✅ Criterios de Aceptación

* [ ] Sistema trackea progreso automáticamente
* [ ] Logros se desbloquean al cumplir requisitos
* [ ] Notificación celebratoria al desbloquear
* [ ] Recompensas se otorgan correctamente
* [ ] Usuario puede ver todos sus achievements
* [ ] Usuario puede destacar 5 achievements en perfil
* [ ] Progress bars muestran avance correcto
* [ ] Achievements secretos no revelan info hasta unlock
* [ ] UI es motivante y celebratoria

---

# 🔷 SPRINT 10: Amigos + Social (Semanas 19-20)

## 🎯 Objetivos

* Sistema de amigos funcional
* Enviar/aceptar/rechazar solicitudes
* Leaderboard entre amigos
* Ver perfiles de amigos

---

## 📦 Backend Tasks

### **Friends System**

* [ ] `POST /api/friends/request` - Enviar solicitud
  * Validar que no son amigos ya
  * Validar que no hay solicitud pendiente
  * Crear en friendships con status = 'pending'
  * Crear notificación al receptor
  * Return: solicitud creada
* [ ] `PUT /api/friends/accept/:id` - Aceptar solicitud
  * Validar que user es el receptor
  * Actualizar status = 'accepted'
  * Registrar accepted_at timestamp
  * Incrementar total_friends en ambos perfiles
  * Crear notificación al solicitante
  * Return: amistad confirmada
* [ ] `PUT /api/friends/reject/:id` - Rechazar solicitud
  * Actualizar status = 'rejected'
  * Crear notificación al solicitante
* [ ] `DELETE /api/friends/:id` - Eliminar amigo
  * Soft delete o hard delete (decidir)
  * Decrementar total_friends
  * Notificar al otro usuario

### **Friends List**

* [ ] `GET /api/friends` - Listar amigos
  * Status: accepted (amigos confirmados)
  * Incluir: avatar, level, last_login, is_online
  * Ordenar por: last_activity, level, name
  * Paginación
* [ ] `GET /api/friends/requests` - Solicitudes pendientes
  * Inbox: solicitudes recibidas (status = pending, friend_id = me)
  * Outbox: solicitudes enviadas (status = pending, user_id = me)
  * Incluir info del usuario solicitante
* [ ] `GET /api/users/search` - Buscar usuarios para agregar
  * Buscar por username o email
  * Excluir usuarios ya amigos
  * Excluir solicitudes pendientes
  * Return: lista de usuarios encontrados

### **Friends Activity**

* [ ] `GET /api/friends/:id/activity` - Actividad reciente del amigo
  * Últimos 10 juegos
  * Achievements recientes
  * Mascotas nuevas
  * Level ups
* [ ] `GET /api/friends/:id/profile` - Ver perfil de amigo
  * Public info: avatar, level, stats, showcased achievements
  * Respetar profile_privacy settings
  * No mostrar private data

### **Friend Leaderboards**

* [ ] `GET /api/leaderboards/friends` - Ranking entre amigos
  * Ordenar por total_xp
  * Mostrar: rank, avatar, username, level, xp
  * Highlight current user
  * Incluir last 7 days change (+5 positions)

### **Endpoints**

* [ ] `POST /api/friends/request` - Enviar solicitud
* [ ] `PUT /api/friends/accept/:id` - Aceptar
* [ ] `PUT /api/friends/reject/:id` - Rechazar
* [ ] `DELETE /api/friends/:id` - Eliminar
* [ ] `GET /api/friends` - Listar amigos
* [ ] `GET /api/friends/requests` - Solicitudes
* [ ] `GET /api/users/search` - Buscar usuarios

### **Testing Backend**

* [ ] Tests de enviar/aceptar solicitudes
* [ ] Tests de eliminar amigos
* [ ] Tests de búsqueda de usuarios
* [ ] Tests de leaderboard amigos

---

## 🎨 Frontend Tasks

### **Friends Page**

* [ ] FriendsMain page (/friends)
  * Tabs: "My Friends", "Requests", "Find Friends"
  * Contador de solicitudes pendientes
  * Empty state para comenzar
* [ ] MyFriends tab
  * Lista de amigos aceptados
  * Cards con:
    * Avatar + level
    * Online indicator (verde/gris)
    * Last seen (si offline)
    * Quick stats (level, victories)
    * Botón "View Profile"
    * Botón "Remove Friend" (confirmación)
  * Ordenar por: online first, level, name

### **Friend Requests**

* [ ] RequestsTab component
  * Sección "Received" (inbox)
    * Cards con:
      * Avatar + username
      * Requested_at (hace X tiempo)
      * Botón "Accept" (verde)
      * Botón "Reject" (rojo)
  * Sección "Sent" (outbox)
    * Cards con:
      * Avatar + username
      * "Pending..." status
      * Botón "Cancel Request"
  * Empty state amigable

### **Find Friends**

* [ ] FindFriends tab
  * Search bar: buscar por username
  * Results grid:
    * Avatar + username + level
    * Botón "Add Friend"
    * Badge si ya enviaste solicitud
  * Sugerencias automáticas (usuarios similares)

### **Friend Profile Modal**

* [ ] FriendProfile component
  * Avatar grande + frame
  * Username + level + title
  * Stats grid (respetando privacidad):
    * Total games, wins, accuracy
    * Showcased achievements
    * Active pet (si visible)
  * Activity feed:
    * Recent achievements
    * Recent games
  * Botones:
    * "Challenge to Game" (futuro)
    * "View Full Stats"
    * "Remove Friend"

### **Friend Leaderboard**

* [ ] FriendLeaderboard widget (/leaderboards/friends)
  * Mini leaderboard con top 10 amigos
  * Ordenar por XP
  * Current user destacado
  * Change indicators (↑↓)
  * Link a "View Global Leaderboard"

### **Dashboard Integration**

* [ ] FriendsWidget en dashboard
  * Mini list de 3-5 amigos online
  * "X friends online"
  * Quick access a friends page
  * Badge con # de solicitudes pendientes

### **Notifications Integration**

* [ ] Friend request received → notification
* [ ] Friend request accepted → notification
* [ ] Friend achieved milestone → optional notification

### **Testing Frontend**

* [ ] Tests de enviar solicitud
* [ ] Tests de aceptar/rechazar
* [ ] Tests de búsqueda

---

## ✅ Criterios de Aceptación

* [ ] Usuario puede buscar otros usuarios
* [ ] Usuario puede enviar solicitudes de amistad
* [ ] Usuario recibe notificación de solicitud
* [ ] Usuario puede aceptar/rechazar solicitudes
* [ ] Lista de amigos muestra status online/offline
* [ ] Usuario puede ver perfil de amigos
* [ ] Leaderboard de amigos funciona
* [ ] Usuario puede eliminar amigos
* [ ] Privacy settings se respetan

---

# 🔷 SPRINT 11: Board Mode RPG (Semanas 21-22)

## 🎯 Objetivos

* Modo tablero tipo Mario Party educativo
* Eventos aleatorios en casillas
* Progresión visual con avatar + mascota
* Dado animado para movimiento

---

## 📦 Backend Tasks

### **Board Mode Logic**

* [ ] Configuración de tablero en game.config
  * board_size: 30-50 casillas
  * board_layout: linear (serpiente) o circular
  * event_positions: array de índices con eventos
  * win_condition: llegar a última casilla
* [ ] Método `initializeBoardGame(gameId)`
  * Crear board_events por gameId
  * Asignar eventos aleatorios a casillas
  * Spawn probabilities según tabla board_events
  * Guardar en game metadata
  * Colocar jugadores en posición 0
* [ ] Método `rollDice(gameId, playerId)`
  * Generar número aleatorio 1-6
  * Actualizar board_position del jugador
  * Verificar evento en nueva posición
  * Ejecutar evento si existe
  * Broadcast: player moved + new position
  * Return: diceValue, newPosition, event

### **Board Events System**

* [ ] Método `executeEvent(eventType, playerId)`
  * bonus_coins: agregar coins al jugador
  * bonus_xp: agregar XP extra
  * bonus_gems: agregar gemas
  * trap_lose_coins: restar coins (-50)
  * trap_go_back: retroceder 3 casillas
  * teleport_forward: avanzar 5 casillas
  * quiz_challenge: pregunta extra (doble reward)
  * powerup: otorgar powerup random
  * mystery_box: recompensa aleatoria
  * boss_encounter: iniciar boss fight
  * Actualizar player stats
  * Broadcast evento a todos
* [ ] Eventos especiales cada X casillas
  * Cada 10 casillas: mini checkpoint (bonus)
  * Cada 20 casillas: tienda para comprar items
  * Última casilla: podium finish

### **Game Flow Board Mode**

* [ ] Turnos por jugador
  * Orden definido al iniciar (aleatorio o por score)
  * Solo el jugador en turno puede tirar dado
  * Timeout de 15 segundos por turno
  * Si no tira: auto-roll
* [ ] Combinar con preguntas
  * Cada X turnos: pregunta de quiz
  * Responder correcta: dado con +1 bonus
  * Responder incorrecta: dado normal
  * Alternar entre movimiento y preguntas
* [ ] Win condition
  * Primer jugador en llegar a casilla final
  * O mayor score después de N turnos
  * Otorgar rewards según ranking

### **Endpoints**

* [ ] `POST /api/games/:id/board/roll` - Tirar dado
* [ ] `GET /api/games/:id/board/state` - Estado del tablero
* [ ] `POST /api/games/:id/board/buy-item` - Comprar en tienda (checkpoint)

### **Socket Events**

* [ ] `board:roll-dice` - Player tira dado
* [ ] `board:player-moved` - Broadcast movimiento
* [ ] `board:event-triggered` - Evento ejecutado
* [ ] `board:turn-change` - Cambio de turno
* [ ] `board:game-finished` - Alguien llegó al final

### **Testing Backend**

* [ ] Tests de roll dice (1-6 range)
* [ ] Tests de eventos
* [ ] Tests de win condition

---

## 🎨 Frontend Tasks

### **Board Game Screen**

* [ ] BoardGameCanvas component (React Konva)
  * Renderizar 30-50 casillas en path
  * Layout serpiente (zig-zag)
  * Casillas normales: gris
  * Casillas con evento: color según tipo
  * Checkpoints: doradas grandes
  * Casilla final: copa brillante
* [ ] PlayerToken component
  * Avatar del jugador en miniatura
  * Mascota al lado (si tiene activa)
  * Animación de salto al moverse
  * Smooth transition entre casillas
  * Stacked si varios en misma casilla

### **Dice Roller**

* [ ] DiceRoller component
  * Dado 3D isométrico
  * Click para tirar (si es tu turno)
  * Animación de rotación (GSAP)
  * Resultado destacado
  * Disabled si no es tu turno
  * Auto-roll si timeout

### **Board Events UI**

* [ ] EventPopup component
  * Aparece al caer en evento
  * Icono grande del evento
  * Descripción: "¡Encontraste un tesoro!"
  * Efecto visual:
    * Bonus: partículas doradas
    * Trap: shake + rojo
    * Teleport: portal animado
  * Auto-dismiss en 3 segundos
* [ ] EventIndicators en casillas
  * Iconos pequeños en casillas con eventos
  * Hover: tooltip con tipo de evento
  * Mystery boxes: ? animado

### **Game HUD**

* [ ] BoardGameHUD component
  * Panel izquierdo:
    * Current turn indicator
    * Turn timer (15s countdown)
    * Dice result history
  * Panel derecho:
    * Mini leaderboard (top 5)
    * Tu posición en tablero
    * Coins/gems actuales
  * Centro:
    * Botón "Roll Dice" (grande, destacado)
    * Message center: "Waiting for Player X..."

### **Turn System UI**

* [ ] TurnIndicator
  * Banner: "Your Turn!" o "Player X's Turn"
  * Arrow apuntando al jugador activo
  * Highlight de token del jugador en turno
  * Sound cue al cambiar turno

### **Checkpoint Shop**

* [ ] CheckpointShop modal
  * Aparece al caer en checkpoint
  * Mini tienda con 3-5 items:
    * Extra dice roll (100 coins)
    * Teleport forward (200 coins)
    * Steal coins from player (300 coins)
    * Shield (protección 1 trap)
  * Botón "Skip" para continuar

### **Animations**

* [ ] Player movement (smooth path)
* [ ] Dice roll (3D rotation)
* [ ] Event triggers (particles)
* [ ] Coin collection (fly to HUD)
* [ ] Trap activation (shake screen)

### **Testing Frontend**

* [ ] Tests de dice roll animation
* [ ] Tests de player movement
* [ ] Tests de event triggers

---

## ✅ Criterios de Aceptación

* [ ] Tablero se renderiza correctamente (30-50 casillas)
* [ ] Jugadores se mueven según resultado del dado
* [ ] Eventos se ejecutan al caer en casillas
* [ ] Sistema de turnos funciona correctamente
* [ ] Animaciones son smooth y claras
* [ ] Primer jugador en llegar gana
* [ ] Rewards se otorgan según ranking
* [ ] UI muestra claramente de quién es el turno
* [ ] Timeout auto-roll funciona
* [ ] Eventos dan bonuses/penalizaciones reales

---

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

# 🔷 SPRINT 13: Audio + Configuración + Polish (Semanas 25-26)

## 🎯 Objetivos

* Sistema de audio completo
* Configuración de usuario
* Polish general de UX
* Optimización de performance

---

## 📦 Backend Tasks

### **User Settings**

* [ ] Tabla/campos en user_profiles para settings
  * audio_master_volume: 0-100
  * audio_music_volume: 0-100
  * audio_sfx_volume: 0-100
  * audio_voice_volume: 0-100
  * notifications_enabled: boolean
  * email_notifications: boolean
  * theme: 'light' | 'dark' | 'auto'
  * accessibility_high_contrast: boolean
  * accessibility_reduce_motion: boolean
* [ ] `PUT /api/users/settings` - Actualizar configuración
  * Validar rangos (0-100)
  * Guardar en user_profiles
  * Return: settings actualizadas
* [ ] `GET /api/users/settings` - Obtener configuración
  * Return: todas las settings del usuario

### **Audio Assets Management**

* [ ] Endpoint para listar audio assets
  * `GET /api/assets/sounds` - Lista de SFX
  * `GET /api/assets/music` - Lista de música
  * Metadata: name, url, duration, category
* [ ] CDN/Storage para audio
  * Subir archivos a Cloudflare R2 / S3
  * Optimizar formatos (MP3 + OGG)
  * Compression adecuada

### **Testing Backend**

* [ ] Tests de save/load settings
* [ ] Tests de validación de rangos

---

## 🎨 Frontend Tasks

### **Audio System (Howler.js)**

* [ ] AudioManager singleton
  * Cargar todos los SFX al inicio
  * Preload música de fondo
  * Gestión de volúmenes por categoría
  * Mute/unmute global
* [ ] Sound Effects
  * Correct answer: "ding.mp3"
  * Wrong answer: "buzzer.mp3"
  * Combo: "combo.mp3" (pitch increase)
  * Level up: "levelup.mp3"
  * Coin collect: "coin.mp3"
  * Achievement unlock: "achievement.mp3"
  * Button click: "click.mp3"
  * Notification: "notification.mp3"
* [ ] Background Music
  * Lobby music: "lobby_theme.mp3" (loop)
  * Gameplay music: "game_theme.mp3" (loop)
  * Boss battle: "boss_theme.mp3" (loop)
  * Victory: "victory.mp3"
  * Defeat: "defeat.mp3"
  * Smooth transitions (crossfade)
* [ ] Integración con gameplay
  * Play SFX en eventos clave
  * Cambiar música según contexto
  * Fade out/in entre screens
  * Respect user settings

### **Settings Page**

* [ ] SettingsMain page (/settings)
  * Tabs: Audio, Notifications, Accessibility, Account
* [ ] AudioSettings tab
  * **Sliders con iconos:**
    * 🔊 Master Volume (0-100)
    * 🎵 Music Volume (0-100)
    * 🎧 Sound Effects Volume (0-100)
    * 💬 Voice Volume (0-100, futuro)
  * Preview button (test sound)
  * Mute all checkbox
  * Save button
* [ ] NotificationSettings tab
  * Toggle: In-app notifications
  * Toggle: Email notifications
  * Toggle: Friend requests
  * Toggle: Achievement unlocks
  * Toggle: Event reminders
* [ ] AccessibilitySettings tab
  * Toggle: High contrast mode
  * Toggle: Reduce motion (disable animations)
  * Toggle: Larger text
  * Toggle: Screen reader support
  * Color blind mode selector
* [ ] AccountSettings tab
  * Change username
  * Change email
  * Change password
  * Privacy: profile visibility
  * Privacy: stats visibility
  * Logout button
  * Delete account button

### **Avatar Customization (Completar)**

* [ ] AvatarEditor page (/avatar-editor)
  * Canvas grande con avatar preview
  * **Categorías:**
    * Skin tone (6 opciones)
    * Hair style (10 opciones)
    * Hair color (8 colores)
    * Eyes (5 estilos)
    * Mouth (5 expresiones)
    * Clothes (10 outfits)
    * Accessories (hats, glasses, badges)
  * Botón "Randomize"
  * Botón "Save Avatar"
  * Botón "Buy More Items" (link a shop)

### **Performance Optimization**

* [ ] Code splitting por rutas
  * Lazy load de páginas
  * React.lazy + Suspense
  * Separate bundles por feature
* [ ] Image optimization
  * WebP format
  * Lazy loading de imágenes
  * Placeholder mientras carga
* [ ] Animation optimization
  * Use transform/opacity (GPU)
  * Avoid layout thrashing
  * RequestAnimationFrame para custom animations
* [ ] Bundle size reduction
  * Tree shaking
  * Remove unused dependencies
  * Analyze bundle con webpack-bundle-analyzer

### **UX Polish**

* [ ] Loading states everywhere
  * Skeleton loaders
  * Spinners apropiados
  * Progress bars
* [ ] Empty states
  * Friendly illustrations
  * Clear CTAs
  * Helpful messages
* [ ] Error states
  * Clear error messages
  * Retry buttons
  * Support links
* [ ] Success feedback
  * Toast notifications
  * Confetti celebrations
  * Clear confirmations
* [ ] Tooltips y hints
  * Hover tooltips en iconos
  * First-time user hints
  * Keyboard shortcuts hints

### **Testing Frontend**

* [ ] E2E tests con Playwright
* [ ] Visual regression tests
* [ ] Performance profiling
* [ ] Accessibility audit

---

## ✅ Criterios de Aceptación

* [ ] Sistema de audio completo funciona
* [ ] Todos los SFX se reproducen en eventos correctos
* [ ] Música de fondo cambia según contexto
* [ ] Volúmenes se pueden ajustar independientemente
* [ ] Settings se guardan y persisten
* [ ] Avatar editor completo y funcional
* [ ] Notificaciones respetan preferencias
* [ ] Accessibility options funcionan
* [ ] Performance es óptimo (\<3s carga inicial)
* [ ] No hay errores en consola
* [ ] Mobile responsive en todos los screens

---

# 📊 RESUMEN GENERAL

**Total: 7 sprints (14 semanas ≈ 3.5 meses)**

1. ✅ Sprint 7: Tienda + Avatares + Inventario
2. ✅ Sprint 8: Mascotas + Colección (con habilidades activas)
3. ✅ Sprint 9: Sistema de Logros
4. ✅ Sprint 10: Amigos + Social
5. ✅ Sprint 11: Board Mode RPG
6. ✅ Sprint 12: Survival Mode Battle Royale
7. ✅ Sprint 13: Audio + Configuración + Polish

**Funcionalidades cubiertas:**
- ✅ Tienda llamativa (mix Gacha + Catalog)
- ✅ Mascotas con animaciones (sprite/Lottie/Rive/3D)
- ✅ Mascotas dan bonuses reales (+XP, +coins)
- ✅ Vista "Yo + Mi Mascota"
- ✅ Logros con tracking automático
- ✅ Amigos + Social
- ✅ Board Mode (tablero RPG)
- ✅ Survival Mode (battle royale)
- ✅ Audio completo (Howler.js)
- ✅ Configuración + Avatar editor
- ✅ Polish general

**Próximos pasos:**
1. Aprobar este plan
2. Empezar Sprint 7
3. Iterar según feedback

¿Apruebas este roadmap completo?