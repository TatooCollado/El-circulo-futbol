import dotenv from "dotenv";

dotenv.config();

const nodeEnv = process.env.NODE_ENV || "development";

if (nodeEnv === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is required in production");
}

export const env = {
  port: process.env.PORT || 3001,
  nodeEnv,
  dbLogging: process.env.DB_LOGGING === "true",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  mercadoPagoAccessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
  mercadoPagoPublicKey: process.env.MERCADOPAGO_PUBLIC_KEY
};
