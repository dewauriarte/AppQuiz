# Question Sets CRUD API Documentation

## 📋 Endpoints Implementados

Todos los endpoints requieren autenticación mediante JWT token en el header `Authorization: Bearer <token>`.

### Base URL
```
http://localhost:4000/api/v1/question-sets
```

---

## 🔷 1. Crear Question Set

**POST** `/api/v1/question-sets`

Crea un nuevo quiz con sus preguntas y opciones de respuesta.

### Permisos
- ✅ Teachers
- ✅ Admins
- ❌ Students

### Request Body
```json
{
  "title": "Quiz de Biología - Fotosíntesis",
  "description": "Quiz sobre el proceso de fotosíntesis en plantas",
  "subject_area": "Biología",
  "grade_level": "10mo Grado",
  "difficulty": "medium",
  "is_public": false,
  "tags": ["biología", "plantas", "fotosíntesis"],
  "questions": [
    {
      "question_text": "¿Cuál es el pigmento principal en la fotosíntesis?",
      "question_type": "multiple_choice",
      "difficulty": "medium",
      "bloom_level": 2,
      "time_limit": 30,
      "points": 100,
      "explanation": "La clorofila es el pigmento verde que captura la luz solar.",
      "options": [
        {
          "option_text": "Clorofila",
          "is_correct": true,
          "explanation": "Correcto, la clorofila es el pigmento principal."
        },
        {
          "option_text": "Caroteno",
          "is_correct": false,
          "explanation": "El caroteno es un pigmento secundario."
        },
        {
          "option_text": "Xantofila",
          "is_correct": false
        },
        {
          "option_text": "Melanina",
          "is_correct": false
        }
      ]
    }
  ]
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "Question set created successfully",
  "data": {
    "set_id": 1,
    "title": "Quiz de Biología - Fotosíntesis",
    "description": "Quiz sobre el proceso de fotosíntesis en plantas",
    "subject": "Biología",
    "grade_level": "10mo Grado",
    "difficulty": "medium",
    "is_public": false,
    "tags": ["biología", "plantas", "fotosíntesis"],
    "teacher_id": 2,
    "total_questions": 1,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T10:30:00Z",
    "questions": [...],
    "users": {
      "user_id": 2,
      "username": "teacher1",
      "display_name": "Prof. García"
    }
  }
}
```

---

## 🔷 2. Agregar Preguntas a un Set Existente

**POST** `/api/v1/question-sets/:id/questions`

Agrega nuevas preguntas a un question set ya creado.

### Permisos
- ✅ Teacher propietario
- ✅ Admins
- ❌ Otros teachers
- ❌ Students

### Request Body
```json
{
  "questions": [
    {
      "question_text": "¿En qué orgánulo ocurre la fotosíntesis?",
      "question_type": "multiple_choice",
      "difficulty": "medium",
      "bloom_level": 2,
      "time_limit": 25,
      "points": 100,
      "explanation": "Los cloroplastos son los orgánulos donde ocurre la fotosíntesis.",
      "options": [
        {
          "option_text": "Cloroplastos",
          "is_correct": true
        },
        {
          "option_text": "Mitocondrias",
          "is_correct": false
        },
        {
          "option_text": "Ribosomas",
          "is_correct": false
        },
        {
          "option_text": "Núcleo",
          "is_correct": false
        }
      ]
    }
  ]
}
```

### Response (201 Created)
```json
{
  "success": true,
  "message": "2 questions added successfully",
  "data": {
    "createdQuestions": [...],
    "updatedSet": {
      "set_id": 1,
      "total_questions": 3,
      "updated_at": "2025-01-15T11:00:00Z"
    }
  }
}
```

---

## 🔷 3. Listar Question Sets

**GET** `/api/v1/question-sets`

Lista todos los question sets con filtros opcionales.

### Permisos
- ✅ Teachers (solo ven sus propios sets)
- ✅ Admins (ven todos)

### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `page` | integer | No | Número de página (default: 1) |
| `limit` | integer | No | Items por página (default: 20, max: 100) |
| `search` | string | No | Búsqueda por título o descripción |
| `subjectArea` | string | No | Filtrar por materia |
| `difficulty` | string | No | `easy`, `medium`, `hard` |
| `isPublic` | boolean | No | Filtrar por público/privado |
| `teacherId` | integer | No | Solo para admins: filtrar por teacher |

