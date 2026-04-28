import { app } from "./app.js";
import { env } from "./config/env.js";
import { sequelize } from "./models/index.js";

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    app.listen(env.port, () => {
      console.log(`API running on http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error("Unable to start server", error);
    process.exit(1);
  }
};

startServer();

