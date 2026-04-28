import { Sequelize } from "sequelize";
import { env } from "./env.js";

if (!env.databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: env.dbLogging ? console.log : false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});