### Ejemplo Request
```
GET /api/v1/question-sets?page=1&limit=12&difficulty=medium&search=fotosíntesis
```

### Response (200 OK)
```json
{
  "success": true,
  "data": [
    {
      "set_id": 1,
      "title": "Quiz de Biología - Fotosíntesis",
      "description": "Quiz sobre el proceso de fotosíntesis en plantas",
      "subject": "Biología",
      "grade_level": "10mo Grado",
      "difficulty": "medium",
      "is_public": false,
      "total_questions": 10,
      "created_at": "2025-01-15T10:30:00Z",
      "users": {
        "user_id": 2,
        "username": "teacher1",
        "display_name": "Prof. García"
      },
      "_count": {
        "questions": 10
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 25,
    "pages": 3
  }
}
```

---

## 🔷 4. Obtener Detalle de Question Set

**GET** `/api/v1/question-sets/:id`

Obtiene todos los detalles de un question set incluyendo todas sus preguntas y opciones.

### Permisos
- ✅ Teacher propietario
- ✅ Admins
- ✅ Cualquier usuario si el set es público
- ❌ Otros usuarios si el set es privado

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "set_id": 1,
    "title": "Quiz de Biología - Fotosíntesis",
    "description": "Quiz sobre el proceso de fotosíntesis en plantas",
    "subject": "Biología",
    "grade_level": "10mo Grado",
    "difficulty": "medium",
    "is_public": false,
    "tags": ["biología", "plantas", "fotosíntesis"],
    "total_questions": 10,
    "created_at": "2025-01-15T10:30:00Z",
    "updated_at": "2025-01-15T11:00:00Z",
    "teacher_id": 2,
    "questions": [
      {
        "question_id": 1,
        "question_text": "¿Cuál es el pigmento principal en la fotosíntesis?",
        "question_type": "multiple_choice",
        "difficulty": 5,
        "bloom_taxonomy_level": "Level 2",
        "time_limit": 30,
        "points": 100,
        "explanation": "La clorofila es el pigmento verde que captura la luz solar.",
        "order_index": 0,
        "question_options": [
          {
            "option_id": 1,
            "option_text": "Clorofila",
            "is_correct": true,
            "explanation": "Correcto, la clorofila es el pigmento principal.",
            "position": 0
          },
          {
            "option_id": 2,
            "option_text": "Caroteno",
            "is_correct": false,
            "explanation": "El caroteno es un pigmento secundario.",
            "position": 1
          }
        ]
      }
    ],
    "users": {
      "user_id": 2,
      "username": "teacher1",
      "display_name": "Prof. García"
    }
  }
}
```

---

## 🔷 5. Actualizar Question Set

**PUT** `/api/v1/question-sets/:id`

Actualiza la información básica de un question set (no las preguntas).

### Permisos
- ✅ Teacher propietario
- ✅ Admins

### Request Body
```json
{
  "title": "Quiz de Biología - Fotosíntesis (Actualizado)",
  "description": "Quiz completo sobre fotosíntesis",
  "difficulty": "hard",
  "is_public": true,
  "tags": ["biología", "plantas", "fotosíntesis", "secundaria"]
}
```

### Response (200 OK)
```json
{
  "success": true,
  "message": "Question set updated successfully",
  "data": {
    "set_id": 1,
    "title": "Quiz de Biología - Fotosíntesis (Actualizado)",
    "description": "Quiz completo sobre fotosíntesis",
    "difficulty": "hard",
    "is_public": true,
    "updated_at": "2025-01-15T12:00:00Z",
    ...
  }
}
```

---

## 🔷 6. Eliminar Question Set

**DELETE** `/api/v1/question-sets/:id`

Elimina un question set (soft delete).

### Permisos
- ✅ Teacher propietario
- ✅ Admins

### Response (200 OK)
```json
{
  "success": true,
  "message": "Question set deleted successfully"
}
```

---

## 🔷 7. Duplicar Question Set

**POST** `/api/v1/question-sets/:id/duplicate`

Crea una copia completa de un question set con todas sus preguntas.

### Permisos
- ✅ Todos los teachers (pueden duplicar cualquier set público o su propio set)
- ✅ Admins

### Response (201 Created)
```json
{
  "success": true,
  "message": "Question set duplicated successfully",
  "data": {
    "set_id": 15,
    "title": "Quiz de Biología - Fotosíntesis (Copy)",
    "teacher_id": 3,
    "is_public": false,
    "total_questions": 10,
    ...
  }
}
```

---

## 🔷 8. Obtener Estadísticas

**GET** `/api/v1/question-sets/:id/stats`

Obtiene estadísticas del question set.

### Permisos
- ✅ Teacher propietario
- ✅ Admins

### Response (200 OK)
```json
{
  "success": true,
  "data": {
    "totalQuestions": 10,
    "difficultyCount": {
      "easy": 2,
      "medium": 6,
      "hard": 2
    },
    "avgTimeLimit": 28,
    "avgPoints": 100,
    "estimatedDuration": 280
  }
}
```

---

## 🎯 Campos de Difficulty

### En el Question Set:
- `easy` - Fácil
- `medium` - Medio
- `hard` - Difícil

### En las Questions (numérico):
- `1-3` - Fácil
- `4-6` - Medio
- `7-10` - Difícil

---

## ⚠️ Errores Comunes

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "You do not have permission to access this resource"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Question set not found"
}
```

