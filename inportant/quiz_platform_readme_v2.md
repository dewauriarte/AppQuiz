# **🎮 Quiz Game Platform - Plataforma Educativa Gamificada**

## **📋 Descripción**

Plataforma de quiz educativa **altamente gamificada** en tiempo real que combina lo mejor de **Kahoot**, **Duolingo** y **Roblox**. Permite a profesores crear conjuntos de preguntas usando IA y a estudiantes participar en partidas multijugador con elementos de juego como tableros de progresión, economía virtual (monedas/gemas), sistema de mascotas, rachas diarias y logros desbloqueables.

### **🎯 Ventajas Competitivas**

* ✅ **Engagement 3x mayor** mediante gamificación white-hat + black-hat balanceada (70/30)
* ✅ **Retención D30 del 10-15%** vs 2.6% promedio industria
* ✅ **Aprendizaje adaptativo** personalizado por estudiante
* ✅ **Economía virtual** robusta con múltiples monedas
* ✅ **Seguridad infantil** nivel Roblox (COPPA/GDPR compliant)
* ✅ **Arquitectura escalable** desde 100 a 500 jugadores concurrentes
* ✅ **Generación de quizzes con IA** desde PDFs y documentos

---

## **🗂️ Arquitectura del Sistema**

### **🗃️ Decisión Arquitectónica: Monolito Modular**

**Por qué**: Empezamos con monolito modular (siguiendo el modelo de Kahoot) para:

* ✅ Desarrollo rápido y simple deployment
* ✅ Facilidad de testing y debugging
* ✅ Bajo overhead operacional
* ✅ Migración gradual a microservicios cuando >1M usuarios

**Preparado para escalar** a microservicios cuando sea necesario (>1M users, >40 engineers, múltiples regiones).

### **📁 Estructura de Directorios**

