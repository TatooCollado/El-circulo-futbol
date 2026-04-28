import { fn, literal } from "sequelize";
import { Cancha, Pago, Reserva, User } from "../models/index.js";

const toNumber = (value) => Number(value || 0);

const normalizeGroupedCount = (rows, key) => {
  return rows.reduce((acc, row) => {
    acc[row[key]] = toNumber(row.get("total"));
    return acc;
  }, {});
};

export const getGeneralReport = async (req, res, next) => {
  try {
    const [
      totalUsuarios,
      usuariosActivos,
      totalCanchas,
      canchasDisponibles,
      totalReservas,
      reservasPorEstado,
      pagosPorEstado,
      ingresosAprobados,
      reservasPorCancha,
      proximasReservas
    ] = await Promise.all([
      User.count(),
      User.count({ where: { activo: true } }),
      Cancha.count(),
      Cancha.count({ where: { disponible: true } }),
      Reserva.count(),
      Reserva.findAll({
        attributes: ["estado", [fn("COUNT", literal("*")), "total"]],
        group: ["estado"]
      }),
      Pago.findAll({
        attributes: ["estado", [fn("COUNT", literal("*")), "total"]],
        group: ["estado"]
      }),
      Pago.sum("monto", { where: { estado: "aprobado" } }),
      Reserva.findAll({
        attributes: ["canchaId", [fn("COUNT", literal("*")), "total"]],
        include: [{ model: Cancha, attributes: ["id", "nombre"] }],
        group: ["Reserva.canchaId", "Cancha.id"],
        order: [[literal("total"), "DESC"]],
        limit: 5
      }),
      Reserva.findAll({
        include: [
          {
            model: Cancha,
            attributes: ["id", "nombre"]
          },
          {
            model: User,
            attributes: ["id", "nombre", "apellido", "email"]
          },
          {
            model: Pago
          }
        ],
        where: {
          estado: ["pendiente_pago", "confirmada"]
        },
        order: [
          ["fecha", "ASC"],
          ["id", "ASC"]
        ],
        limit: 8
      })
    ]);

    return res.json({
      resumen: {
        totalUsuarios,
        usuariosActivos,
        totalCanchas,
        canchasDisponibles,
        totalReservas,
        ingresosAprobados: toNumber(ingresosAprobados)
      },
      reservasPorEstado: normalizeGroupedCount(reservasPorEstado, "estado"),
      pagosPorEstado: normalizeGroupedCount(pagosPorEstado, "estado"),
      reservasPorCancha: reservasPorCancha.map((reserva) => ({
        canchaId: reserva.canchaId,
        cancha: reserva.Cancha?.nombre || "Cancha",
        total: toNumber(reserva.get("total"))
      })),
      proximasReservas
    });
  } catch (error) {
    return next(error);
  }
};

