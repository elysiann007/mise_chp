import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import QRScanner from './pages/customer/QRScanner/QRScanner'
import Menu from './pages/customer/Menu/Menu'
import Cart from './pages/customer/Cart/Cart'
import OrderTracking from './pages/customer/OrderTracking/OrderTracking'
import Login from './pages/staff/Login/Login'
import Kitchen from './pages/staff/Kitchen/Kitchen'
import AdminLayout from './pages/admin/AdminLayout'
import Dashboard from './pages/admin/Dashboard'
import MenuManager from './pages/admin/MenuManager'
import TableManager from './pages/admin/TableManager'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" richColors closeButton />
      <Routes>
        <Route path="/" element={<QRScanner />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute roles={['kitchen', 'bar', 'admin']}>
              <Kitchen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="menu" element={<MenuManager />} />
          <Route path="tables" element={<TableManager />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
