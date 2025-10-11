# AppQuiz Backend

Backend API for the Quiz Game Platform - Educational Gamified System

## 🚀 Quick Start

### Prerequisites

- Node.js 20 LTS
- PostgreSQL 15
- Redis 7

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your credentials

# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## 📁 Project Structure

```
src/
├── config/         # Database, Redis, environment config
├── controllers/    # Route controllers
├── middleware/     # Auth, validation, error handling
├── models/         # Prisma models
├── routes/         # API routes
├── services/       # Business logic
├── types/          # TypeScript types
├── utils/          # Helper functions
├── app.ts          # Express app configuration
└── server.ts       # Entry point
```

## 🔑 API Endpoints

### Authentication (Public)

```
POST   /api/v1/auth/register        - Register new user
POST   /api/v1/auth/login           - Login user
POST   /api/v1/auth/forgot-password - Request password reset
POST   /api/v1/auth/reset-password  - Reset password with token
```

### Authentication (Protected)

```
GET    /api/v1/auth/me              - Get current user
PUT    /api/v1/auth/profile         - Update user profile
POST   /api/v1/auth/logout          - Logout user
```

### Health Check

```
GET    /api/v1/health               - Server health check
```

📄 **Full API Documentation**: [API_ENDPOINTS.md](./API_ENDPOINTS.md)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm test -- --coverage
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt (12 rounds)
- Rate limiting
- Helmet security headers
- CORS configuration
- Input validation with Zod

## 🛠 Development

```bash
# Development mode (hot reload)
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Format code
npm run format
```

## 📊 Database

- **ORM**: Prisma
- **Database**: PostgreSQL 15
- **Cache**: Redis 7

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run db:seed
```

## 🚢 Deployment

Ready for deployment to:
- Railway
- Render
- Heroku
- AWS/GCP/Azure

## 📄 License

MIT

