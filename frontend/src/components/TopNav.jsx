import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import brandLogo from '../assets/brand-logo.png';
import './TopNav.css';

const links = [
  { to: '/', label: 'Ürünler', end: true },
  { to: '/stock-movements', label: 'Stok hareketleri' },
  { to: '/reports', label: 'Kritik eşik' },
  { to: '/dashboard', label: 'Özet' },
];

export default function TopNav() {
  return (
    <header className="topNav">
      <div className="topNavInner">
        <Link to="/" className="brand">
          <span className="brandLogoWrap" aria-hidden>
            <img src={brandLogo} alt="" className="brandLogo" decoding="async" />
          </span>
          <div className="brandText">
            Stocker
            <span>Envanter</span>
          </div>
        </Link>
        <nav className="navLinks">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => (isActive ? 'navLink active' : 'navLink')}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
