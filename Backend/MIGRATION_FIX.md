# 🔧 FIX PARA MIGRACIÓN - UUID Extension

## ❌ Problema

```
ERROR: no existe la función uuid_generate_v4()
HINT: Ninguna función coincide en el nombre y tipos de argumentos.
```

Este error ocurre porque PostgreSQL necesita tener habilitada la extensión UUID.

---

## ✅ Solución Rápida

### Opción 1: SQL Directo (Recomendado)

**1. Conectarte a tu base de datos PostgreSQL:**

```bash
# Usando psql
psql -U postgres -d quizapp_db

# O desde pgAdmin o cualquier cliente SQL
```

**2. Ejecutar estos comandos:**

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

**3. Verificar que se instalaron:**

```sql
\dx
```

Deberías ver `uuid-ossp` y `pgcrypto` en la lista.

**4. Ahora ejecutar la migración:**

```bash
npx prisma migrate dev --name init_class_lists
```

---

### Opción 2: Script Automatizado

**1. Crear archivo SQL temporal:**

Ya está creado en: `Backend/prisma/migrations/enable_uuid_extension.sql`

**2. Ejecutarlo:**

```bash
# Windows (PowerShell)
$env:PGPASSWORD="tu_password"; psql -U postgres -d quizapp_db -f "prisma/migrations/enable_uuid_extension.sql"

# Linux/Mac
PGPASSWORD=tu_password psql -U postgres -d quizapp_db -f prisma/migrations/enable_uuid_extension.sql
```

**3. Luego ejecutar la migración:**

```bash
npx prisma migrate dev --name init_class_lists
```

---

### Opción 3: Usar pgAdmin

1. Abrir pgAdmin
2. Conectar a `quizapp_db`
3. Click derecho en la base de datos → Query Tool
4. Copiar y ejecutar:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

5. Verificar en Extensions (debajo de la base de datos)
6. Ejecutar la migración desde la terminal

---

## 🔍 Verificación

Después de habilitar las extensiones, verifica:

```sql
-- Verificar extensiones
SELECT * FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto');

-- Probar generación de UUID
SELECT gen_random_uuid();
SELECT uuid_generate_v4();
```

Ambas consultas deberían devolver UUIDs válidos.

---

## 📝 Notas

- Estas extensiones son **seguras** y estándar en PostgreSQL
- Solo necesitas ejecutar esto **UNA VEZ** por base de datos
- La extensión `pgcrypto` proporciona `gen_random_uuid()` (más moderna)
- La extensión `uuid-ossp` proporciona `uuid_generate_v4()` (legacy)

---

## 🚀 Siguiente Paso

Una vez habilitadas las extensiones, ejecuta:

```bash
cd Backend
npx prisma migrate dev --name init_class_lists
npx prisma generate
npm run dev
```

---

## ⚠️ Si sigues teniendo problemas

**Error de permisos:**
```sql
-- Como superusuario (postgres)
ALTER DATABASE quizapp_db OWNER TO postgres;
GRANT ALL PRIVILEGES ON DATABASE quizapp_db TO postgres;
```

**Base de datos no existe:**
```sql
CREATE DATABASE quizapp_db;
```

**Usuario no tiene permisos:**
```sql
-- Conectar como postgres (superuser)
GRANT CREATE ON DATABASE quizapp_db TO tu_usuario;
```

