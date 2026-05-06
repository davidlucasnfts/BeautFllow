import { Routes, Route } from 'react-router'
import Home from './pages/Home'
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"
import Dashboard from "./pages/Dashboard"
import Clients from "./pages/Clients"
import Appointments from "./pages/Appointments"
import Services from "./pages/Services"
import Professionals from "./pages/Professionals"
import Financial from "./pages/Financial"
import Communications from "./pages/Communications"
import Consent from "./pages/Consent"
import AuthLayout from "./components/AuthLayout"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<AuthLayout><Dashboard /></AuthLayout>} />
      <Route path="/clients" element={<AuthLayout><Clients /></AuthLayout>} />
      <Route path="/appointments" element={<AuthLayout><Appointments /></AuthLayout>} />
      <Route path="/services" element={<AuthLayout><Services /></AuthLayout>} />
      <Route path="/professionals" element={<AuthLayout><Professionals /></AuthLayout>} />
      <Route path="/financial" element={<AuthLayout><Financial /></AuthLayout>} />
      <Route path="/communications" element={<AuthLayout><Communications /></AuthLayout>} />
      <Route path="/consent" element={<AuthLayout><Consent /></AuthLayout>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