```
Backend/
├── 📂 src/
│   ├── 📂 config/              # Configuraciones (DB, servicios externos)
│   ├── 📂 controllers/         # Controladores por dominio
│   │   ├── AuthController.js
│   │   ├── GameController.js
│   │   ├── ShopController.js
│   │   ├── QuizController.js
│   │   ├── AIController.js
│   │   └── ...
│   ├── 📂 middleware/          # Auth, validación, CORS, rate limiting
│   ├── 📂 models/              # Modelos Prisma (schema.prisma)
│   ├── 📂 routes/              # Definición de rutas por módulo
│   ├── 📂 services/            # Lógica de negocio
│   │   ├── GameService.js      # Motor de juego
│   │   ├── SocketService.js    # WebSockets
│   │   ├── AIService.js        # Generación con IA
│   │   ├── EconomyService.js   # Economía virtual
│   │   └── AdaptiveLearningService.js
│   ├── 📂 utils/               # Helpers y utilidades
│   ├── app.js                  # Configuración Express
│   └── server.js               # Entry point
├── 📂 prisma/
│   ├── schema.prisma           # Schema de base de datos
│   └── migrations/             # Migraciones
├── 📂 generated/               # Cliente Prisma generado
├── package.json
├── .env
└── README.md

Frontend/
├── 📂 public/
│   ├── 📂 lottie/              # Animaciones Lottie
│   ├── 📂 rive/                # Animaciones Rive (mascotas avanzadas) 🆕
│   ├── 📂 sprites/             # Sprites mascotas/items
│   ├── 📂 sounds/              # Efectos de sonido 🆕
│   └── 📂 models/              # Modelos 3D (opcional) 🆕
├── 📂 src/
│   ├── 📂 components/
│   │   ├── 📂 ui/              # shadcn/ui components
│   │   ├── 📂 game/            # Componentes de juego
│   │   ├── 📂 pets/            # Sistema de mascotas
│   │   │   ├── 📂 renderers/  # Diferentes tipos de render 🆕
│   │   │   │   ├── Sprite2DPet.tsx    # CSS sprites (common)
│   │   │   │   ├── LottiePet.tsx      # Lottie (uncommon)
│   │   │   │   ├── RivePet.tsx        # Rive (rare/epic) 🆕
│   │   │   │   └── ThreeDPet.tsx      # 3D (legendary) 🆕
│   │   │   ├── PetCard.tsx
│   │   │   ├── PetEvolutionAnimation.tsx
│   │   │   └── PetAbilityIndicator.tsx
│   │   ├── 📂 shop/            # Tienda virtual
│   │   ├── 📂 effects/         # Efectos visuales y partículas
│   │   └── 📂 audio/           # Audio manager 🆕
│   ├── 📂 pages/               # Páginas/Rutas
│   ├── 📂 hooks/               # Custom hooks
│   ├── 📂 store/               # Zustand stores
│   ├── 📂 lib/                 # Configuraciones
│   ├── 📂 animations/          # Configs de animaciones
│   └── 📂 types/               # TypeScript types
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

---

## **📦 Stack Tecnológico Completo**

### **🔧 Backend Stack**

**Core**:
* **Node.js 20 LTS** + **TypeScript 5.x**
* **Express 4.x** o **Fastify 4.x** (framework web)
* **Prisma 5.x** (ORM)
* **PostgreSQL 15** (base de datos principal)
* **Redis 7.x** (caché, sessions, pub/sub)

**Tiempo Real**:
* **Socket.IO 4.x** (WebSockets)
  * Redis adapter para scaling horizontal
  * Namespaces por juego, rooms por sesión
  * MessagePack para protocolo binario

**Integración IA**:
* **Anthropic Claude API** (Generación de preguntas desde PDFs)
* **PDF parsing** (pdf-parse)
* **Text extraction** para procesamiento de documentos

**Procesamiento de Archivos**: 🆕
* **Sharp** (optimización de imágenes)
* **pdf-parse** (extracción de texto)

**Seguridad y Middleware**: 🆕
* **helmet** (security headers)
* **express-rate-limit** (rate limiting)
* **compression** (gzip compression)
* **cors** (CORS handling)
* **express-validator** (validación adicional)

**Validación y Testing**:
* **Zod** (validación de schemas)
* **Jest + Supertest** (testing)
* **Playwright** (E2E testing) 🆕

**Monitoreo**: 🆕
* **Sentry** (error tracking + performance)
* **@sentry/profiling-node** (profiling)

**Infraestructura**:
* **Railway / Render** (deployment simple y económico)
* **Cloudflare R2 / S3** (storage de assets)
* **GitHub Actions** (CI/CD)
* **Betterstack** (uptime monitoring)

---

### **🎨 Frontend Stack COMPLETO**

**Core Framework**:
* **React 18.3+** (Concurrent Features, Suspense)
* **TypeScript 5.x** (type safety)
* **Vite 5.x** (build tool ultra-rápido)

**UI & Styling**:
* **Tailwind CSS 4.0** (utility-first CSS) 🆕 **ACTUALIZADO**
* **@tailwindcss/vite** (Vite plugin nativo) 🆕
* **shadcn/ui** (componentes accesibles basados en Radix UI)
* **class-variance-authority** (variantes type-safe)
* **tailwind-merge** (merge de clases sin conflictos)
* **clsx** (conditional classes)

**Animaciones & Efectos**:
* **Framer Motion 11+** (animaciones declarativas)
  * Transiciones de página
  * Layout animations
  * Gestures y drag & drop
* **Lottie** (animaciones vectoriales JSON - mascotas básicas)
  * Mascotas common/uncommon
  * Iconos de logros
* **Rive** (animaciones interactivas avanzadas - mascotas raras) 🆕
  * Mascotas rare/epic
  * State machines complejas
  * Mejor performance que Lottie
* **GSAP 3.12+** (animaciones de alto rendimiento)
  * Efectos de partículas (monedas cayendo)
  * Timelines complejas
* **react-confetti** (celebraciones)

**Canvas & Game Rendering**:
* **React Konva 18+** (Canvas 2D)
  * Tablero tipo serpiente
  * Sprites de mascotas 2D
* **Three.js + React Three Fiber** (3D rendering - mascotas legendarias) 🆕
  * Mascotas legendary/mythic
  * Efectos visuales premium
* **@react-three/drei** (helpers para R3F) 🆕
* **@react-three/postprocessing** (post-processing effects) 🆕

**Audio System**: 🆕
* **Howler.js** (gestión de audio)
  * Efectos de sonido (correct, wrong, combo)
  * Música de fondo
  * Sprites de audio
  * Control de volumen por categoría
  * Mejor que Tone.js para juegos

**Estado & Data**:
* **Zustand 4.5+** (estado global ligero)
* **TanStack Query 5+** (server state)
  * Caché inteligente
  * Auto-refetch
  * Optimistic updates

**Forms & Validation**:
* **React Hook Form 7.49+**
* **Zod 3.22+** (schemas compartidos con backend)

**Utilidades**:
* **react-use** (colección de hooks)
* **react-hot-toast** (notifications)
* **date-fns** (manejo de fechas)
* **Lucide React** (iconos SVG)
* **axios** (HTTP client)
* **socket.io-client** (WebSocket client)

**Optimización**: 🆕
* **React.lazy + Suspense** (code splitting)
* **@tanstack/react-virtual** (virtualización de listas)
* **react-lazy-load-image-component** (lazy loading de imágenes)

---

### **📋 package.json Frontend Completo**

```json
{
  "name": "quiz-game-frontend",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:e2e": "playwright test",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.22.0",
    
    "zustand": "^4.5.0",
    "@tanstack/react-query": "^5.17.0",
    
    "tailwindcss": "^4.0.0-beta.1",
    "@tailwindcss/vite": "^4.0.0-beta.1",
    "class-variance-authority": "^0.7.0",
    "tailwind-merge": "^2.2.0",
    "clsx": "^2.1.0",
    
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "lucide-react": "^0.303.0",
    
    "framer-motion": "^11.0.3",
    "gsap": "^3.12.5",
    "lottie-react": "^2.4.0",
    "@rive-app/react-canvas": "^4.5.4",
    
    "three": "^0.161.0",
    "@react-three/fiber": "^8.15.0",
    "@react-three/drei": "^9.96.0",
    "@react-three/postprocessing": "^2.16.0",
    
    "react-konva": "^18.2.10",
    "konva": "^9.3.2",
    "react-confetti": "^6.1.0",
    
    "howler": "^2.2.4",
    
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.4",
    
    "react-use": "^17.5.0",
    "react-hot-toast": "^2.4.1",
    "date-fns": "^3.3.1",
    "axios": "^1.6.7",
    "socket.io-client": "^4.7.4",
    
    "@tanstack/react-virtual": "^3.0.4",
    "react-lazy-load-image-component": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@types/howler": "^2.2.11",
    "@types/three": "^0.161.0",
    
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.1.0",
    "typescript": "^5.3.3",
    
    "vitest": "^1.2.2",
    "@testing-library/react": "^14.2.1",
    "@testing-library/jest-dom": "^6.4.2",
    "@playwright/test": "^1.41.2",
    
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    
    "autoprefixer": "^10.4.17",
    "postcss": "^8.4.35"
  }
}
```

---

### **📋 package.json Backend Completo**

```json
{
  "name": "quiz-game-backend",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  },
  "dependencies": {
    "express": "^4.18.2",
    "socket.io": "^4.7.4",
    
    "@prisma/client": "^5.9.0",
    "redis": "^4.6.12",
    "@socket.io/redis-adapter": "^8.2.1",
    
    "@anthropic-ai/sdk": "^0.14.0",
    "pdf-parse": "^1.1.1",
    "sharp": "^0.33.2",
    
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "compression": "^1.7.4",
    "express-validator": "^7.0.1",
    
    "multer": "^1.4.5-lts.1",
    "dotenv": "^16.4.1",
    
    "@sentry/node": "^7.100.0",
    "@sentry/profiling-node": "^7.100.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.16",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/multer": "^1.4.11",
    "@types/cors": "^2.8.17",
    "@types/compression": "^1.7.5",
    
    "typescript": "^5.3.3",
    "tsx": "^4.7.0",
    "prisma": "^5.9.0",
    
    "jest": "^29.7.0",
    "@types/jest": "^29.5.12",
    "ts-jest": "^29.1.2",
    "supertest": "^6.3.4",
    "@types/supertest": "^6.0.2",
    
    "eslint": "^8.56.0",
    "@typescript-eslint/eslint-plugin": "^6.21.0",
    "@typescript-eslint/parser": "^6.21.0"
  }
}
```

---

## **🎮 Sistema de Mascotas - Arquitectura Multi-Renderer**

### **🎨 Estrategia de Rendering por Rareza**

```typescript
// src/components/pets/PetRenderer.tsx
import { Sprite2DPet } from './renderers/Sprite2DPet';
import { LottiePet } from './renderers/LottiePet';
import { RivePet } from './renderers/RivePet';
import { ThreeDPet } from './renderers/ThreeDPet';

