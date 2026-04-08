# VideoMap AI Agent Instructions

## Project Overview
**VideoMap** is a React Native + NestJS marketplace for videomakers to showcase and book video production services. The app enables clients to discover services and providers to monetize their capabilities.

- **Backend**: NestJS + TypeORM + PostgreSQL + Cloudinary (image/video hosting)
- **Frontend**: Expo (React Native) + React Navigation + Context API
- **Architecture**: Modular backend (Auth, Users, Services modules) with JWT-based auth

## Critical Development Commands

### Backend
```bash
# Development with auto-reload
cd backend && npm run start:dev

# Build for production
npm run build

# Production server
npm run start:prod

# Run tests
npm test
```

### Frontend
```bash
# Start Expo development server (supports web, Android, iOS)
cd frontend && npm start

# Platform-specific
npm run android    # Android emulator
npm run ios       # iOS simulator
npm run web       # Web browser
```

**Important**: Configure [frontend/src/services/api.ts](frontend/src/services/api.ts) IP address for mobile testing. Use `ipconfig` on Windows to get your machine's IP.

## Architecture Patterns

### Backend Module Structure
Each domain has a module with controller → service → entity pattern:
- **Auth Module**: JWT strategy, login/signup validation
- **Users Module**: Profile management, role-based access (CLIENT/PROVIDER roles)
- **Services Module**: CRUD for video service listings with provider relationships

Related files:
- Controllers: `backend/src/{auth,users,services}/*.controller.ts`
- Services: `backend/src/{auth,users,services}/*.service.ts`
- Entities: `backend/src/{users,services}/*.entity.ts` (TypeORM decorators define DB schema)

### Frontend State Management
- **AuthContext** ([frontend/src/contexts/AuthContext.tsx](frontend/src/contexts/AuthContext.tsx)): Manages login state, JWT token, and user data via `useAuth()` hook
- **AsyncStorage**: Persists token and user object across app sessions (key prefix: `@VideoMap:`)
- **Axios API client** ([frontend/src/services/api.ts](frontend/src/services/api.ts)): Auto-injects Bearer token in all requests

### Data Flow Example
1. Login form → `signIn(email, password)` from AuthContext
2. POST `/auth/login` → Backend validates credentials, returns JWT + user object
3. Token stored in AsyncStorage + Axios default header
4. Protected endpoints use `@UseGuards(JwtAuthGuard)` on backend

### Navigation (Frontend)
- **TabNavigator**: Home (browse services), Account (user profile)
- **Stack Navigator**: Wraps tabs for detail/modal screens (DetailsScreen, NewServiceScreen)
- Theme: Dark UI with orange (`#F97316`) accents on tabs
- Reference: [frontend/src/navigation/Routes.tsx](frontend/src/navigation/Routes.tsx)

## Key Integration Points

### JWT Authentication
- **Backend**: `@UseGuards(JwtAuthGuard)` decorator on protected endpoints; `user` parameter automatically injected from token
- **Strategy file**: [backend/src/auth/jwt.strategy.ts](backend/src/auth/jwt.strategy.ts) - extracts user ID, email, role from JWT payload
- **Payload format**: `{ sub: userId, email, role }` (sub = subject, standard JWT convention)

### Service-Provider Relationship
- Service entity has `provider: User` (ManyToOne) and `providerId: string` (foreign key)
- When fetching services, use `relations: ['provider']` in TypeORM to load provider details
- Services auto-increment `views` counter on each `findById()` call for analytics

### Image/Video Hosting
- **Cloudinary integration**: [backend/src/services/cloudinary.service.ts](backend/src/services/cloudinary.service.ts)
- Multer handles file uploads; Cloudinary stores and returns URLs
- Fields: `coverUrl` (image), `videoUrl` (video) on Service entity

## Project-Specific Conventions

### Database Constraints
- UUIDs for all primary keys (`@PrimaryGeneratedColumn('uuid')`)
- Nullable locations/coordinates for services without geographic restriction
- Email uniqueness enforced at DB level for users
- Role field defaults to 'CLIENT'; set to 'PROVIDER' for sellers

### Error Handling
- **Backend**: Throw NestJS exceptions (`UnauthorizedException`, `NotFoundException`)
- **Frontend**: Catch `error.response?.data?.message` from Axios for user-facing error display
- Auth errors use vague message: "Email ou senha inválidos" (prevents user enumeration)

### Environment Configuration
- Backend uses `@nestjs/config` (ConfigModule); all config from `.env` file
- Required env vars: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, JWT secret
- Frontend hardcodes baseURL (see api.ts comment about IP configuration)

### Language & Localization
- UI text is in Portuguese (Brazil): "Início", "Conta", "Email ou senha inválidos"
- Keep this convention when adding new screens/forms

## Common Tasks

**Adding a new endpoint**:
1. Create method in service (e.g., `ServicesService.updateService()`)
2. Add controller method with route decorator (e.g., `@Put(':id')`)
3. Use `@UseGuards(JwtAuthGuard)` if protected; access user via `@Request()` param
4. Return paginated data for lists (see `findAll()` pattern: `{ data, total, page, totalPages }`)

**Creating a new screen**:
1. Add `.tsx` file in [frontend/src/screens/](frontend/src/screens/)
2. Add to Routes.tsx navigation (Tab or Stack)
3. Use `useAuth()` to access current user
4. Call API via [frontend/src/services/api.ts](frontend/src/services/api.ts) (axios instance)

**Database schema changes**:
- Update entity in [backend/src/{domain}/*.entity.ts](backend/src/)
- TypeORM `synchronize: true` auto-creates/updates schema on startup (dev only; use migrations in production)
- Entities are loaded from glob pattern `**/*.entity{.ts,.js}` in [backend/src/app.module.ts](backend/src/app.module.ts#L16)

---

**Last Updated**: February 2026
