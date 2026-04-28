import { sequelize } from "../config/database.js";
import { defineUserModel } from "./User.js";
import { defineCanchaModel } from "./Cancha.js";
import { defineReservaModel } from "./Reserva.js";
import { definePagoModel } from "./Pago.js";

export const User = defineUserModel(sequelize);
export const Cancha = defineCanchaModel(sequelize);
export const Reserva = defineReservaModel(sequelize);
export const Pago = definePagoModel(sequelize);

User.hasMany(Reserva, { foreignKey: "usuarioId" });
Reserva.belongsTo(User, { foreignKey: "usuarioId" });

Cancha.hasMany(Reserva, { foreignKey: "canchaId" });
Reserva.belongsTo(Cancha, { foreignKey: "canchaId" });

Reserva.hasOne(Pago, { foreignKey: "reservaId" });
Pago.belongsTo(Reserva, { foreignKey: "reservaId" });

export { sequelize };

