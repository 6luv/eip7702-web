import { createBrowserRouter } from "react-router-dom";
import AppShell from "../components/layout/AppShell";
import HomePage from "../pages/HomePage";
import RegisterPasskeyPage from "../pages/RegisterPasskeyPage";
import PaymentPage from "../pages/PaymentPage";
import SettingsPage from "../pages/SettingsPage";
import RequireWallet from "../components/auth/RequireWallet";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: "register-passkey",
        element: (
          <RequireWallet>
            <RegisterPasskeyPage />
          </RequireWallet>
        ),
      },
      {
        path: "payment",
        element: (
          <RequireWallet>
            <PaymentPage />
          </RequireWallet>
        ),
      },
      { path: "settings", element: <SettingsPage /> },
    ],
  },
]);
