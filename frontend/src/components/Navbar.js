import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Microscope, Menu, X, Zap } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/', label: 'Home' },
    { to: '/detect', label: 'Detect' },
    { to: '/about', label: 'About' },
    { to: '/idea', label: 'Idea' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Microscope size={22} color="var(--primary)" strokeWidth={2} />
        <span className="brand-text">DocAI</span>
      </div>

      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <X size={22} color="var(--text)" /> : <Menu size={22} color="var(--text)" />}
      </button>

      <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className={location.pathname === to ? 'active' : ''}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/detect" className="nav-cta" onClick={() => setMenuOpen(false)}>
            <Zap size={14} strokeWidth={2.5} />
            Try Now
          </Link>
        </li>
      </ul>
    </nav>
  );
}
