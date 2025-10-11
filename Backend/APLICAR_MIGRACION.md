# 🚀 GUÍA COMPLETA - Aplicar Migración de Class Lists

## ✅ PROBLEMA RESUELTO

Los dos problemas han sido arreglados:

1. ✅ **Backend ahora acepta archivos Excel** (.xlsx, .xls)
2. ✅ **Modal tiene estilos correctos** (Dialog component)

---

## 📋 PASOS PARA APLICAR LA MIGRACIÓN

### **Opción 1: DB Push (MÁS RÁPIDO - RECOMENDADO)**

Ejecuta estos comandos en PowerShell desde la carpeta Backend:

```powershell
# 1. Detener el servidor si está corriendo (Ctrl+C)

# 2. Ir a la carpeta Backend
cd C:\appquiz\backend

# 3. Sincronizar schema con la base de datos
npx prisma db push

# 4. Generar cliente Prisma
npx prisma generate

# 5. Reiniciar el servidor
npm run dev
```

**¡Eso es todo! ✨**

---

### **Opción 2: Migrate Deploy (Si prefieres migraciones tradicionales)**

```powershell
# 1. Detener el servidor (Ctrl+C)

# 2. Ir a la carpeta Backend
cd C:\appquiz\backend

# 3. Crear la migración
npx prisma migrate dev --create-only --name add_class_lists

# 4. Aplicar con deploy
npx prisma migrate deploy

# 5. Generar cliente
npx prisma generate

# 6. Reiniciar servidor
npm run dev
```

---

## ✅ VERIFICACIÓN

### **1. Verificar Tablas Creadas**

```sql
-- En PostgreSQL (psql)
\dt

-- Deberías ver:
-- class_lists
-- class_list_students
```

### **2. Verificar en Prisma Studio**

```powershell
npx prisma studio
```

Deberías ver las nuevas tablas `class_lists` y `class_list_students`.

---

## 🎯 CAMBIOS APLICADOS

### Backend

✅ **`multer.ts`** - Configuración actualizada:
- `uploadPDF` - Para archivos PDF (AI Generator)
- `uploadExcel` - Para archivos Excel (Import Students)

✅ **`classList.routes.ts`** - Usa `uploadExcel` para importación

### Tipos MIME Aceptados para Excel:
- `application/vnd.ms-excel` (.xls)
- `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` (.xlsx)
- `application/vnd.oasis.opendocument.spreadsheet` (.ods)

---

## 🧪 PROBAR EL SISTEMA

### **1. Crear Lista Manual**

```
1. Login como teacher
2. Ir a Dashboard → "Mis Listas"
3. Click "Nueva Lista"
4. Completar formulario
5. Guardar
```

### **2. Importar desde Excel**

```
1. Ir a "Mis Listas"
2. Click "Importar Excel"
3. Crear archivo Excel con columnas:
   - Nombre (obligatorio)
   - Apellido (obligatorio)
   - Username (opcional)
   - Email (opcional)
   - Nickname (opcional)
4. Arrastrar archivo o click para seleccionar
5. Completar nombre de lista
6. Click "Importar"
```

**Ejemplo de Excel:**

| Nombre | Apellido | Username | Email | Nickname |
|--------|----------|----------|-------|----------|
| Juan | Pérez | juan.perez | juan@example.com | Juanito |
| María | García | | maria@example.com | Mari |
| Pedro | López | pedro.lopez | | |

### **3. Agregar Estudiante Individual**

```
1. Entrar a una lista
2. Click "Agregar"
3. Escribir username del estudiante
4. (Opcional) Agregar nickname
5. Click "Agregar"
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "Only PDF files are allowed"**

✅ **RESUELTO** - El backend ahora acepta Excel con `uploadExcel`

### **Error: "no existe la función uuid_generate_v4()"**

**Solución:**
```sql
-- En PostgreSQL
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Luego ejecutar `npx prisma db push`

### **Error: Modal sin estilos**

✅ **RESUELTO** - El componente Dialog ya está correctamente instalado

Si aún no se ven los estilos, verifica que Tailwind CSS esté compilando:
```powershell
cd Frontend
npm run dev
```

---

## 📊 ESTRUCTURA DE TABLAS

### `class_lists`
```sql
list_id       SERIAL PRIMARY KEY
teacher_id    INTEGER (FK users)
name          VARCHAR(100)
grade_level   VARCHAR(50)
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### `class_list_students`
```sql
list_id    INTEGER (FK class_lists)
user_id    INTEGER (FK users)
nickname   VARCHAR(50)
added_at   TIMESTAMP
PRIMARY KEY (list_id, user_id)
```

---

## 🎯 RESUMEN DE ENDPOINTS

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/lists` | Crear lista |
| GET | `/api/lists` | Listar listas |
| GET | `/api/lists/:id` | Ver lista con estudiantes |
| PUT | `/api/lists/:id` | Actualizar lista |
| DELETE | `/api/lists/:id` | Eliminar lista |
| POST | `/api/lists/:id/students` | Agregar estudiantes |
| DELETE | `/api/lists/:id/students/:userId` | Remover estudiante |
| POST | `/api/lists/import-excel` | **Importar desde Excel** |
| GET | `/api/auth/search-user` | Buscar usuario |

---

## ✨ ¡LISTO!

Después de aplicar la migración:

1. ✅ Backend acepta archivos Excel
2. ✅ Tablas de class_lists creadas
3. ✅ Modal con estilos correctos
4. ✅ Sistema completo de gestión de listas funcionando

**¡A PROBAR!** 🎉