---

## 📊 Ejemplos de Uso

### 1. Crear un quiz completo
```bash
curl -X POST http://localhost:4000/api/v1/question-sets \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi Quiz",
    "subject_area": "Matemáticas",
    "difficulty": "medium",
    "questions": [...]
  }'
```

### 2. Listar mis quizzes
```bash
curl -X GET "http://localhost:4000/api/v1/question-sets?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Ver detalles de un quiz
```bash
curl -X GET http://localhost:4000/api/v1/question-sets/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Agregar preguntas a un quiz existente
```bash
curl -X POST http://localhost:4000/api/v1/question-sets/1/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questions": [...]
  }'
```

---

## ✅ Estado de Implementación (Sprint 2)

- [x] `POST /api/quizzes` - Crear quiz ✅
- [x] `POST /api/quizzes/:id/questions` - Agregar preguntas ✅
- [x] `GET /api/quizzes` - Listar quizzes del teacher ✅
- [x] `GET /api/quizzes/:id` - Detalle de quiz ✅
- [x] `PUT /api/quizzes/:id` - Editar quiz ✅
- [x] `DELETE /api/quizzes/:id` - Eliminar quiz ✅
- [x] `POST /api/quizzes/:id/duplicate` - Duplicar quiz ✅ (EXTRA)
- [x] `GET /api/quizzes/:id/stats` - Estadísticas ✅ (EXTRA)

## 🎨 Páginas Frontend Implementadas

- [x] `/question-sets` - Listado de quizzes ✅
- [x] `/question-sets/:id` - Detalle del quiz ✅
- [x] `/question-sets/create` - Crear quiz manual ✅
- [x] `/question-sets/:id/edit` - Editar quiz ✅

---

## 🎮 Características de las Páginas Frontend

### 📝 Crear Quiz Manual (`/question-sets/create`)
- ✅ Formulario completo con validación
- ✅ Agregar múltiples preguntas con opciones
- ✅ Marcar respuestas correctas
- ✅ Configurar dificultad, tiempo y puntos por pregunta
- ✅ Agregar/eliminar opciones dinámicamente
- ✅ Acordeón para expandir/contraer preguntas
- ✅ Diseño RPG/Gaming con animaciones

### ✏️ Editar Quiz (`/question-sets/:id/edit`)
- ✅ Carga automática de datos existentes
- ✅ Edición de información básica (título, descripción, dificultad, etc.)
- ✅ Vista de estadísticas actuales
- ✅ Control de visibilidad (público/privado)
- ✅ Diseño RPG/Gaming con gradientes dinámicos

### 📋 Listado de Quizzes (`/question-sets`)
- ✅ Grid responsivo con cards
- ✅ Búsqueda por título/descripción
- ✅ Filtros por dificultad
- ✅ Paginación
- ✅ Acciones: Ver, Editar, Copiar, Borrar
- ✅ Badges informativos (dificultad, cantidad de preguntas, visibilidad)

### 👁️ Detalle de Quiz (`/question-sets/:id`)
- ✅ Vista completa de todas las preguntas
- ✅ Acordeón para expandir/contraer preguntas
- ✅ Estadísticas del quiz (tiempo total, promedio de puntos, etc.)
- ✅ Badges de dificultad y configuración
- ✅ Botones para editar y jugar

