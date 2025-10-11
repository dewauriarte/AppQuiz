# **🚀 SPRINT ROADMAP \- Quiz Game Platform**

## **📋 Metodología y Estructura**

Este documento define el plan de desarrollo sprint por sprint para construir la plataforma de manera **ordenada, escalable y sin riesgos**. Cada sprint tiene una duración de **2 semanas** y sigue la metodología **Agile/Scrum**.

### **🎯 Principios de Desarrollo**

1. **Backend First**: Construir APIs sólidas antes que UI
2. **Incremental**: Cada sprint entrega valor funcional
3. **Testing Obligatorio**: No avanzar sin tests passing
4. **Deploy Continuo**: Cada sprint termina con deploy a staging
5. **Review & Retrospective**: Evaluar qué funcionó y qué mejorar

### **📊 Timeline General**

FASE 1: FUNDACIÓN (Sprints 1-3) → 6 semanas  
FASE 2: CORE FEATURES (Sprints 4-6) → 6 semanas    
FASE 3: GAMIFICACIÓN (Sprints 7-9) → 6 semanas  
FASE 4: REFINAMIENTO (Sprints 10-12) → 6 semanas  
TOTAL: \~6 meses hasta MVP \+ Gamificación completa

---

# **📅 FASE 1: FUNDACIÓN (Sprints 1-3)**

## **🔷 SPRINT 1: Setup y Autenticación (Semanas 1-2)**

### **🎯 Objetivos del Sprint**

* Configurar infraestructura base
* Sistema de autenticación funcional
* Base de datos operativa
* Deploy inicial

### **📦 Backend Tasks**

#### **Setup Inicial**

* \[*\] Inicializar proyecto Node.js \+ TypeScript
* \[*\] Configurar Express/Fastify
* \[*\] Setup Prisma \+ PostgreSQL connection
* \[*\] Configurar variables de entorno (.env)
* \[*\] Setup ESLint \+ Prettier
* \[*\] Configurar estructura de carpetas MVC

#### **Base de Datos**

* \[*\] Ejecutar schema SQL completo en PostgreSQL
* \[*\] Generar Prisma Client (`npx prisma generate`)
* \[*\] Crear migración inicial (`npx prisma migrate dev`)
* \[*\] Seed data básico (1 admin, 2 teachers, 5 students)
* \[*\] Verificar todas las tablas creadas correctamente

#### **Autenticación (RBAC)**

* \[*\] Implementar registro de usuarios
    * Endpoint: `POST /api/auth/register`
    * Validación con Zod
    * Hash de passwords con bcrypt
    * Verificación de edad (is\_minor flag)
* \[*\] Implementar login
    * Endpoint: `POST /api/auth/login`
    * Generación de JWT tokens
    * Refresh token strategy
* \[*\] Middleware de autenticación
    * Verificar JWT en requests protegidos
    * Extraer user\_id del token
* \[*\] Middleware de autorización (roles)
    * `requireAuth()`
    * `requireRole(['teacher', 'admin'])`
* \[*\] Endpoints de perfil
    * `GET /api/auth/me` (obtener usuario actual)
    * `PUT /api/auth/profile` (actualizar perfil básico)
* \[*\] Password reset flow básico
    * `POST /api/auth/forgot-password`
    * `POST /api/auth/reset-password`

#### **Testing Backend**

* \[*\] Setup Jest \+ Supertest
* \[*\] Tests de registro (casos exitosos y errores)
* \[*\] Tests de login (credenciales válidas/inválidas)
* \[*\] Tests de middleware de auth
* \[*\] Tests de RBAC (permisos por rol)
* \[*\] Coverage mínimo: 70%

### **🎨 Frontend Tasks**

#### **Setup Inicial**

* \[*\] Inicializar Vite \+ React \+ TypeScript
* \[*\] Configurar Tailwind CSS
* \[*\] Instalar y configurar shadcn/ui
* \[*\] Setup React Router v6
* \[*\] Configurar Zustand (auth store)
* \[*\] Setup TanStack Query
* \[*\] Configurar axios/fetch wrapper

#### **Páginas de Autenticación**

* \[*\] Página de Login
    * Formulario con React Hook Form \+ Zod
    * Validación client-side
    * Manejo de errores
    * Redirección según rol
* \[*\] Página de Registro
    * Formulario teacher/student
    * Selector de área/materia (teachers)
    * Age verification
    * Terms acceptance checkbox
* \[*\] Layout público (sin auth)
    * Header simple
    * Footer con links
* \[*\] Protected Route component
    * Verificar token en localStorage
    * Redirect a /login si no autenticado
* \[*\] Role-based Route component
    * Verificar rol del usuario
    * Mostrar 403 si no autorizado

#### **Estado Global**

\[*\] Auth Store (Zustand)  
interface AuthStore {  user: User | null;  token: string | null;  login: (credentials) \=\> Promise\<void\>;  register: (data) \=\> Promise\<void\>;  logout: () \=\> void;  isAuthenticated: boolean;  role: UserRole | null;}

*
* \[*\] API Client configurado con interceptors
    * Auto-incluir token en headers
    * Auto-refresh token si expira
    * Handle 401 errors

#### **Testing Frontend**

* \[*\] Setup Vitest \+ React Testing Library
* \[*\] Tests de componentes de auth
* \[*\] Tests de protected routes
* \[*\] Tests de auth store
* \[*\] Coverage mínimo: 60%

### **🚀 DevOps Tasks**

* \[+\] Setup Railway/Render para backend
* \[*\] Setup Vercel/Netlify para frontend
* \[*\] Configurar Redis (Upstash)
* \[*\] Setup Sentry para error tracking
* \[*\] Variables de entorno en producción
* \[*\] SSL/HTTPS configurado

### **✅ Criterios de Aceptación**

* \[*\] Usuario puede registrarse como teacher o student
* \[*\] Usuario puede hacer login y recibir token JWT
* \[*\] Token se guarda en localStorage/cookies
* \[*\] Protected routes funcionan correctamente
* \[*\] Teachers y students ven dashboards diferentes
* \[*\] Logout funciona y limpia sesión
* \[*\] Password reset flow funcional end-to-end
* \[*\] Todos los tests pasan (backend \+ frontend)
* \[*\] Deploy a staging exitoso
* \[*\] Documentación de API básica (endpoints, request/response)

### **📈 Métricas de Éxito**

* 100% endpoints de auth funcionando
* 0 errores críticos en producción
* Tiempo de respuesta API \<200ms
* Tests passing: 70%+ coverage backend, 60%+ frontend

### **⚠️ Riesgos y Mitigaciones**

| Riesgo | Probabilidad | Impacto | Mitigación |
| ----- | ----- | ----- | ----- |
| Problemas con setup de BD | Media | Alto | Tener docker-compose alternativo |
| JWT tokens expirados | Media | Medio | Implementar refresh token desde día 1 |
| CORS issues en deploy | Alta | Bajo | Configurar CORS correctamente en Express |

---