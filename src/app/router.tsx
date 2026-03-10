import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPasskeyPage from "../pages/RegisterPasskeyPage";
import PaymentPage from "../pages/PaymentPage";
import SettingsPage from "../pages/SettingsPage";
import RequireAuth from "../components/auth/RequireAuth";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      {
        path: "register-passkey",
        element: (
          <RequireAuth>
            <RegisterPasskeyPage />
          </RequireAuth>
        ),
      },
      {
        path: "payment",
        element: (
          <RequireAuth>
            <PaymentPage />
          </RequireAuth>
        ),
      },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
