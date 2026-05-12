import { Cancha, User, sequelize } from "../models/index.js";
import { hashPassword } from "../services/auth.service.js";

const users = [
  {
    nombre: "Super",
    apellido: "Admin",
    email: "superadmin@demo.com",
    password: "Demo1234",
    rol: "super_admin"
  },
  {
    nombre: "Admin",
    apellido: "Cancha",
    email: "admin@demo.com",
    password: "Demo1234",
    rol: "admin"
  },
  {
    nombre: "Cliente",
    apellido: "Demo",
    email: "cliente@demo.com",
    password: "Demo1234",
    rol: "cliente"
  }
];

const canchas = [
  {
    nombre: "Cancha 1",
    tipo: "futbol_5",
    descripcion: "Cancha sintética para fútbol 5.",
    precio: 18000,
    disponible: true
  },
  {
    nombre: "Cancha 2",
    tipo: "futbol_7",
    descripcion: "Cancha amplia para fútbol 7.",
    precio: 26000,
    disponible: true
  }
];

const seedUsers = async () => {
  for (const userData of users) {
    const [user, created] = await User.findOrCreate({
      where: { email: userData.email },
      defaults: {
        ...userData,
        password: await hashPassword(userData.password),
        activo: true
      }
    });

    if (!created) {
      await user.update({
        nombre: userData.nombre,
        apellido: userData.apellido,
        rol: userData.rol,
        activo: true
      });
    }
  }
};

const seedCanchas = async () => {
  for (const canchaData of canchas) {
    const [cancha, created] = await Cancha.findOrCreate({
      where: { nombre: canchaData.nombre },
      defaults: canchaData
    });

    if (!created) {
      await cancha.update(canchaData);
    }
  }
};

const seed = async () => {
  try {
    await sequelize.authenticate();
    await seedUsers();
    await seedCanchas();
    console.log("Datos iniciales cargados correctamente");
    console.log("Usuarios demo: superadmin@demo.com, admin@demo.com, cliente@demo.com");
    console.log("Contrasena demo para todos: Demo1234");
  } catch (error) {
    console.error("No se pudieron cargar los datos iniciales", error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
  }
};

seed();
