# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AppQuiz is an educational quiz platform combining Kahoot-style gameplay with Duolingo-like gamification. The platform supports multiple game modes (Classic, Board, Survival, Boss Battles), real-time multiplayer, AI-powered quiz generation, and extensive gamification features including pets, achievements, and virtual economy.

**Tech Stack:**
- Backend: Node.js 20 + TypeScript 5 + Express 4 + Prisma ORM + PostgreSQL 15 + Redis 7
- Frontend: React 18.3 + TypeScript 5 + Vite 6 + Tailwind CSS 4 + shadcn/ui
- Real-time: Socket.IO 4
- State Management: Zustand 4.5 + TanStack Query 5
- AI Integration: Anthropic Claude API, OpenAI, Google Gemini

## Development Commands

### Backend (from `/Backend`)
```bash
npm run dev                # Start development server (tsx watch)
npm run build              # Compile TypeScript
npm run start              # Run compiled code
npm run prisma:generate    # Generate Prisma client
npm run prisma:migrate     # Run database migrations
npm run prisma:studio      # Open Prisma Studio
npm run db:seed            # Seed database with test data
npm test                   # Run tests with coverage
npm run test:watch         # Run tests in watch mode
npm run lint               # Lint TypeScript files
```

### Frontend (from `/Frontend`)
```bash
npm run dev                # Start Vite dev server (port 5173)
npm run build              # Build for production (TypeScript + Vite)
npm run preview            # Preview production build
npm test                   # Run Vitest tests
npm run test:ui            # Run tests with UI
npm run test:coverage      # Generate coverage report
npm run lint               # Lint TypeScript/TSX files
```

## Architecture Overview

### Backend Structure

**Layered Architecture:**
- Controllers (src/controllers/) - Handle HTTP requests/responses
- Services (src/services/) - Business logic layer
- Middleware (src/middleware/) - Auth, validation, error handling
- Routes (src/routes/) - API endpoint definitions
- Config (src/config/) - Database, Redis, environment configuration
- Utils (src/utils/) - Shared utilities (JWT, password hashing, ApiError)

**Key Patterns:**
- All routes are namespaced under `/api/v1`
- Authentication uses JWT (access + refresh tokens) via `requireAuth` middleware
- Role-based access control via `requireRole([UserRole.teacher, UserRole.admin])`
- Custom error classes (UnauthorizedError, ForbiddenError, BadRequestError) extend ApiError
- Async route handlers wrapped with `asyncHandler` utility
- Validation using Zod schemas via `validate` middleware

**Database:**
- Prisma ORM with PostgreSQL 15
- Schema in `Backend/prisma/schema.prisma`
- Comprehensive model relationships (users, games, questions, pets, achievements, currency, etc.)
- Soft deletes via `deleted_at` timestamp
- Extensive indexing for performance
- Enums for GameMode, GameStatus, UserRole, ItemRarity, etc.

**AI Integration:**
- Factory pattern in `services/ai/` with IAIProvider interface
- Multiple providers: ClaudeProvider, OpenAIProvider, GeminiProvider
- AIService handles provider selection and fallback
- Used for quiz generation from text/PDF content

### Frontend Structure

**Component Organization:**
- components/ui/ - shadcn/ui base components (Button, Card, Dialog, etc.)
- components/layout/ - Layout components (Topbar, Sidebar)
- components/game/ - Game-specific components (QuestionCard, GameBoard, AudioSettings)
- pages/ - Route-level components (LoginPage, DashboardPage, etc.)
- store/ - Zustand stores (authStore, gameStore)
- lib/ - Utilities (api client, queryClient, cn helper)

**State Management:**
- Zustand with persist middleware for auth state (authStore.ts)
- Zustand with devtools for game state (gameStore.ts)
- TanStack Query for server state and API calls
- Auth tokens stored in localStorage and persisted via Zustand

**Routing:**
- React Router v6
- Protected routes via ProtectedRoute component
- Role-based dashboard routing (Admin, Teacher, Student)

**Styling System:**
- Tailwind CSS 4 (mobile-first)
- shadcn/ui components with HSL color variables
- Dark mode support via CSS variables
- No inline styles or arbitrary values unless necessary

## Critical Coding Standards

### TypeScript Strictness
- Never use `any` type (use `unknown` if needed)
- Always type function parameters and return types
- Use interfaces for objects, types for unions/primitives
- strict: true, noImplicitAny: true, strictNullChecks: true

### React Patterns
- Functional components only
- Custom hooks for reusable logic (prefix with `use`)
- Use React.memo for expensive renders
- Lazy load routes and heavy components
- Error boundaries for error handling

### Database Operations
- Use Prisma transactions for related operations
- Select only needed fields to minimize data transfer
- Soft delete (deleted_at) instead of hard delete
- Use proper relations and constraints

