import { Cancha } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

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
      order: [["id", "ASC"]]
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
    const cancha = await Cancha.findByPk(req.params.id);

    if (!cancha) {
      throw httpError(404, "Cancha no encontrada");
    }

    await cancha.update({ disponible: false });

    return res.json({
      message: "Cancha dada de baja correctamente",
      cancha
    });
  } catch (error) {
    return next(error);
  }
};
