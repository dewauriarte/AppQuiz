## **🔷 SPRINT 3: Listas de Participantes \+ Game Setup (Semanas 5-6)**

### **🎯 Objetivos del Sprint**

* Teachers pueden crear listas de estudiantes
* Import desde Excel funcional
* Game codes generados
* Lobby básico funcional

### **📦 Backend Tasks**

#### **Gestión de Listas (Class Lists)**

\[✅\] Tabla auxiliar `class_lists` (crear migración)  
CREATE TABLE class\_lists (  list\_id SERIAL PRIMARY KEY,  teacher\_id INTEGER REFERENCES users(user\_id),  name VARCHAR(100) NOT NULL,  grade\_level VARCHAR(50),  created\_at TIMESTAMP DEFAULT NOW());CREATE TABLE class\_list\_students (  list\_id INTEGER REFERENCES class\_lists(list\_id),  user\_id INTEGER REFERENCES users(user\_id),  nickname VARCHAR(50),  PRIMARY KEY (list\_id, user\_id));

*
* \[✅\] `POST /api/lists` \- Crear lista
* \[✅\] `POST /api/lists/:id/students` \- Agregar estudiantes
    * Batch insert
    * Validar que users existan
* \[✅\] `POST /api/lists/import-excel` \- Import Excel
    * Parsear Excel con exceljs
    * Validar formato (Nombre, Apellido columns)
    * Crear usuarios si no existen
    * Agregar a lista
* \[✅\] `GET /api/lists` \- Listar listas del teacher
* \[✅\] `GET /api/lists/:id` \- Ver lista con estudiantes
* \[✅\] `PUT /api/lists/:id` \- Actualizar lista
* \[✅\] `DELETE /api/lists/:id` \- Eliminar lista
* \[✅\] `DELETE /api/lists/:id/students/:userId` \- Remover estudiante
* \[✅\] `GET /api/auth/search-user` \- Buscar usuario por username

#### **Game Creation & Management**

\[✅\] `POST /api/games` \- Crear juego  
{  set\_id: number,  game\_mode: 'classic' | 'board' | 'survival',  max\_players: number,  config: {    show\_leaderboard\_live: boolean,    points\_for\_speed: boolean,    allow\_powerups: boolean  }}

*
    * Generar game\_code único (6 chars alphanumeric)
    * Status \= 'lobby'
    * Retornar game con code
* \[✅\] `GET /api/games/:code` \- Obtener info de juego
    * Public endpoint (no auth necesaria)
    * Info básica del quiz
    * Cantidad de jugadores
    * Status
* \[✅\] `GET /api/games` \- Listar juegos del teacher
* \[✅\] `GET /api/games/:id` \- Obtener juego por ID
* \[✅\] `PUT /api/games/:id/status` \- Actualizar estado del juego
* \[✅\] `DELETE /api/games/:id` \- Cancelar juego
    * Solo si status \= 'lobby'
    * Solo teacher owner

#### **Helper Functions**

