# 🗄️ Database Setup Guide

## Opción 1: Usar el Schema SQL Existente

```bash
# 1. Crear base de datos
createdb appquiz_db

# 2. Ejecutar el schema SQL completo
psql -d appquiz_db -f ../db/appquiz_db.sql

# 3. Verificar tablas creadas
psql -d appquiz_db -c "\dt"
```

## Opción 2: Usar Prisma Migrate (Recomendado)

```bash
# 1. Configurar DATABASE_URL en .env
DATABASE_URL="postgresql://user:password@localhost:5432/appquiz_db?schema=public"

# 2. Generar Prisma Client
npm run prisma:generate

# 3. Crear migración inicial
npm run prisma:migrate

# 4. Seed data (usuarios de prueba)
npm run db:seed
```

## Usuarios de Prueba (después del seed)

| Username | Password | Role |
|----------|----------|------|
| admin | password123 | admin |
| teacher1 | password123 | teacher |
| student1 | password123 | student |

## Verificar Conexión

```bash
# Abrir Prisma Studio
npm run prisma:studio

# O conectar con psql
psql -d appquiz_db
```

## Base de Datos de Prueba

Para testing, crea una BD separada:

```bash
createdb appquiz_test
```

Luego actualiza `.env.test` con la URL correcta.

## Troubleshooting

### Error: Database does not exist
```bash
createdb appquiz_db
```

### Error: role does not exist
```bash
createuser -s youruser
```

### Error: Prisma schema out of sync
```bash
npm run prisma:generate
npm run prisma:migrate
```