### Security
- Sanitize user input
- Validate on both client and server
- JWT tokens with refresh strategy
- Rate limiting on API endpoints (100 requests per 15 minutes)
- CORS configured in Backend/src/app.ts

### Naming Conventions
- Components: PascalCase (GameCard.tsx)
- Files: kebab-case for utilities (audio-manager.ts)
- Hooks: camelCase with 'use' prefix (useGameState.ts)
- Stores: camelCase with Store suffix (gameStore.ts)
- Types: PascalCase (GameStatus, UserRole)
- Constants: UPPER_SNAKE_CASE

### Testing
- Backend: Jest + Supertest (target 70%+ coverage)
- Frontend: Vitest + React Testing Library (target 60%+ coverage)
- Test user flows, not implementation details
- Mock external dependencies

## Authentication Flow

1. User logs in → `/api/v1/auth/login`
2. Backend returns `{ user, accessToken, refreshToken }`
3. Frontend stores tokens in localStorage via authStore
4. API client (Frontend/src/lib/api.ts) attaches Bearer token to requests
5. Backend `requireAuth` middleware verifies JWT and injects `req.userId` and `req.userRole`
6. Protected routes use `requireRole([...])` for RBAC

## Game System Architecture

**Game Modes:**
- Classic: Kahoot-style simultaneous answers
- Board: Snakes & ladders with board_events
- Survival: Elimination mode
- Boss Battle: Multi-phase encounters with boss_battles table

**Real-time Flow:**
- Socket.IO for real-time game events
- Namespaces: `/game`, `/chat`
- Rooms for specific game sessions
- Events logged in realtime_events table

**Gamification:**
- XP/Level system in user_profiles
- Coins (soft currency, 5000 daily limit) and Gems (hard currency)
- Pets system with evolution stages (pets, user_pets tables)
- Achievements with progress tracking (achievements, user_achievements)
- Streaks with milestone rewards (user_profiles.current_streak)

## AI Quiz Generation

AI quiz generation uses the factory pattern in `Backend/src/services/ai/`:
1. AIQuestionSetController receives text or PDF upload
2. AIQuestionSetService extracts content (pdf-parse for PDFs)
3. AIProviderFactory selects provider (Claude, OpenAI, or Gemini)
4. Provider generates structured quiz JSON
5. Service creates question_sets and questions in database
6. Returns structured question set to frontend

## Animation System

- **Framer Motion**: Page transitions, layout animations, complex interactions
- **GSAP**: Particle effects, timelines, high-performance animations
- **Lottie**: Static animations (common pets, icons, badges)
- **Rive**: Interactive animations with state machines (rare/epic pets)
- **CSS**: Simple hover effects, loading spinners
- Target 60fps using transform/opacity

## Environment Configuration

Backend requires `.env` file with:
- DATABASE_URL (PostgreSQL connection string)
- REDIS_URL
- JWT_SECRET, JWT_REFRESH_SECRET
- ANTHROPIC_API_KEY (for Claude AI)
- OPENAI_API_KEY, GOOGLE_API_KEY (optional)
- ALLOWED_ORIGINS (comma-separated CORS origins)

Frontend requires `.env` with:
- VITE_API_URL (Backend API URL, default http://localhost:4000)

## Common Development Tasks

### Adding a New API Endpoint
1. Define Zod validation schema in appropriate controller
2. Create service method in `Backend/src/services/`
3. Create controller handler in `Backend/src/controllers/`
4. Add route in `Backend/src/routes/`
5. Import route in `Backend/src/routes/index.ts`
6. Add authentication/authorization middleware as needed

### Adding a New UI Component
1. Check if shadcn/ui has the component first
2. If creating custom, follow naming conventions (PascalCase)
3. Use TypeScript with proper prop types
4. Style with Tailwind utility classes
5. Export as named export
6. Add to appropriate directory (components/ui/, components/game/, etc.)

### Database Schema Changes
1. Modify `Backend/prisma/schema.prisma`
2. Run `npm run prisma:migrate` (creates migration)
3. Run `npm run prisma:generate` (updates Prisma client)
4. Update TypeScript types if needed
5. Update seed file if adding new required data

### Running a Single Test
```bash
# Backend
cd Backend
NODE_ENV=test npm test -- path/to/test.test.ts

# Frontend
cd Frontend
npm test -- path/to/test.test.tsx
```

## Important Notes

- Default dev credentials (after seeding): admin/password123, teacher1/password123, student1/password123
- Backend runs on port 4000, Frontend on port 5173
- All API routes are prefixed with `/api/v1`
- Database uses partitioned tables for activity_logs and game_answers (requires special migration setup)
- Pet rendering strategy based on rarity: Common (CSS), Uncommon (Lottie), Rare/Epic (Rive)
- Currency transaction logging for audit trail in currency_transactions table
- Leaderboards are period-based (daily/weekly/monthly/all-time)
