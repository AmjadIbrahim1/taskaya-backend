// backend/src/server.ts
import app from "./app";
import { initDB } from "./config/db";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    await initDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`\n📝 Taskaya API v4.0 - Authentication Strategy:`);
      console.log(`   🔵 PRIMARY: Clerk (OAuth, Google, GitHub, LinkedIn)`);
      console.log(`   🟢 LEGACY: JWT (Email/Password for existing users)\n`);
      
      console.log(`📚 API Documentation:`);
      console.log(`\n   ═══════════════════════════════════════════════════`);
      console.log(`   🔐 LEGACY Authentication (JWT) - /api/auth/*`);
      console.log(`   ═══════════════════════════════════════════════════`);
      console.log(`   POST /api/auth/register       - Register with email/password`);
      console.log(`   POST /api/auth/login          - Login with email/password`);
      console.log(`   POST /api/auth/refresh        - Refresh JWT access token`);
      console.log(`   POST /api/auth/logout         - Logout (revoke token)`);
      console.log(`   POST /api/auth/logout-all     - Logout from all devices`);
      
      console.log(`\n   ═══════════════════════════════════════════════════`);
      console.log(`   ✅ Tasks (Clerk Auth Required) - /api/tasks/*`);
      console.log(`   ═══════════════════════════════════════════════════`);
      console.log(`   GET    /api/tasks               - Get all tasks`);
      console.log(`   POST   /api/tasks               - Create new task`);
      console.log(`   GET    /api/tasks/completed     - Get completed tasks`);
      console.log(`   GET    /api/tasks/urgent        - Get urgent tasks`);
      console.log(`   GET    /api/tasks/search?q=...  - Search tasks`);
      console.log(`   PUT    /api/tasks/:id           - Update task`);
      console.log(`   DELETE /api/tasks/:id           - Delete task`);
      
      console.log(`\n   ⚠️  Note: All /api/tasks/* endpoints require Clerk token`);
      console.log(`   💡 JWT tokens only work with /api/auth/* endpoints\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();