interface PetRendererProps {
  pet: Pet;
  isActive: boolean;
  happiness: number;
}

export function PetRenderer({ pet, isActive, happiness }: PetRendererProps) {
  switch (pet.rarity) {
    case 'common':
      return <Sprite2DPet pet={pet} isActive={isActive} />;
    
    case 'uncommon':
      return <LottiePet pet={pet} isActive={isActive} />;
    
    case 'rare':
    case 'epic':
      return <RivePet pet={pet} isActive={isActive} happiness={happiness} />;
    
    case 'legendary':
    case 'mythic':
      return <ThreeDPet pet={pet} isActive={isActive} happiness={happiness} />;
    
    default:
      return <Sprite2DPet pet={pet} isActive={isActive} />;
  }
}
```

### **1️⃣ Sprite2DPet (Common)**

```typescript
// CSS Sprite Animation
export function Sprite2DPet({ pet, isActive }: PetProps) {
  return (
    <div 
      className={cn(
        "pet-sprite",
        `pet-${pet.id}`,
        isActive && "pet-active"
      )}
      style={{
        backgroundImage: `url(${pet.stage1_sprite_url})`,
        animation: isActive ? 'pet-idle 1s steps(4) infinite' : 'none'
      }}
    />
  );
}
```

### **2️⃣ LottiePet (Uncommon)**

```typescript
import Lottie from 'lottie-react';

