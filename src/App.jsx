import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { InventoryProvider } from './context/InventoryContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { OrderProvider } from './context/OrderContext.jsx';
import AuthGate from './components/layout/AuthGate.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import CartDrawer from './components/customer/CartDrawer.jsx';
import LoginPage from './pages/LoginPage.jsx';
import ShopPage from './pages/ShopPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminInventory from './pages/AdminInventory.jsx';
import AdminOrders from './pages/AdminOrders.jsx';
import PickingPage from './pages/PickingPage.jsx';

function AppLayout({ children }) {
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} />
      {children}
      <Footer />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <InventoryProvider>
          <CartProvider>
            <OrderProvider>
              <Routes>
                {/* Public route */}
                <Route path="/login" element={<LoginPage />} />

                {/* Customer routes */}
                <Route path="/" element={
                  <AuthGate>
                    <AppLayout><ShopPage /></AppLayout>
                  </AuthGate>
                } />
                <Route path="/checkout" element={
                  <AuthGate>
                    <AppLayout><CheckoutPage /></AppLayout>
                  </AuthGate>
                } />

                {/* Admin routes */}
                <Route path="/admin" element={
                  <AuthGate requireStaff>
                    <AppLayout><AdminDashboard /></AppLayout>
                  </AuthGate>
                } />
                <Route path="/admin/inventory" element={
                  <AuthGate requireStaff>
                    <AppLayout><AdminInventory /></AppLayout>
                  </AuthGate>
                } />
                <Route path="/admin/orders" element={
                  <AuthGate requireStaff>
                    <AppLayout><AdminOrders /></AppLayout>
                  </AuthGate>
                } />

                {/* Picking route */}
                <Route path="/picking" element={
                  <AuthGate requireStaff>
                    <AppLayout><PickingPage /></AppLayout>
                  </AuthGate>
                } />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </OrderProvider>
          </CartProvider>
        </InventoryProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
