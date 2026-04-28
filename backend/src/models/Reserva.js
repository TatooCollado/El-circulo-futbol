import { DataTypes } from "sequelize";

export const defineReservaModel = (sequelize) => {
  const Reserva = sequelize.define(
    "Reserva",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      fecha: {
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      momento: {
        type: DataTypes.ENUM("manana", "tarde", "noche"),
        allowNull: false
      },
      estado: {
        type: DataTypes.ENUM(
          "pendiente_pago",
          "confirmada",
          "cancelada",
          "vencida",
          "rechazada"
        ),
        allowNull: false,
        defaultValue: "pendiente_pago"
      },
      precioFinal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      venceEn: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: "reservas"
    }
  );

  return Reserva;
};

