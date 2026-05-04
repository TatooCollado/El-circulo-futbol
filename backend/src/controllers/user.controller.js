import { literal } from "sequelize";
import { User } from "../models/index.js";
import { hashPassword } from "../services/auth.service.js";
import { httpError } from "../utils/httpError.js";
import { sanitizeUser } from "../utils/sanitizeUser.js";

const normalizeEmail = (email) => email.toLowerCase().trim();
const roleOrder = literal("CASE rol WHEN 'super_admin' THEN 1 WHEN 'admin' THEN 2 WHEN 'cliente' THEN 3 ELSE 4 END");

export const getUsers = async (req, res, next) => {
  try {
    const includeInactive = req.query.incluirInactivos === "true";
    const where = includeInactive ? {} : { activo: true };
    const users = await User.findAll({
      where,
      order: [
        ["activo", "DESC"],
        [roleOrder, "ASC"],
        ["apellido", "ASC"],
        ["nombre", "ASC"],
        ["id", "ASC"]
      ]
    });

    return res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    return next(error);
  }
};

export const getClientes = async (req, res, next) => {
  try {
    const clientes = await User.findAll({
      where: {
        rol: "cliente",
        activo: true
      },
      attributes: ["id", "nombre", "apellido", "email", "activo", "createdAt"],
      order: [
        ["activo", "DESC"],
        ["apellido", "ASC"],
        ["nombre", "ASC"],
        ["id", "ASC"]
      ]
    });

    return res.json({ clientes });
  } catch (error) {
    return next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw httpError(404, "Usuario no encontrado");
    }

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password, rol, activo = true } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw httpError(409, "Ya existe un usuario con ese email");
    }

    const user = await User.create({
      nombre,
      apellido,
      email: normalizedEmail,
      password: await hashPassword(password),
      rol,
      activo
    });

    return res.status(201).json({
      message: "Usuario creado correctamente",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

export const createCliente = async (req, res, next) => {
  try {
    const { nombre, apellido, email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      throw httpError(409, "Ya existe un usuario con ese email");
    }

    const cliente = await User.create({
      nombre,
      apellido,
      email: normalizedEmail,
      password: await hashPassword(password),
      rol: "cliente",
      activo: true
    });

    return res.status(201).json({
      message: "Cliente creado correctamente",
      cliente: {
        id: cliente.id,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email,
        activo: cliente.activo,
        createdAt: cliente.createdAt
      }
    });
  } catch (error) {
    return next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw httpError(404, "Usuario no encontrado");
    }

    const { nombre, apellido, email, password, rol, activo } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser && existingUser.id !== user.id) {
      throw httpError(409, "Ya existe otro usuario con ese email");
    }

    if (user.id === req.user.id && (rol !== user.rol || activo === false)) {
      throw httpError(409, "No podes cambiar tu propio rol ni desactivar tu usuario");
    }

    await user.update({
      nombre,
      apellido,
      email: normalizedEmail,
      rol,
      activo,
      ...(password ? { password: await hashPassword(password) } : {})
    });

    return res.json({
      message: "Usuario actualizado correctamente",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      throw httpError(404, "Usuario no encontrado");
    }

    if (user.id === req.user.id) {
      throw httpError(409, "No podes darte de baja a vos mismo");
    }

    await user.update({ activo: false });

    return res.json({
      message: "Usuario dado de baja correctamente",
      user: sanitizeUser(user)
    });
  } catch (error) {
    return next(error);
  }
};
