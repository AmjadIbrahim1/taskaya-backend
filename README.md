# 🚀 Taskaya Backend API

<div align="center">

![Taskaya Backend](https://img.shields.io/badge/Taskaya-REST%20API-success?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-4.22.1-000000?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-5.22.0-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16.x-336791?style=for-the-badge&logo=postgresql)

</div>

---

## 🌟 Features

### 🔐 **Authentication & Security**
- 🔑 JWT-based authentication system
- 🔒 Secure password hashing with bcrypt
- 🔄 Access & Refresh token mechanism
- 🛡️ Token revocation on logout
- ⏰ Automatic token cleanup
- 🚫 Protected routes middleware

### ✅ **Task Management**
- ➕ Full CRUD operations
- 🔥 Urgent task prioritization
- ✓ Task completion tracking
- 📅 Deadline management
- 🔍 Advanced search functionality
- 📊 Task filtering (All, Urgent, Completed)

### 🛠️ **API Features**
- 📝 Request validation with express-validator
- 🔄 Auto-generated Prisma types
- 📋 Comprehensive error handling
- 🎯 RESTful design principles
- 📊 Database migrations with Prisma
- 🧪 Environment-based configuration

### 📈 **Performance & Reliability**
- ⚡ Fast response times with Prisma ORM
- 🔄 Connection pooling
- 🧹 Automatic cleanup of expired tokens
- 📊 Query optimization
- 🎯 Efficient database indexing

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | 20.x | Runtime Environment |
| **TypeScript** | 5.9.3 | Type Safety |
| **Express** | 4.22.1 | Web Framework |
| **Prisma** | 5.22.0 | ORM & Database Tools |
| **PostgreSQL** | 16.x | Database |
| **JWT** | 9.0.3 | Authentication |
| **Bcrypt** | 5.1.1 | Password Hashing |
| **Express Validator** | 7.3.1 | Request Validation |
| **CORS** | 2.8.5 | Cross-Origin Support |

---

## 🚀 Quick Start

### Prerequisites

```bash
# Node.js 20.x or higher
node -v  # Should be >= 20.0.0

# PostgreSQL 16.x or higher
psql --version  # Should be >= 16.0
```

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Amjadibrahim1/taskaya-backend.git
cd taskaya-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup PostgreSQL Database**
```bash
# Create database
createdb taskaya_db

# Or using psql
psql -U postgres
CREATE DATABASE taskaya_db;
```

4. **Configure environment variables**
```bash
# Create .env file
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/taskaya_db"

# JWT Secrets (Generate strong secrets!)
JWT_SECRET="your-super-secret-jwt-key-change-this"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this"

# Server
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"
```

5. **Run Prisma migrations**
```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database
npm run prisma:seed
```

6. **Start development server**
```bash
npm run dev
```

7. **Server running at**
```
http://localhost:5000
```

---

## 📦 Available Scripts

```bash
# Development
npm run dev              # Start dev server with auto-reload
npm run build            # Build TypeScript to JavaScript
npm start                # Start production server

# Database
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio GUI
npm run prisma:seed      # Seed database with sample data
npm run prisma:reset     # Reset database (WARNING: Deletes all data)
npm run db:push          # Push schema changes without migrations

# Utilities
npm run clean            # Remove dist folder
```

---

## 📡 API Documentation

### Base URL
```
Development: http://localhost:5000
Production: https://taskaya-backend-production.up.railway.app/
```

### Authentication Endpoints

#### 1️⃣ Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (201)**
```json
{
  "message": "User registered successfully",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "createdAt": "2026-01-10T12:00:00.000Z"
  }
}
```

#### 2️⃣ Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200)**
```json
{
  "message": "Login successful",
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### 3️⃣ Refresh Token
```http
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 4️⃣ Logout
```http
POST /api/auth/logout
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 5️⃣ Logout All Devices
```http
POST /api/auth/logout-all
Content-Type: application/json
Authorization: Bearer <accessToken>

{
  "userId": 1
}
```

---

### Task Endpoints (🔒 Requires JWT)

All task endpoints require JWT token:
```
Authorization: Bearer <your-jwt-token>
```

#### 1️⃣ Get All Tasks
```http
GET /api/tasks
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "tasks": [
    {
      "id": 1,
      "userId": 1,
      "title": "Complete project",
      "description": "Finish the Taskaya project",
      "deadline": "2026-01-15T00:00:00.000Z",
      "isUrgent": true,
      "completed": false,
      "status": "pending",
      "createdAt": "2026-01-10T12:00:00.000Z",
      "updatedAt": "2026-01-10T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### 2️⃣ Create Task
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "New Task",
  "description": "Task description",
  "deadline": "2026-01-15T00:00:00.000Z",
  "is_urgent": true
}
```

#### 3️⃣ Update Task
```http
PUT /api/tasks/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Task",
  "completed": true,
  "is_urgent": false
}
```

#### 4️⃣ Delete Task
```http
DELETE /api/tasks/:id
Authorization: Bearer <token>
```

#### 5️⃣ Get Completed Tasks
```http
GET /api/tasks/completed
Authorization: Bearer <token>
```

#### 6️⃣ Get Urgent Tasks
```http
GET /api/tasks/urgent
Authorization: Bearer <token>
```

#### 7️⃣ Search Tasks
```http
GET /api/tasks/search?q=project
Authorization: Bearer <token>
```

---

## 🗄️ Database Schema

```prisma
model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  password      String?
  clerkId       String?        @unique
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  tasks         Task[]
  refreshTokens RefreshToken[]
}

