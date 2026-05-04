const roleLabels = {
  cliente: "Cliente",
  admin: "Admin",
  super_admin: "Super admin"
};

export const getRoleLabel = (rol) => roleLabels[rol] || "Sin rol";

export const getRoleHomePath = (rol) => {
  if (rol === "admin" || rol === "super_admin") {
    return "/admin";
  }

  return "/canchas";
};

export const canAccessPath = (rol, path = "") => {
  const cleanPath = path.split("?")[0] || "/";

  if (cleanPath === "/" || cleanPath === "/canchas") {
    return true;
  }

  if (rol === "cliente") {
    return cleanPath === "/mis-reservas" || cleanPath.startsWith("/reservar/");
  }

  if (rol === "admin") {
    return cleanPath === "/admin" || cleanPath === "/admin/usuarios" || cleanPath === "/admin/reportes";
  }

  if (rol === "super_admin") {
    return [
      "/admin",
      "/admin/usuarios",
      "/admin/reportes",
      "/super-admin/usuarios",
      "/super-admin/reportes"
    ].includes(cleanPath);
  }

  return false;
};

export const getRedirectAfterLogin = (rol, requestedPath) => {
  return canAccessPath(rol, requestedPath) ? requestedPath : getRoleHomePath(rol);
};
