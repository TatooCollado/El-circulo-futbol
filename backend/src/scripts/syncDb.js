import { sequelize } from "../models/index.js";

const syncDb = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("Tablas sincronizadas correctamente");
  } catch (error) {
    console.error("No se pudieron sincronizar las tablas", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

syncDb();

