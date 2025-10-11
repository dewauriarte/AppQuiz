# Class Lists API Documentation

API para gestionar listas de estudiantes (Class Lists) para profesores.

## Base URL
```
http://localhost:4000/api/v1/lists
```

## Autenticación
Todos los endpoints requieren autenticación JWT y rol de `teacher` o `admin`.

Header: `Authorization: Bearer <token>`

---

## 📋 Endpoints

### 1. Crear Lista

**POST** `/api/v1/lists`

Crea una nueva lista de clase.

#### Request Body
```json
{
  "name": "Matemáticas 10A",
  "grade_level": "10mo Grado"
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "Class list created successfully",
  "data": {
    "list_id": 1,
    "teacher_id": 2,
    "name": "Matemáticas 10A",
    "grade_level": "10mo Grado",
    "created_at": "2025-01-15T10:00:00Z",
    "updated_at": "2025-01-15T10:00:00Z",
    "teacher": {
      "user_id": 2,
      "username": "teacher1",
      "display_name": "Prof. García"
    },
    "_count": {
      "class_list_students": 0
    }
  }
}
```

---

### 2. Listar Listas

**GET** `/api/v1/lists`

Lista todas las listas del profesor autenticado.

#### Query Parameters
- `page` (number, opcional): Número de página (default: 1)
- `limit` (number, opcional): Items por página (default: 20)
- `search` (string, opcional): Búsqueda por nombre o grado

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "list_id": 1,
      "name": "Matemáticas 10A",
      "grade_level": "10mo Grado",
      "created_at": "2025-01-15T10:00:00Z",
      "teacher": {
        "user_id": 2,
        "username": "teacher1",
        "display_name": "Prof. García"
      },
      "_count": {
        "class_list_students": 25
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

---

### 3. Ver Detalle de Lista

**GET** `/api/v1/lists/:id`

Obtiene una lista específica con todos sus estudiantes.

#### Response (200)
```json
{
  "success": true,
  "data": {
    "list_id": 1,
    "name": "Matemáticas 10A",
    "grade_level": "10mo Grado",
    "teacher_id": 2,
    "created_at": "2025-01-15T10:00:00Z",
    "teacher": {
      "user_id": 2,
      "username": "teacher1",
      "display_name": "Prof. García"
    },
    "class_list_students": [
      {
        "list_id": 1,
        "user_id": 10,
        "nickname": "Juanito",
        "added_at": "2025-01-15T10:30:00Z",
        "student": {
          "user_id": 10,
          "username": "juan.perez",
          "display_name": "Juan Pérez",
          "email": "juan@example.com"
        }
      }
    ]
  }
}
```

---

### 4. Actualizar Lista

**PUT** `/api/v1/lists/:id`

Actualiza el nombre o grado de una lista.

#### Request Body
```json
{
  "name": "Matemáticas 10A - Actualizado",
  "grade_level": "10mo"
}
```

#### Response (200)
```json
{
  "success": true,
  "message": "Class list updated successfully",
  "data": {
    ...
  }
}
```

---

### 5. Eliminar Lista

**DELETE** `/api/v1/lists/:id`

Elimina una lista y todos sus estudiantes asociados.

#### Response (200)
```json
{
  "success": true,
  "message": "Class list deleted successfully"
}
```

---

### 6. Agregar Estudiantes

**POST** `/api/v1/lists/:id/students`

Agrega estudiantes existentes a una lista.

#### Request Body
```json
{
  "students": [
    {
      "user_id": 10,
      "nickname": "Juanito"
    },
    {
      "user_id": 11,
      "nickname": "Mari"
    }
  ]
}
```

#### Response (201)
```json
{
  "success": true,
  "message": "2 student(s) added to list",
  "data": [
    {
      "list_id": 1,
      "user_id": 10,
      "nickname": "Juanito",
      "added_at": "2025-01-15T11:00:00Z",
      "student": {
        "user_id": 10,
        "username": "juan.perez",
        "display_name": "Juan Pérez"
      }
    }
  ]
}
```

---

### 7. Ver Estudiantes de una Lista

**GET** `/api/v1/lists/:id/students`

Obtiene todos los estudiantes de una lista específica.

#### Response (200)
```json
{
  "success": true,
  "data": [
    {
      "list_id": 1,
      "user_id": 10,
      "nickname": "Juanito",
      "added_at": "2025-01-15T10:30:00Z",
      "student": {
        "user_id": 10,
        "username": "juan.perez",
        "display_name": "Juan Pérez",
        "email": "juan@example.com",
        "created_at": "2025-01-01T00:00:00Z"
      }
    }
  ]
}
```

---

### 8. Remover Estudiante

**DELETE** `/api/v1/lists/:id/students/:userId`

Remueve un estudiante de la lista.

#### Response (200)
```json
{
  "success": true,
  "message": "Student removed from list successfully"
}
```

---

### 9. Importar desde Excel

**POST** `/api/v1/lists/import-excel`

Importa estudiantes desde un archivo Excel.

#### Content-Type
`multipart/form-data`

#### Form Data
- `file` (file): Archivo Excel (.xlsx, .xls)
- `list_name` (string): Nombre de la lista a crear
- `grade_level` (string, opcional): Grado o nivel
- `auto_create_users` (boolean, opcional): Crear usuarios si no existen (default: true)

#### Formato del Excel
El archivo debe tener las siguientes columnas:

| Nombre (requerido) | Apellido (requerido) | Username (opcional) | Email (opcional) | Nickname (opcional) |
|--------------------|---------------------|---------------------|------------------|---------------------|
| Juan               | Pérez               | juan.perez          | juan@mail.com    | Juanito            |
| María              | García              |                     | maria@mail.com   |                    |

**Notas:**
- Las columnas pueden estar en español o inglés
- Si no se proporciona `username`, se genera automáticamente: `nombre.apellido`
- Si `auto_create_users` es `true`, se crean los usuarios que no existen con contraseña temporal `Student123!`
- Los estudiantes existentes se agregan a la lista si no están ya

#### Response (201)
```json
{
  "success": true,
  "message": "Students imported successfully",
  "data": {
    "classList": {
      "list_id": 5,
      "name": "Matemáticas 10A",
      "grade_level": "10mo",
      "teacher_id": 2,
      "created_at": "2025-01-15T12:00:00Z"
    },
    "studentsAdded": 25,
    "studentsCreated": 20,
    "errors": [],
    "details": [
      {
        "user_id": 10,
        "username": "juan.perez",
        "display_name": "Juan Pérez",
        "was_created": true
      }
    ]
  }
}
```

---

## 🔒 Permisos

| Endpoint | Teacher (propietario) | Teacher (otro) | Admin |
|----------|----------------------|----------------|-------|
| Crear lista | ✅ | ✅ | ✅ |
| Ver listas propias | ✅ | ✅ | ✅ |
| Ver todas las listas | ❌ | ❌ | ✅ |
| Editar lista | ✅ | ❌ | ✅ |
| Eliminar lista | ✅ | ❌ | ✅ |
| Agregar estudiantes | ✅ | ❌ | ✅ |
| Remover estudiantes | ✅ | ❌ | ✅ |
| Importar Excel | ✅ | ✅ | ✅ |

---

## ⚠️ Errores Comunes

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "name",
      "message": "El nombre debe tener al menos 3 caracteres"
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
  "message": "Class list not found"
}
```

---

## 📝 Ejemplos de Uso

### Curl: Crear Lista
```bash
curl -X POST http://localhost:4000/api/v1/lists \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Matemáticas 10A",
    "grade_level": "10mo Grado"
  }'
```

### Curl: Importar Excel
```bash
curl -X POST http://localhost:4000/api/v1/lists/import-excel \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@students.xlsx" \
  -F "list_name=Matemáticas 10A" \
  -F "grade_level=10mo" \
  -F "auto_create_users=true"
```

### Curl: Agregar Estudiantes
```bash
curl -X POST http://localhost:4000/api/v1/lists/1/students \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "students": [
      {"user_id": 10, "nickname": "Juanito"},
      {"user_id": 11}
    ]
  }'
```

---

## ✅ Estado de Implementación

- [x] POST /api/v1/lists - Crear lista ✅
- [x] GET /api/v1/lists - Listar listas ✅
- [x] GET /api/v1/lists/:id - Ver detalle ✅
- [x] PUT /api/v1/lists/:id - Actualizar ✅
- [x] DELETE /api/v1/lists/:id - Eliminar ✅
- [x] POST /api/v1/lists/:id/students - Agregar estudiantes ✅
- [x] GET /api/v1/lists/:id/students - Ver estudiantes ✅
- [x] DELETE /api/v1/lists/:id/students/:userId - Remover estudiante ✅
- [x] POST /api/v1/lists/import-excel - Importar Excel ✅

**Backend completado al 100%** ✅