model Task {
  id          Int      @id @default(autoincrement())
  userId      Int
  title       String
  description String?
  deadline    DateTime?
  isUrgent    Boolean  @default(false)
  completed   Boolean  @default(false)
  status      String   @default("pending")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([isUrgent])
  @@index([completed])
}

model RefreshToken {
  id        Int      @id @default(autoincrement())
  token     String   @unique
  userId    Int
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([token])
}
```

---

## 🐳 Docker Deployment

### Build Docker Image
```bash
docker build -t taskaya-backend:latest .
```

### Run with Docker
```bash
docker run -p 5000:5000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e JWT_SECRET="your-secret" \
  -e JWT_REFRESH_SECRET="your-refresh-secret" \
  taskaya-backend:latest
```

### Docker Compose (Full Stack)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `JWT_SECRET` | ✅ Yes | - | Secret for access tokens |
| `JWT_REFRESH_SECRET` | ✅ Yes | - | Secret for refresh tokens |
| `PORT` | ❌ No | 5000 | Server port |
| `NODE_ENV` | ❌ No | development | Environment mode |
| `FRONTEND_URL` | ✅ Yes | - | Frontend URL for CORS |

### CORS Configuration
Edit `src/app.ts` to add allowed origins:
```typescript
const allowedOrigins = [
  "http://localhost:5173",
  "https://taskaya-frontend.vercel.app/app",
  process.env.FRONTEND_URL,
];
```

---

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

---

## 📊 Performance Monitoring

### Database Query Optimization
- Prisma logs slow queries (>100ms)
- Indexed columns for faster lookups
- Connection pooling enabled

### Health Check Endpoint
```http
GET /health
```

**Response**
```json
{
  "status": "ok",
  "timestamp": "2026-01-10T12:00:00.000Z"
}
```

---

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt (10 rounds)
- ✅ JWT tokens with expiration
- ✅ Refresh token rotation
- ✅ CORS properly configured
- ✅ Request validation on all endpoints
- ✅ SQL injection protection with Prisma
- ✅ Rate limiting (recommended to add)
- ✅ Helmet.js for security headers (recommended)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 Changelog

### v1.0.0 (2026-01-10)
- ✨ Initial release
- 🔐 JWT authentication
- ✅ Full CRUD operations
- 📊 PostgreSQL with Prisma
- 🐳 Docker support

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file

---

## 👏 Acknowledgments

- [Express.js](https://expressjs.com)
- [Prisma](https://www.prisma.io)
- [PostgreSQL](https://www.postgresql.org)

---

<div align="center">

**Made with ❤️ by [Amjad](https://github.com/Amjadibrahim1)**

[⬆ Back to Top](#-taskaya-backend-api)

</div>
