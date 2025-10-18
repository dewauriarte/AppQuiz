

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