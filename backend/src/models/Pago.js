import { DataTypes } from "sequelize";

export const definePagoModel = (sequelize) => {
  const Pago = sequelize.define(
    "Pago",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      mercadoPagoPreferenceId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      mercadoPagoPaymentId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      estado: {
        type: DataTypes.ENUM("pendiente", "aprobado", "rechazado", "cancelado"),
        allowNull: false,
        defaultValue: "pendiente"
      },
      monto: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      metodo: {
        type: DataTypes.STRING,
        allowNull: true
      },
      reservaId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: "pagos"
    }
  );

  return Pago;
};
