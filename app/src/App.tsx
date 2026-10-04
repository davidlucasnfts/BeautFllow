import { Routes, Route } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Appointments from "./pages/Appointments";
import Services from "./pages/Services";
import Professionals from "./pages/Professionals";
import Financial from "./pages/Financial";
import Products from "./pages/Products";
import Communications from "./pages/Communications";
import Consent from "./pages/Consent";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import Proposal from "./pages/Proposal";
import PublicBooking from "./pages/PublicBooking";
import ResetPassword from "./pages/ResetPassword";
import InviteAccept from "./pages/InviteAccept";
import AuthLayout from "./components/AuthLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import type { PermissionArea } from "@contracts/permissions";
import type { ReactNode } from "react";

function privateRoute(area: PermissionArea, children: ReactNode) {
  return (
    <AuthLayout>
      <ProtectedRoute area={area}>{children}</ProtectedRoute>
    </AuthLayout>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/proposta" element={<Proposal />} />
      <Route path="/agendar/:slug" element={<PublicBooking />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route path="/convite" element={<InviteAccept />} />
      <Route
        path="/dashboard"
        element={privateRoute("dashboard", <Dashboard />)}
      />
      <Route path="/clients" element={privateRoute("clients", <Clients />)} />
      <Route
        path="/appointments"
        element={privateRoute("appointments", <Appointments />)}
      />
      <Route
        path="/services"
        element={privateRoute("services", <Services />)}
      />
      <Route
        path="/professionals"
        element={privateRoute("professionals", <Professionals />)}
      />
      <Route path="/products" element={privateRoute("products", <Products />)} />
      <Route
        path="/financial"
        element={privateRoute("financial", <Financial />)}
      />
      <Route
        path="/communications"
        element={privateRoute("communications", <Communications />)}
      />
      <Route path="/consent" element={privateRoute("consent", <Consent />)} />
      <Route path="/equipe" element={privateRoute("team", <Team />)} />
      <Route
        path="/settings"
        element={privateRoute("settings", <Settings />)}
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
