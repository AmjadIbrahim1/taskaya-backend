// backend/src/utils/cleanupTokens.ts
import { prisma } from "../config/db";

export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const result = await prisma.refreshToken.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          {
            revoked: true,
            createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        ],
      },
    });

    if (result.count > 0) {
      console.log(`🧹 Cleaned up ${result.count} expired/revoked tokens`);
    }
  } catch (error) {
    console.error("❌ Error cleaning up tokens:", error);
  }
};

export const startTokenCleanup = (): void => {
  console.log("🔄 Token cleanup service started");
  cleanupExpiredTokens();
  setInterval(() => {
    cleanupExpiredTokens();
  }, 24 * 60 * 60 * 1000);
};
