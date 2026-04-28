import { sequelize } from "../config/database.js";
import { defineUserModel } from "./User.js";
import { defineCanchaModel } from "./Cancha.js";
import { defineReservaModel } from "./Reserva.js";
import { definePagoModel } from "./Pago.js";

export const User = defineUserModel(sequelize);
export const Cancha = defineCanchaModel(sequelize);
export const Reserva = defineReservaModel(sequelize);
export const Pago = definePagoModel(sequelize);

User.hasMany(Reserva, { foreignKey: { name: "usuarioId", allowNull: false } });
Reserva.belongsTo(User, { foreignKey: { name: "usuarioId", allowNull: false } });

Cancha.hasMany(Reserva, { foreignKey: { name: "canchaId", allowNull: false } });
Reserva.belongsTo(Cancha, { foreignKey: { name: "canchaId", allowNull: false } });

Reserva.hasOne(Pago, { foreignKey: { name: "reservaId", allowNull: false } });
Pago.belongsTo(Reserva, { foreignKey: { name: "reservaId", allowNull: false } });

export { sequelize };