\[✅\] Generador de game codes únicos  
function generateGameCode(): string {  // 6 caracteres: A-Z, 0-9  // Verificar que no exista en DB  // Retry si colisión}

*

\[✅\] Excel parser con validación  
function parseExcelToStudents(file): Student\[\] {  // Leer Excel  // Validar columnas requeridas  // Mapear a formato interno  // Return array de estudiantes}

*

#### **Socket.IO Setup**

* \[✅\] Configuración de Socket.IO con autenticación JWT
* \[✅\] Handlers de eventos de lobby:
    * `game:join` \- Unirse a juego
    * `game:leave` \- Salir de juego
    * `game:ready` \- Marcar como listo
    * `game:start` \- Iniciar juego (teacher)
* \[✅\] Rooms por game code
* \[✅\] Tracking de jugadores conectados
* \[✅\] Eventos en tiempo real (player-joined, player-left, player-ready)

#### **Testing Backend**

* \[ \] Tests de CRUD de listas
* \[ \] Tests de import Excel (casos válidos e inválidos)
* \[ \] Tests de generación de game codes
* \[ \] Tests de creación de juegos
* \[ \] Tests de validaciones

### **🎨 Frontend Tasks**

#### **Páginas de Listas**

* \[✅\] Página "Mis Listas" (/lists)
    * Listado de listas
    * Contador de estudiantes
    * Acciones: Ver, Editar, Eliminar
    * Botón "Crear Lista"
    * Botón "Importar Excel"
    * Búsqueda y paginación
* \[✅\] Página "Crear Lista" (/lists/create)
    * Nombre de lista
    * Grado/Nivel
* \[✅\] Página "Importar Excel" (/lists/import)
    * Drag & drop de archivos
    * Descarga de plantilla
    * Resultado detallado
    * Auto-creación de usuarios
* \[✅\] Página "Detalle de Lista" (/lists/:id)
    * Ver estudiantes
    * Agregar estudiante por username
    * Remover estudiantes
    * Editar lista
    * Eliminar lista
* \[✅\] Integración con TeacherDashboard
    * Botón "Mis Listas" en quick actions
    * Método de creación:
        * Manual (formulario)
        * Excel (upload)
    * Preview de estudiantes
    * Botón "Guardar"
* \[ \] Excel Uploader component
    * Drag & drop
    * Template Excel descargable
    * Validación en cliente
    * Preview de datos parseados
    * Indicar errores por fila

#### **Página de Iniciar Juego**

* \[✅\] "Iniciar Juego" flow
    * Step 1: Seleccionar Quiz (de "Mis Quizzes")
    * Step 2: Seleccionar Lista (de "Mis Listas") - Opcional por ahora
    * Step 3: Configuración de juego
        * Game mode (Classic, Board, Survival)
        * Max players
        * Opciones (leaderboard live, speed points)
    * Step 4: Confirmar y generar código
* \[✅\] Pantalla de Lobby (Teacher view)
    * Game code destacado (grande, copyable)
    * QR code para unirse (pendiente)
    * Lista de jugadores que se van uniendo (real-time)
    * Botón "Iniciar Juego" (enabled cuando 2+ players)
    * Botón "Cancelar"
    * Timer opcional (auto-start en 5 min) - Pendiente

#### **Página de Unirse al Juego (Student)**

* \[✅\] Input para ingresar game code
* \[✅\] Input opcional para nickname
* \[✅\] Botón "Unirse al Juego"
* \[✅\] Redirección al lobby después de unirse
* \[✅\] Vista del lobby para estudiantes (lista de jugadores, botón ready)

#### **Components**

* \[✅\] StudentListCard component
* \[✅\] ExcelUploadZone component
* \[✅\] GameConfigPanel component (integrado en CreateGamePage)
* \[✅\] GameCodeDisplay component (integrado en GameLobbyPage)
    * Large code
    * Copy button
    * Share button - Pendiente
    * QR code - Pendiente
* \[✅\] PlayerLobbyList component (integrado en GameLobbyPage)

#### **Testing Frontend**

* \[ \] Tests de creación de listas
* \[ \] Tests de upload Excel
* \[ \] Tests de flujo iniciar juego
* \[ \] Tests de componentes

### **✅ Criterios de Aceptación**

* \[ \] Teacher puede crear lista manualmente (nombre \+ apellidos)
* \[ \] Teacher puede subir Excel con estudiantes
* \[ \] Template Excel descargable y claro
* \[ \] Import Excel valida formato y muestra errores claros
* \[ \] Teacher puede ver todas sus listas
* \[ \] Teacher puede editar/eliminar listas
* \[ \] Teacher puede iniciar juego seleccionando quiz \+ lista
* \[ \] Game code de 6 caracteres se genera correctamente
* \[ \] Game code es único (no hay colisiones)
* \[ \] Lobby muestra game code prominente
* \[ \] Copy button funciona
* \[ \] UI clara y guiada (stepper)

### **📈 Métricas de Éxito**

* Teacher crea lista en \<3 min
* Import Excel exitoso \>95% casos
* Game code generado en \<500ms
* 0 colisiones de game codes en testing
* UX flow intuitive (no confusión en testing)

---