export function LottiePet({ pet, isActive }: PetProps) {
  return (
    <Lottie 
      animationData={pet.lottieData}
      loop={isActive}
      autoplay={isActive}
      style={{ width: 200, height: 200 }}
    />
  );
}
```

### **3️⃣ RivePet (Rare/Epic)**

```typescript
import { useRive, useStateMachineInput } from '@rive-app/react-canvas';

export function RivePet({ pet, happiness, isActive }: PetProps) {
  const { rive, RiveComponent } = useRive({
    src: `/rive/${pet.id}.riv`,
    stateMachines: 'PetStateMachine',
    autoplay: true,
  });
  
  const happinessInput = useStateMachineInput(
    rive,
    'PetStateMachine',
    'happiness'
  );
  
  const activityInput = useStateMachineInput(
    rive,
    'PetStateMachine',
    'activity'
  );
  
  useEffect(() => {
    if (happinessInput) {
      happinessInput.value = happiness;
    }
    if (activityInput) {
      activityInput.value = isActive ? 1 : 0;
    }
  }, [happiness, isActive]);
  
  return (
    <RiveComponent 
      style={{ width: 300, height: 300 }}
      className="pet-rive"
    />
  );
}
```

### **4️⃣ ThreeDPet (Legendary/Mythic)**

```typescript
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';

