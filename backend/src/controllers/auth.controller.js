import { User } from "../models/index.js";
import { comparePassword, createToken, hashPassword } from "../services/auth.service.js";
import { httpError } from "../utils/httpError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

export const register = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw httpError(409, "Ya existe un usuario con ese email");
    }

    const user = await User.create({
      nombre,
      apellido,
      email: normalizedEmail,
      password: await hashPassword(password),
      rol: "cliente"
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Usuario registrado correctamente",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ where: { email: normalizedEmail } });

    if (!user || !user.activo) {
      throw httpError(401, "Credenciales invalidas");
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      throw httpError(401, "Credenciales invalidas");
    }

    const token = createToken(user);

    return res.json({
      message: "Login correcto",
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

export const me = (req, res) => {
  res.json({
    user: sanitizeUser(req.user)
  });
};

