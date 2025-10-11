
## **🔷 SPRINT 2: Creación de Quizzes \+ IA (Semanas 3-4)**

### **🎯 Objetivos del Sprint**

* Profesores pueden crear quizzes manualmente
* Integración con Claude API funcional
* Upload de PDFs y generación automática
* CRUD completo de question sets

### **📦 Backend Tasks**

#### **Integración Claude API se agrego openai y gemini**

* \[*\] Setup Anthropic SDK
* \[*\] Crear AIService.js
* \[*\] Método `generateQuestionsFromPDF()`
    * Parsear PDF con pdf-parse
    * Extraer texto limpio
    * Construir prompt para Claude
    * Llamar a Claude API
    * Parsear respuesta JSON
    * Validar estructura con Zod
    * Handle errores y timeouts
* \[*\] Método `generateQuestionsFromText()`
* \[*\] Rate limiting para API calls
* \[*\] Caching de respuestas (Redis)
* \[*\] Logging de uso de API (costos)

#### **CRUD de Question Sets**

* \[ \] `POST /api/quizzes` \- Crear quiz
    * Validar que user sea teacher
    * Guardar en question\_sets
    * Opción: manual o con IA
* \[ \] `POST /api/quizzes/:id/questions` \- Agregar preguntas
    * Batch insert de preguntas \+ opciones
    * Transacción atómica
    * Actualizar total\_questions en set
* \[ \] `GET /api/quizzes` \- Listar quizzes del teacher
    * Paginación
    * Filtros (materia, dificultad)
    * Include total\_questions
* \[ \] `GET /api/quizzes/:id` \- Detalle de quiz
    * Include questions \+ options
    * Include topics
    * Include estadísticas si ya se jugó
* \[ \] `PUT /api/quizzes/:id` \- Editar quiz
    * Solo teacher owner puede editar
* \[ \] `DELETE /api/quizzes/:id` \- Eliminar quiz
    * Solo si no hay games activos
* \[ \] `POST /api/quizzes/generate-from-pdf` \- Upload PDF
    * Multer middleware para file upload
    * Validar tipo de archivo (PDF only)
    * Límite de tamaño (10MB)
    * Procesar con IA
    * Retornar questions preview
    * Teacher puede revisar antes de guardar

#### **Upload de Archivos**

* \[ \] Configurar multer/busboy
* \[ \] Storage temporal para PDFs
* \[ \] Validación de archivos
* \[ \] Limpieza de archivos temporales
* \[ \] Rate limiting uploads (5 por hora)

#### **Testing Backend**

* \[ \] Tests de CRUD de quizzes
* \[ \] Tests de generación con IA (mock Claude API)
* \[ \] Tests de upload de archivos
* \[ \] Tests de permisos (teacher only)
* \[ \] Tests de validación de datos

### **🎨 Frontend Tasks**

#### **Dashboard Teacher**

* \[ \] Layout principal teacher
    * Sidebar con navegación
    * Header con perfil
* \[ \] Página "Mis Quizzes"
    * Listado con cards
    * Filtros (materia, fecha)
    * Búsqueda
    * Botón "Crear Quiz"
* \[ \] Modal/Página "Crear Quiz"
    * Step 1: Información básica
        * Nombre del quiz
        * Materia (dropdown)
        * Dificultad (selector)
        * Descripción
    * Step 2: Método de creación
        * Opción A: Upload PDF
        * Opción B: Manual
    * Step 3a (si PDF): Upload y preview
        * Drag & drop zone
        * Progress bar
        * Loading con spinner
        * Preview de preguntas generadas
        * Editar antes de guardar
    * Step 3b (si Manual): Editor de preguntas
        * Agregar pregunta
        * 4 opciones (marcar correcta)
        * Timer por pregunta
        * Preview en tiempo real

#### **Componentes Reutilizables**

* \[ \] QuestionCard component
    * Display pregunta \+ opciones
    * Highlight respuesta correcta
    * Acciones: Editar, Eliminar
* \[ \] PDFUploader component
    * Drag & drop
    * File validation
    * Progress indicator
* \[ \] QuizCard component
    * Thumbnail
    * Nombre, materia, \# preguntas
    * Fecha creación
    * Acciones: Ver, Editar, Eliminar, Iniciar Juego

#### **Estado y API**

\[ \] Quiz Store (Zustand)  
interface QuizStore {  quizzes: QuizSet\[\];  currentQuiz: QuizSet | null;  isLoading: boolean;  fetchQuizzes: () \=\> Promise\<void\>;  createQuiz: (data) \=\> Promise\<QuizSet\>;  generateFromPDF: (file) \=\> Promise\<Question\[\]\>;}

*
* \[ \] React Query hooks
    * useQuizzes()
    * useQuiz(id)
    * useCreateQuiz()
    * useGenerateFromPDF()

#### **Testing Frontend**

* \[ \] Tests de componentes
* \[ \] Tests de upload flow
* \[ \] Tests de creación manual
* \[ \] Tests de validación de formularios

### **✅ Criterios de Aceptación**

* \[ \] Teacher puede crear quiz manualmente (5+ preguntas)
* \[ \] Teacher puede subir PDF y obtener preguntas generadas
* \[ \] Preguntas generadas son editables antes de guardar
* \[ \] Teacher puede ver lista de sus quizzes
* \[ \] Teacher puede editar quiz existente
* \[ \] Teacher puede eliminar quiz (si no está en uso)
* \[ \] Validaciones funcionan (min 1 pregunta, 4 opciones, 1 correcta)
* \[ \] UI responsive y clara
* \[ \] Manejo de errores amigable
* \[ \] Loading states apropiados

### **📈 Métricas de Éxito**

* Teacher puede crear quiz en \<5 min (manual)
* Teacher puede crear quiz en \<2 min (PDF)
* 90%+ de PDFs procesados correctamente
* Tiempo de generación IA \<30 segundos
* 0 errores en producción

---