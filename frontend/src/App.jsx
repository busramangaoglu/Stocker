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
      {/* Windows 2000-style status bar */}
      <footer
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '22px',
          background: '#d4d0c8',
          borderTop: '1px solid #808080',
          display: 'flex',
          alignItems: 'center',
          padding: '0 6px',
          gap: '1px',
          zIndex: 100,
          fontFamily: "'Tahoma','MS Sans Serif',Arial,sans-serif",
          fontSize: '11px',
          color: '#000',
        }}
      >
        <div
          style={{
            flex: 1,
            paddingLeft: 4,
            borderRight: '1px solid #808080',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff',
          }}
        >
          Stocker — Envanter Yönetim Sistemi
        </div>
        <div
          style={{
            paddingLeft: 8,
            paddingRight: 4,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff',
            minWidth: 120,
          }}
        >
          Hazır
        </div>
        <div
          style={{
            paddingLeft: 8,
            paddingRight: 4,
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            boxShadow: 'inset 1px 1px 0 #808080, inset -1px -1px 0 #fff',
            minWidth: 80,
          }}
        >
          {new Date().toLocaleDateString('tr-TR')}
        </div>
      </footer>
    </div>
  );
}
