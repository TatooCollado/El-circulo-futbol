import { Op } from "sequelize";
import { Cancha, Pago, Reserva, User } from "../models/index.js";
import { createReservaWithRules, expirePendingReservations } from "../services/reserva.service.js";
import { httpError } from "../utils/httpError.js";

const reservaInclude = [
  {
    model: User,
    attributes: ["id", "nombre", "apellido", "email", "rol"]
  },
  {
    model: Cancha
  },
  {
    model: Pago
  }
];

const canManageReservas = (user) => ["admin", "super_admin"].includes(user?.rol);

export const getReservas = async (req, res, next) => {
  try {
    await expirePendingReservations();

    const where = canManageReservas(req.user) ? {} : { usuarioId: req.user.id };
    const reservas = await Reserva.findAll({
      where,
      include: reservaInclude,
      order: [
        ["fecha", "DESC"],
        ["id", "DESC"]
      ]
    });

    return res.json({ reservas });
  } catch (error) {
    return next(error);
  }
};

export const getMisReservas = async (req, res, next) => {
  try {
    await expirePendingReservations();

    const reservas = await Reserva.findAll({
      where: { usuarioId: req.user.id },
      include: reservaInclude,
      order: [
        ["fecha", "DESC"],
        ["id", "DESC"]
      ]
    });

    return res.json({ reservas });
  } catch (error) {
    return next(error);
  }
};

export const getClientesParaReserva = async (req, res, next) => {
  try {
    const clientes = await User.findAll({
      where: {
        rol: "cliente",
        activo: true
      },
      attributes: ["id", "nombre", "apellido", "email"],
      order: [
        ["apellido", "ASC"],
        ["nombre", "ASC"]
      ]
    });

    return res.json({ clientes });
  } catch (error) {
    return next(error);
  }
};

export const createReserva = async (req, res, next) => {
  try {
    const reserva = await createReservaWithRules({
      usuarioId: req.user.id,
      canchaId: req.body.canchaId,
      fecha: req.body.fecha,
      momento: req.body.momento,
      estado: "pendiente_pago"
    });

    const reservaCompleta = await Reserva.findByPk(reserva.id, { include: reservaInclude });

    return res.status(201).json({
      message: "Reserva creada correctamente",
      reserva: reservaCompleta
    });
  } catch (error) {
    return next(error);
  }
};

export const createReservaAdmin = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.body.usuarioId);

    if (!user || !user.activo || user.rol !== "cliente") {
      throw httpError(404, "Usuario no encontrado");
    }

    const reserva = await createReservaWithRules({
      usuarioId: req.body.usuarioId,
      canchaId: req.body.canchaId,
      fecha: req.body.fecha,
      momento: req.body.momento,
      estado: req.body.estado || "confirmada"
    });

    const reservaCompleta = await Reserva.findByPk(reserva.id, { include: reservaInclude });

    return res.status(201).json({
      message: "Reserva creada correctamente",
      reserva: reservaCompleta
    });
  } catch (error) {
    return next(error);
  }
};

export const cancelReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, { include: reservaInclude });

    if (!reserva) {
      throw httpError(404, "Reserva no encontrada");
    }

    if (!canManageReservas(req.user) && reserva.usuarioId !== req.user.id) {
      throw httpError(403, "No tenes permisos para cancelar esta reserva");
    }

    if (!["pendiente_pago", "confirmada"].includes(reserva.estado)) {
      throw httpError(409, "La reserva no se puede cancelar en su estado actual");
    }

    await reserva.update({ estado: "cancelada", venceEn: null });

    if (reserva.Pago && reserva.Pago.estado === "pendiente") {
      await reserva.Pago.update({ estado: "cancelado" });
    }

    return res.json({
      message: "Reserva cancelada correctamente",
      reserva
    });
  } catch (error) {
    return next(error);
  }
};

export const confirmReserva = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByPk(req.params.id, { include: reservaInclude });

    if (!reserva) {
      throw httpError(404, "Reserva no encontrada");
    }

    if (!["pendiente_pago", "confirmada"].includes(reserva.estado)) {
      throw httpError(409, "La reserva no se puede confirmar en su estado actual");
    }

    if (reserva.venceEn && reserva.venceEn < new Date()) {
      await reserva.update({ estado: "vencida", venceEn: null });
      if (reserva.Pago && reserva.Pago.estado === "pendiente") {
        await reserva.Pago.update({ estado: "cancelado" });
      }
      throw httpError(409, "La reserva ya vencio");
    }

    const reservasPendientesMismoTurno = await Reserva.findAll({
      attributes: ["id"],
      where: {
        id: { [Op.ne]: reserva.id },
        canchaId: reserva.canchaId,
        fecha: reserva.fecha,
        momento: reserva.momento,
        estado: "pendiente_pago"
      }
    });
    const reservasPendientesIds = reservasPendientesMismoTurno.map((item) => item.id);

    if (reservasPendientesIds.length > 0) {
      await Reserva.update(
        { estado: "vencida" },
        {
          where: {
            id: {
              [Op.in]: reservasPendientesIds
            }
          }
        }
      );

      await Pago.update(
        { estado: "cancelado" },
        {
          where: {
            reservaId: {
              [Op.in]: reservasPendientesIds
            },
            estado: "pendiente"
          }
        }
      );
    }

    await reserva.update({ estado: "confirmada", venceEn: null });

    if (reserva.Pago) {
      await reserva.Pago.update({
        estado: "aprobado",
        metodo: reserva.Pago.metodo || "manual"
      });
    }

    return res.json({
      message: "Reserva confirmada correctamente",
      reserva
    });
  } catch (error) {
    return next(error);
  }
};