function Pet3DModel({ pet, happiness }: any) {
  const { scene } = useGLTF(`/models/${pet.id}.glb`);
  
  useFrame((state) => {
    // Animación de idle
    scene.position.y = Math.sin(state.clock.elapsedTime) * 0.1;
    scene.rotation.y = state.clock.elapsedTime * 0.2;
  });
  
  return <primitive object={scene} scale={2} />;
}

export function ThreeDPet({ pet, happiness, isActive }: PetProps) {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} />
      <Pet3DModel pet={pet} happiness={happiness} />
      <OrbitControls enableZoom={false} />
    </Canvas>
  );
}
```

---

## **🔊 Audio System con Howler.js**

### **Audio Manager**

```typescript
// src/lib/audio/AudioManager.ts
import { Howl, Howler } from 'howler';

class AudioManager {
  private sounds: Map<string, Howl> = new Map();
  private music: Howl | null = null;
  
  constructor() {
    // Cargar efectos de sonido
    this.loadSound('correct', '/sounds/correct.mp3', {
      volume: 0.5,
    });
    
    this.loadSound('wrong', '/sounds/wrong.mp3', {
      volume: 0.4,
    });
    
    this.loadSound('combo', '/sounds/combo.mp3', {
      volume: 0.6,
    });
    
    this.loadSound('levelup', '/sounds/levelup.mp3', {
      volume: 0.7,
    });
    
    this.loadSound('coin', '/sounds/coin.mp3', {
      volume: 0.3,
    });
  }
  
  private loadSound(id: string, src: string, options = {}) {
    const sound = new Howl({
      src: [src],
      ...options,
    });
    this.sounds.set(id, sound);
  }
  
  play(id: string) {
    this.sounds.get(id)?.play();
  }
  
  setVolume(category: 'sfx' | 'music', volume: number) {
    if (category === 'sfx') {
      this.sounds.forEach(sound => sound.volume(volume));
    } else {
      this.music?.volume(volume);
    }
  }
  
  mute(muted: boolean) {
    Howler.mute(muted);
  }
}

export const audioManager = new AudioManager();
```

### **Uso en Componentes**

```typescript
import { audioManager } from '@/lib/audio/AudioManager';

