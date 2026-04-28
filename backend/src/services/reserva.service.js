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
