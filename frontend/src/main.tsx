import React from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginForm from "./components/auth/LoginForm";
import { UserRole } from "./types/auth";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import AdminPage from "./pages/AdminPage";
import ExportManagerPage from "./pages/ExportManagerPage";
import NotFoundPage from "./pages/NotFoundPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import UserManagementPage from "./pages/UserManagementPage";
import MainLayout from "./layouts/MainLayout";
import "./index.css";
import LogsPage from "./pages/LogsPage";
import SalesChannelsPage from "./pages/SalesChannelsPage";

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomePage /> },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "logs",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
            <LogsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "export-manager",
        element: (
          <ProtectedRoute
            allowedRoles={[
              UserRole.EXPORT_MANAGER,
              UserRole.ADMIN,
              UserRole.SUPER_ADMIN,
            ]}
          >
            <ExportManagerPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "sales-channels",
        element: (
          <ProtectedRoute allowedRoles={[UserRole.DISTRIBUTOR, UserRole.EXPORT_MANAGER, UserRole.ADMIN, UserRole.SUPER_ADMIN]}>
            <SalesChannelsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "users",
        element: (
          <ProtectedRoute
            allowedRoles={[
              UserRole.DISTRIBUTOR,
              UserRole.EXPORT_MANAGER,
              UserRole.ADMIN,
              UserRole.SUPER_ADMIN,
            ]}
          >
            <UserManagementPage />
          </ProtectedRoute>
        ),
      },
      { path: "login", element: <LoginForm /> },
      { path: "change-password", element: <ChangePasswordPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
