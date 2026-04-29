import { Op } from "sequelize";
import { Cancha, Pago, Reserva, sequelize } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

const RESERVA_TOLERANCIA_MINUTOS = 15;
const ACTIVE_RESERVA_ESTADOS = ["pendiente_pago", "confirmada"];

export const getReservaVencimiento = () => {
  const venceEn = new Date();
  venceEn.setMinutes(venceEn.getMinutes() + RESERVA_TOLERANCIA_MINUTOS);
  return venceEn;
};

export const expirePendingReservations = async () => {
  const expiredReservas = await Reserva.findAll({
    attributes: ["id"],
    where: {
      estado: "pendiente_pago",
      venceEn: {
        [Op.lt]: new Date()
      }
    }
  });

  const expiredReservaIds = expiredReservas.map((reserva) => reserva.id);

  if (expiredReservaIds.length === 0) {
    return;
  }

  await Reserva.update(
    { estado: "vencida" },
    {
      where: {
        id: {
          [Op.in]: expiredReservaIds
        }
      }
    }
  );

  await Pago.update(
    { estado: "cancelado" },
    {
      where: {
        reservaId: {
          [Op.in]: expiredReservaIds
        },
        estado: "pendiente"
      }
    }
  );
};

export const assertTurnoDisponible = async ({ canchaId, fecha, momento, excludeReservaId, transaction }) => {
  await expirePendingReservations();

  const existingReserva = await Reserva.findOne({
    where: {
      canchaId,
      fecha,
      momento,
      estado: {
        [Op.in]: ACTIVE_RESERVA_ESTADOS
      },
      ...(excludeReservaId ? { id: { [Op.ne]: excludeReservaId } } : {})
    },
    transaction
  });

  if (existingReserva) {
    throw httpError(409, "La cancha ya esta reservada para esa fecha y momento");
  }
};

export const createReservaWithRules = async ({ usuarioId, canchaId, fecha, momento, estado }) => {
  return sequelize.transaction(async (transaction) => {
    const cancha = await Cancha.findByPk(canchaId, { transaction });

    if (!cancha || !cancha.disponible) {
      throw httpError(404, "Cancha no disponible");
    }

    await assertTurnoDisponible({ canchaId, fecha, momento, transaction });

    const reserva = await Reserva.create(
      {
        usuarioId,
        canchaId,
        fecha,
        momento,
        estado,
        precioFinal: cancha.precio,
        venceEn: estado === "pendiente_pago" ? getReservaVencimiento() : null
      },
      { transaction }
    );

    await Pago.create(
      {
        reservaId: reserva.id,
        estado: estado === "confirmada" ? "aprobado" : "pendiente",
        monto: cancha.precio,
        metodo: estado === "confirmada" ? "manual" : null
      },
      { transaction }
    );

    return reserva;
  });
};

export const updateReservaWithRules = async ({ reservaId, usuarioId, canchaId, fecha, momento, estado }) => {
  return sequelize.transaction(async (transaction) => {
    const reserva = await Reserva.findByPk(reservaId, { transaction });

    if (!reserva) {
      throw httpError(404, "Reserva no encontrada");
    }

    if (!ACTIVE_RESERVA_ESTADOS.includes(reserva.estado)) {
      throw httpError(409, "La reserva no se puede editar en su estado actual");
    }

    const cancha = await Cancha.findByPk(canchaId, { transaction });

    if (!cancha || !cancha.disponible) {
      throw httpError(404, "Cancha no disponible");
    }

    await assertTurnoDisponible({
      canchaId,
      fecha,
      momento,
      excludeReservaId: reserva.id,
      transaction
    });

    const nextEstado = estado || reserva.estado;
    const nextVenceEn =
      nextEstado === "pendiente_pago"
        ? reserva.estado === "pendiente_pago" && reserva.venceEn && reserva.venceEn > new Date()
          ? reserva.venceEn
          : getReservaVencimiento()
        : null;

    await reserva.update(
      {
        usuarioId,
        canchaId,
        fecha,
        momento,
        estado: nextEstado,
        precioFinal: cancha.precio,
        venceEn: nextVenceEn
      },
      { transaction }
    );

    const [pago] = await Pago.findOrCreate({
      where: { reservaId: reserva.id },
      defaults: {
        reservaId: reserva.id,
        estado: nextEstado === "confirmada" ? "aprobado" : "pendiente",
        monto: cancha.precio,
        metodo: nextEstado === "confirmada" ? "manual" : null
      },
      transaction
    });

    await pago.update(
      {
        estado: nextEstado === "confirmada" ? "aprobado" : "pendiente",
        monto: cancha.precio,
        metodo: nextEstado === "confirmada" ? pago.metodo || "manual" : null
      },
      { transaction }
    );

    return reserva;
  });
};
