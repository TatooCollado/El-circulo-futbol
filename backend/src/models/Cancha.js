import { DataTypes } from "sequelize";

export const defineCanchaModel = (sequelize) => {
  const Cancha = sequelize.define(
    "Cancha",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false
      },
      tipo: {
        type: DataTypes.ENUM("futbol_5", "futbol_7", "futbol_11"),
        allowNull: false
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isPositive(value) {
            const precio = Number(value);

            if (!Number.isFinite(precio) || precio <= 0) {
              throw new Error("El valor debe ser mayor a 0");
            }
          }
        }
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      imagen: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "canchas"
    }
  );

  return Cancha;
};
