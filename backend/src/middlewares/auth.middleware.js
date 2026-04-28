import { User } from "../models/index.js";
import { verifyToken } from "../services/auth.service.js";
import { httpError } from "../utils/httpError.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw httpError(401, "Token requerido");
    }

    const token = authHeader.replace("Bearer ", "");
    const payload = verifyToken(token);
    const user = await User.findByPk(payload.id);

    if (!user || !user.activo) {
      throw httpError(401, "Usuario no autorizado");
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(httpError(401, "Token invalido o vencido"));
  }
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(httpError(401, "Usuario no autenticado"));
    }

    if (!allowedRoles.includes(req.user.rol)) {
      return next(httpError(403, "No tenes permisos para realizar esta accion"));
    }

    return next();
  };
};

