import { Outlet, NavLink, Link } from 'react-router-dom';
import { Store, Camera, Trophy, LayoutDashboard } from 'lucide-react';
import './Layout.css';
import logo from "../assets/Leaf and Life logo.png";


export default function Layout() {
  return (
    <div className="app-container">
      {/* Top Navbar */}
      <header className="top-nav">
        <Link to="/" className="logo-link" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
          {/* <img src="/logo.png" alt="Leaf and Life" className="app-logo" /> */}
         {<img src={logo} alt="Leaf and Life" className="app-logo" />} 
          <h1 className="logo-text">Leaf and Life</h1>
        </Link>
        <div className="desktop-nav">
          <NavLink to="/marketplace" className={({isActive}) => isActive ? "desktop-nav-item active" : "desktop-nav-item"}>Marketplace</NavLink>
          <NavLink to="/scan" className={({isActive}) => isActive ? "desktop-nav-item active" : "desktop-nav-item"}>Smart Scan</NavLink>
          <NavLink to="/rewards" className={({isActive}) => isActive ? "desktop-nav-item active" : "desktop-nav-item"}>Community</NavLink>
          <NavLink to="/dashboard" className={({isActive}) => isActive ? "desktop-nav-item active" : "desktop-nav-item"}>Dashboard</NavLink>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="bottom-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <LayoutDashboard size={24} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/scan" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <div className="scan-btn">
            <Camera size={28} />
          </div>
          <span>Smart Scan</span>
        </NavLink>
        <NavLink to="/marketplace" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Store size={24} />
          <span>Market</span>
        </NavLink>
        <NavLink to="/rewards" className={({isActive}) => isActive ? "nav-item active" : "nav-item"}>
          <Trophy size={24} />
          <span>Community</span>
        </NavLink>
      </nav>
    </div>
  );
}
