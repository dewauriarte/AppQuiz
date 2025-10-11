# AppQuiz Frontend

Modern frontend for the Quiz Game Platform built with React, TypeScript, and Vite.

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your API URL

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/     # React components
│   ├── ui/        # shadcn/ui components
│   └── ...
├── pages/         # Page components (routes)
├── hooks/         # Custom React hooks
├── store/         # Zustand stores
├── lib/           # Utilities and configs
├── types/         # TypeScript types
└── test/          # Test setup and utilities
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## 🎨 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **State Management**: Zustand
- **Server State**: TanStack Query
- **Forms**: React Hook Form + Zod
- **Router**: React Router v6
- **Animations**: Framer Motion
- **Testing**: Vitest + Testing Library

## 🔑 Features Implemented

### Sprint 1 (Authentication)

- ✅ Login page with validation
- ✅ Register page (teacher/student)
- ✅ Protected routes
- ✅ Role-based access control
- ✅ JWT token management
- ✅ Auto-refresh token strategy
- ✅ Zustand state management
- ✅ Dashboard with role-specific UI

## 📝 Environment Variables

```env
VITE_API_URL=http://localhost:4000/api/v1
VITE_WS_URL=http://localhost:4000
```

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

## 🔒 Authentication Flow

1. User logs in/registers
2. Backend returns JWT tokens (access + refresh)
3. Tokens stored in localStorage
4. API client auto-includes token in headers
5. On 401 error, attempt token refresh
6. If refresh fails, redirect to login

## 📊 Available Scripts

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run tests
npm run test:ui      # Run tests with UI
npm run lint         # Lint code
npm run format       # Format code with Prettier
```

## 🎯 Next Steps (Sprint 2)

- [ ] Quiz creation interface
- [ ] AI quiz generation UI
- [ ] Real-time game lobby
- [ ] WebSocket integration
- [ ] Question display component
- [ ] Leaderboard UI

## 📄 License

MIT

