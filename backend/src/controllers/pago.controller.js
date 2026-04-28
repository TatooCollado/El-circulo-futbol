import { Cancha, Pago, Reserva, User } from "../models/index.js";
import { httpError } from "../utils/httpError.js";

const pagoInclude = [
  {
    model: Reserva,
    include: [
      {
        model: User,
        attributes: ["id", "nombre", "apellido", "email", "rol"]
      },
      {
        model: Cancha
      }
    ]
  }
];

const canManagePagos = (user) => ["admin", "super_admin"].includes(user?.rol);

const assertPagoAccess = (req, pago) => {
  if (!canManagePagos(req.user) && pago.Reserva?.usuarioId !== req.user.id) {
    throw httpError(403, "No tenes permisos para operar este pago");
  }
};

const ensureReservaActivaParaPago = async (reserva, pago) => {
  if (reserva.estado !== "pendiente_pago") {
    throw httpError(409, "La reserva no se encuentra pendiente de pago");
  }

  if (reserva.venceEn && reserva.venceEn < new Date()) {
    await reserva.update({ estado: "vencida", venceEn: null });
    await pago.update({ estado: "cancelado" });
    throw httpError(409, "La reserva ya vencio");
  }
};

export const getPagoById = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.params.id, { include: pagoInclude });

    if (!pago) {
      throw httpError(404, "Pago no encontrado");
    }

    assertPagoAccess(req, pago);

    return res.json({ pago });
  } catch (error) {
    return next(error);
  }
};

export const createPreferenciaPago = async (req, res, next) => {
  try {
    const reserva = await Reserva.findByPk(req.body.reservaId, {
      include: [{ model: Pago }, { model: Cancha }]
    });

    if (!reserva || !reserva.Pago) {
      throw httpError(404, "Reserva o pago no encontrado");
    }

    if (!canManagePagos(req.user) && reserva.usuarioId !== req.user.id) {
      throw httpError(403, "No tenes permisos para operar esta reserva");
    }

    await ensureReservaActivaParaPago(reserva, reserva.Pago);

    const preferenceId = reserva.Pago.mercadoPagoPreferenceId || `demo-pref-${reserva.Pago.id}`;

    await reserva.Pago.update({
      mercadoPagoPreferenceId: preferenceId,
      metodo: "simulado"
    });

    return res.json({
      message: "Preferencia de pago simulada creada correctamente",
      pago: reserva.Pago,
      checkoutUrl: `/pago/simulado/${reserva.Pago.id}`
    });
  } catch (error) {
    return next(error);
  }
};

export const simulatePago = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.params.id, { include: pagoInclude });

    if (!pago) {
      throw httpError(404, "Pago no encontrado");
    }

    assertPagoAccess(req, pago);

    if (pago.estado !== "pendiente") {
      throw httpError(409, "El pago ya fue procesado");
    }

    await ensureReservaActivaParaPago(pago.Reserva, pago);

    const { resultado } = req.body;

    if (resultado === "pendiente") {
      return res.json({
        message: "El pago continua pendiente",
        pago
      });
    }

    if (resultado === "aprobado") {
      await pago.update({
        estado: "aprobado",
        metodo: "simulado",
        mercadoPagoPaymentId: `SIM-${Date.now()}`
      });
      await pago.Reserva.update({ estado: "confirmada", venceEn: null });
    }

    if (resultado === "rechazado") {
      await pago.update({
        estado: "rechazado",
        metodo: "simulado",
        mercadoPagoPaymentId: `SIM-${Date.now()}`
      });
      await pago.Reserva.update({ estado: "rechazada", venceEn: null });
    }

    const pagoActualizado = await Pago.findByPk(pago.id, { include: pagoInclude });

    return res.json({
      message: "Pago simulado procesado correctamente",
      pago: pagoActualizado
    });
  } catch (error) {
    return next(error);
  }
};

export const receiveWebhook = (req, res) => {
  return res.json({ message: "Webhook recibido en modo demo" });
};

