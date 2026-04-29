import { Route, Routes } from "react-router-dom";
import { MainLayout } from "./layouts/MainLayout.jsx";
import { AccessDeniedPage } from "./pages/AccessDeniedPage.jsx";
import { HomePage } from "./pages/HomePage.jsx";
import { LoginPage } from "./pages/LoginPage.jsx";
import { RegisterPage } from "./pages/RegisterPage.jsx";
import { CanchasPage } from "./pages/CanchasPage.jsx";
import { ReservarCanchaPage } from "./pages/ReservarCanchaPage.jsx";
import { MisReservasPage } from "./pages/MisReservasPage.jsx";
import { AdminDashboardPage } from "./pages/AdminDashboardPage.jsx";
import { SuperAdminUsersPage } from "./pages/SuperAdminUsersPage.jsx";
import { SuperAdminReportsPage } from "./pages/SuperAdminReportsPage.jsx";
import { NotFoundPage } from "./pages/NotFoundPage.jsx";
import { ProtectedRoute } from "./routes/ProtectedRoute.jsx";

export const App = () => {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<AccessDeniedPage />} />
        <Route path="/canchas" element={<CanchasPage />} />
        <Route
          path="/reservar/:canchaId"
          element={
            <ProtectedRoute allowedRoles={["cliente"]}>
              <ReservarCanchaPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mis-reservas"
          element={
            <ProtectedRoute allowedRoles={["cliente"]}>
              <MisReservasPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/usuarios"
          element={
            <ProtectedRoute allowedRoles={["super_admin"]}>
              <SuperAdminUsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/reportes"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <SuperAdminReportsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/super-admin/reportes"
          element={
            <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
              <SuperAdminReportsPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