function AnswerButton({ option, onAnswer }: Props) {
  const handleClick = () => {
    if (option.is_correct) {
      audioManager.play('correct');
    } else {
      audioManager.play('wrong');
    }
    onAnswer(option.id);
  };
  
  return <button onClick={handleClick}>{option.text}</button>;
}
```

---

## **⚡ Configuración Tailwind 4**

```javascript
// tailwind.config.js
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // ... más colores
      },
      animation: {
        'pet-idle': 'pet-idle 1s steps(4) infinite',
        'coin-collect': 'coin-collect 0.6s ease-out',
        'level-up': 'level-up 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'pet-idle': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '-800px 0' },
        },
        'coin-collect': {
          '0%': { transform: 'translateY(0) scale(1)', opacity: 1 },
          '100%': { transform: 'translateY(-50px) scale(0.5)', opacity: 0 },
        },
        'level-up': {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '50%': { transform: 'scale(1.1)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
};
```

---

## **🧪 Testing Setup**

### **Playwright E2E**

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## **🚀 Roadmap de Implementación**

### **Fase 1: MVP Funcional (Meses 1-3) 🎯**

**Backend Core**:
* ✅ Monolito modular Node.js + Express + Prisma
* ✅ Auth básica con RBAC (teacher/student)
* ✅ WebSocket con Socket.IO + Redis
* ✅ Schema core de BD
* ✅ Integración Claude API para generación de quizzes

**Frontend Core**:
* ✅ React + TypeScript + Vite
* ✅ Tailwind 4 + shadcn/ui 🆕
* ✅ Zustand + React Query
* ✅ Socket.IO Client
* ✅ Framer Motion (básico)
* ✅ Howler.js (audio básico) 🆕

**Features**:
* ✅ Registro/Login simple
* ✅ Profesor: Upload PDF → IA genera quiz
* ✅ Profesor: Crear listas de participantes (manual o Excel)
* ✅ Quiz creation manual (backup si IA falla)
* ✅ Gameplay en tiempo real (10-100 jugadores)
* ✅ Classic mode funcional
* ✅ Scoring básico (corrección + velocidad)
* ✅ Leaderboard en vivo
* ✅ Sistema de niveles y XP simple
* ✅ Coins básico (ganar jugando)
* ✅ Pantalla de resultados con estadísticas
* ✅ **Efectos de sonido básicos** 🆕

---

## **💻 Instalación y Setup**

### **Prerequisites**

```bash
# Node.js 20 LTS
node --version  # v20.x.x

# PostgreSQL 15
psql --version  # 15.x

# Redis 7
redis-cli --version  # 7.x
```

### **Backend Setup**

```bash
# Clonar repositorio
git clone <repo-url>
cd Backend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env
# Editar .env con tus credenciales:
# - DATABASE_URL
# - REDIS_URL
# - ANTHROPIC_API_KEY
# - JWT_SECRET
# - etc.

# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init

# (Opcional) Seed data
npm run db:seed

# Iniciar en desarrollo
npm run dev
```

### **Frontend Setup**

```bash
cd Frontend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env:
# - VITE_API_URL
# - VITE_WS_URL
# - etc.

# Iniciar desarrollo
npm run dev
```

### **Testing**

```bash
# Frontend
npm run test              # Unit tests
npm run test:e2e          # E2E con Playwright

# Backend
npm run test              # Jest tests
npm run test:coverage     # Coverage report
```

---

## **📊 Estructura de Assets**

```
public/
├── sounds/
│   ├── correct.mp3
│   ├── wrong.mp3
│   ├── combo.mp3
│   ├── levelup.mp3
│   ├── coin.mp3
│   └── background-music.mp3
├── sprites/
│   ├── pets/
│   │   ├── owl-common.png
│   │   └── dragon-rare.png
│   └── items/
│       └── coin-sprite.png
├── lottie/
│   ├── pet-fox.json
│   └── achievement-badge.json
├── rive/
│   ├── pet-phoenix.riv
│   └── pet-dragon.riv
└── models/
    ├── pet-unicorn.glb
    └── pet-legendary.glb
```

---

## **✅ Checklist de Stack Completo**

### **Frontend Core**
- [x] React 18.3
- [x] TypeScript 5
- [x] Vite 5
- [x] Tailwind 4 🆕

### **Animaciones**
- [x] Framer Motion
- [x] GSAP
- [x] Lottie
- [x] Rive (para mascotas avanzadas) 🆕
- [x] React Three Fiber (3D) 🆕

### **Audio**
- [x] Howler.js 🆕

### **Testing**
- [x] Vitest
- [x] Playwright (E2E) 🆕

### **Optimización**
- [x] Sharp (backend) 🆕
- [x] react-lazy-load-image 🆕

### **Seguridad**
- [x] express-rate-limit 🆕
- [x] helmet 🆕
- [x] compression 🆕

---

**Version**: 2.0.0  
**Last Updated**: 2025-10-10  
**Status**: Ready for Development 🚀

**Cambios principales v2.0:**
- ✅ Stack actualizado a Tailwind 4
- ✅ Sistema de audio con Howler.js
- ✅ Arquitectura multi-renderer para mascotas
- ✅ Testing E2E con Playwright
- ✅ Optimización de imágenes
- ✅ Mejoras de seguridad backend
- ✅ Stack 3D opcional para mascotas legendarias
