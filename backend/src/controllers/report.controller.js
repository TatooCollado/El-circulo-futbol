import { Op, fn, literal } from "sequelize";
import { Cancha, Pago, Reserva, User } from "../models/index.js";
import { expireStaleReservations } from "../services/reserva.service.js";
import { getBusinessDateString } from "../utils/businessDate.js";
import { httpError } from "../utils/httpError.js";

const toNumber = (value) => Number(value || 0);
const momentos = ["manana", "tarde", "noche"];
const activeReservaStates = ["pendiente_pago", "confirmada"];

const isValidDateString = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseReportFilters = (query) => {
  const { fechaDesde, fechaHasta } = query;

  if (fechaDesde && !isValidDateString(fechaDesde)) {
    throw httpError(400, "fechaDesde debe tener formato YYYY-MM-DD");
  }

  if (fechaHasta && !isValidDateString(fechaHasta)) {
    throw httpError(400, "fechaHasta debe tener formato YYYY-MM-DD");
  }

  if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
    throw httpError(400, "fechaDesde no puede ser posterior a fechaHasta");
  }

  const fechaWhere = {};

  if (fechaDesde && fechaHasta) {
    fechaWhere[Op.between] = [fechaDesde, fechaHasta];
  } else if (fechaDesde) {
    fechaWhere[Op.gte] = fechaDesde;
  } else if (fechaHasta) {
    fechaWhere[Op.lte] = fechaHasta;
  }

  return {
    fechaDesde: fechaDesde || null,
    fechaHasta: fechaHasta || null,
    reservaDateWhere: Object.keys(fechaWhere).length > 0 ? { fecha: fechaWhere } : {}
  };
};

const getInclusiveDays = (fechaDesde, fechaHasta) => {
  if (!fechaDesde || !fechaHasta) {
    return null;
  }

  const from = new Date(`${fechaDesde}T00:00:00`);
  const to = new Date(`${fechaHasta}T00:00:00`);

  return Math.floor((to - from) / 86400000) + 1;
};

const normalizeGroupedCount = (rows, key) => {
  return rows.reduce((acc, row) => {
    acc[row[key]] = toNumber(row.get("total"));
    return acc;
  }, {});
};

const getPercentage = (value, total) => {
  if (!total) {
    return null;
  }

  return Math.round((toNumber(value) / total) * 100);
};

export const getGeneralReport = async (req, res, next) => {
  try {
    await expireStaleReservations();

    const today = getBusinessDateString();
    const { fechaDesde, fechaHasta, reservaDateWhere } = parseReportFilters(req.query);
    const activeReservaWhere = {
      ...reservaDateWhere,
      estado: {
        [Op.in]: activeReservaStates
      }
    };
    const pagoReservaInclude = {
      model: Reserva,
      attributes: [],
      where: reservaDateWhere,
      required: true
    };

    const [
      totalUsuarios,
      usuariosActivos,
      totalCanchas,
      canchasDisponibles,
      totalReservas,
      reservasActivas,
      reservasPorEstado,
      pagosPorEstado,
      ingresosAprobados,
      reservasPorCancha,
      reservasPorMomento,
      proximasReservas
    ] = await Promise.all([
      User.count(),
      User.count({ where: { activo: true } }),
      Cancha.count(),
      Cancha.count({ where: { disponible: true } }),
      Reserva.count({ where: reservaDateWhere }),
      Reserva.count({ where: activeReservaWhere }),
      Reserva.findAll({
        attributes: ["estado", [fn("COUNT", literal("*")), "total"]],
        where: reservaDateWhere,
        group: ["estado"]
      }),
      Pago.findAll({
        attributes: ["estado", [fn("COUNT", literal("*")), "total"]],
        include: [pagoReservaInclude],
        group: ["Pago.estado"]
      }),
      Pago.sum("monto", {
        where: { estado: "aprobado" },
        include: [pagoReservaInclude]
      }),
      Reserva.findAll({
        attributes: ["canchaId", [fn("COUNT", literal("*")), "total"]],
        include: [{ model: Cancha, attributes: ["id", "nombre"] }],
        where: activeReservaWhere,
        group: ["Reserva.canchaId", "Cancha.id"],
        order: [[literal("total"), "DESC"]],
        limit: 5
      }),
      Reserva.findAll({
        attributes: ["momento", [fn("COUNT", literal("*")), "total"]],
        where: activeReservaWhere,
        group: ["momento"]
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
          estado: ["pendiente_pago", "confirmada"],
          fecha: {
            [Op.gte]: today
          }
        },
        order: [
          ["fecha", "ASC"],
          ["id", "ASC"]
        ],
        limit: 8
      })
    ]);
    const diasPeriodo = getInclusiveDays(fechaDesde, fechaHasta);
    const capacidadTurnosPeriodo = diasPeriodo ? diasPeriodo * totalCanchas * momentos.length : null;
    const capacidadTurnosPorCancha = diasPeriodo ? diasPeriodo * momentos.length : null;

    return res.json({
      filtros: {
        fechaDesde,
        fechaHasta,
        diasPeriodo
      },
      resumen: {
        totalUsuarios,
        usuariosActivos,
        totalCanchas,
        canchasDisponibles,
        totalReservas,
        reservasActivas,
        capacidadTurnosPeriodo,
        ocupacionPromedio: getPercentage(reservasActivas, capacidadTurnosPeriodo),
        ingresosAprobados: toNumber(ingresosAprobados)
      },
      reservasPorEstado: normalizeGroupedCount(reservasPorEstado, "estado"),
      pagosPorEstado: normalizeGroupedCount(pagosPorEstado, "estado"),
      reservasPorCancha: reservasPorCancha.map((reserva) => ({
        canchaId: reserva.canchaId,
        cancha: reserva.Cancha?.nombre || "Cancha",
        total: toNumber(reserva.get("total")),
        ocupacionPorcentaje: getPercentage(reserva.get("total"), capacidadTurnosPorCancha)
      })),
      reservasPorMomento: normalizeGroupedCount(reservasPorMomento, "momento"),
      proximasReservas
    });
  } catch (error) {
    return next(error);
  }
};
