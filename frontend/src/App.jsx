import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import StockMovementsPage from './pages/StockMovementsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

export default function App() {
  return (
    <div className="appShell">
      <TopNav />
      <main className="appMain">
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/products" element={<Navigate to="/" replace />} />
          <Route path="/urun" element={<Navigate to="/" replace />} />
          <Route path="/ürün" element={<Navigate to="/" replace />} />
          <Route path="/urunler" element={<Navigate to="/" replace />} />
          <Route path="/ürünler" element={<Navigate to="/" replace />} />
          <Route path="/stock-movements" element={<StockMovementsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
