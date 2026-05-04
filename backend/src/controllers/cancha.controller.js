import { Op } from "sequelize";
import { Cancha, Reserva } from "../models/index.js";
import { expireStaleReservations } from "../services/reserva.service.js";
import { httpError } from "../utils/httpError.js";

const momentos = ["manana", "tarde", "noche"];
const activeReservaStates = ["pendiente_pago", "confirmada"];

const normalizeCanchaPayload = (body) => ({
  nombre: body.nombre?.trim(),
  tipo: body.tipo,
  descripcion: body.descripcion?.trim() || null,
  precio: body.precio,
  disponible: body.disponible ?? true,
  imagen: body.imagen?.trim() || null
});

export const getCanchas = async (req, res, next) => {
  try {
    const includeInactive = req.query.incluirNoDisponibles === "true";
    const canViewInactive = ["admin", "super_admin"].includes(req.user?.rol);

    if (includeInactive && !canViewInactive) {
      throw httpError(403, "No tenes permisos para ver canchas no disponibles");
    }

    const where = includeInactive ? {} : { disponible: true };
    const canchas = await Cancha.findAll({
      where,
      order: [
        ["disponible", "DESC"],
        ["id", "ASC"]
      ]
    });

    return res.json({ canchas });
  } catch (error) {
    return next(error);
  }
};

export const getCanchaById = async (req, res, next) => {
  try {
    const cancha = await Cancha.findByPk(req.params.id);

    if (!cancha) {
      throw httpError(404, "Cancha no encontrada");
    }

    const canViewInactive = ["admin", "super_admin"].includes(req.user?.rol);

    if (!cancha.disponible && !canViewInactive) {
      throw httpError(404, "Cancha no encontrada");
    }

    return res.json({ cancha });
  } catch (error) {
    return next(error);
  }
};

export const getCanchaDisponibilidad = async (req, res, next) => {
  try {
    await expireStaleReservations();

    const cancha = await Cancha.findByPk(req.params.id);

    if (!cancha || !cancha.disponible) {
      throw httpError(404, "Cancha no encontrada");
    }

    const reservas = await Reserva.findAll({
      attributes: ["momento"],
      where: {
        canchaId: cancha.id,
        fecha: req.query.fecha,
        estado: {
          [Op.in]: activeReservaStates
        }
      }
    });
    const ocupados = reservas.map((reserva) => reserva.momento);
    const disponibles = momentos.filter((momento) => !ocupados.includes(momento));

    return res.json({
      canchaId: cancha.id,
      fecha: req.query.fecha,
      momentos,
      ocupados,
      disponibles
    });
  } catch (error) {
    return next(error);
  }
};

export const createCancha = async (req, res, next) => {
  try {
    const cancha = await Cancha.create(normalizeCanchaPayload(req.body));

    return res.status(201).json({
      message: "Cancha creada correctamente",
      cancha
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCancha = async (req, res, next) => {
  try {
    const cancha = await Cancha.findByPk(req.params.id);

    if (!cancha) {
      throw httpError(404, "Cancha no encontrada");
    }

    await cancha.update(normalizeCanchaPayload(req.body));

    return res.json({
      message: "Cancha actualizada correctamente",
      cancha
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteCancha = async (req, res, next) => {
  try {
    await expireStaleReservations();

    const cancha = await Cancha.findByPk(req.params.id);

    if (!cancha) {
      throw httpError(404, "Cancha no encontrada");
    }

    const activeReserva = await Reserva.findOne({
      where: {
        canchaId: cancha.id,
        estado: {
          [Op.in]: ["pendiente_pago", "confirmada"]
        }
      }
    });

    if (activeReserva) {
      throw httpError(409, "No se puede eliminar una cancha con reservas activas");
    }

    const reservasCount = await Reserva.count({
      where: {
        canchaId: cancha.id
      }
    });

    if (reservasCount === 0) {
      await cancha.destroy();

      return res.json({
        message: "Cancha eliminada correctamente",
        canchaId: Number(req.params.id)
      });
    }

    await cancha.update({ disponible: false });

    return res.json({
      message: "Cancha dada de baja correctamente. Se conserva por tener reservas historicas.",
      cancha
    });
  } catch (error) {
    return next(error);
  }
};
