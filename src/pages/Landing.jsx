import { Link } from 'react-router-dom';
import { Camera, Store, Trophy, Activity, Users, MapPin } from 'lucide-react';
import './Landing.css';
import logo from "../assets/Leaf and Life logo.png";

export default function Landing() {
  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
          {/* <img src="Leaf and Life logo.png" alt="Leaf and Life" className="app-logo" /> */}
          <img src={logo} alt="Leaf and Life" className="app-logo" />
          <span className="logo-text">Leaf and Life</span>
        </Link>
        <nav className="desktop-nav">
          <Link to="#features">Features</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="#community">Community</Link>
        </nav>
        <div className="auth-buttons">
          <button className="btn-text">Log in</button>
          <Link to="/dashboard" className="btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="badge">
            <span className="sparkle">✨</span> AI-Powered Plant Care
          </div>
          <h1 className="hero-title">
            Grow smarter.<br />
            <span className="text-primary">Breathe better.</span>
          </h1>
          <p className="hero-subtitle">
            Identify plants instantly, find the perfect spot in your home, and connect with local plant lovers to buy, sell, or swap. Your personal botanical assistant is here.
          </p>
          <div className="hero-actions">
            <Link to="/scan" className="btn-primary btn-large">
              <Camera size={20} />
              <span>Scan a Plant</span>
            </Link>
            <Link to="/marketplace" className="btn-secondary btn-large">
              Explore Marketplace
            </Link>
          </div>
          <div className="social-proof">
            <div className="avatars">
              <div className="avatar">👩</div>
              <div className="avatar">👨</div>
              <div className="avatar">🧑</div>
            </div>
            <p>Join <strong>10,000+</strong> plant parents</p>
          </div>
        </div>
        <div className="hero-image-container">
          <div className="hero-image">
            <img src="https://images.unsplash.com/photo-1604762524889-3e2fcc145683?auto=format&fit=crop&w=800&q=80" alt="Beautiful indoor plants" />
          </div>
          {/* Floating cards */}
          <div className="floating-card air-quality">
            <Activity size={16} />
            <div>
              <span className="label">Air Quality</span>
              <span className="value">+15% Improved</span>
            </div>
          </div>
          <div className="floating-card hyperlocal">
            <MapPin size={16} color="var(--accent)" />
            <div>
              <span className="label">Hyperlocal</span>
              <span className="value">24 Swaps Nearby</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="features-header">
          <h2>Everything your plants need, all in one place.</h2>
          <p>From intelligent identification to finding a new home for your cuttings, Leaf and Life builds a sustainable ecosystem for you and your plants.</p>
        </div>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon" style={{color: 'var(--primary)', backgroundColor: 'var(--primary-light)'}}>
              <Camera size={24} />
            </div>
            <h3>AI Identification</h3>
            <p>Snap a photo and instantly know your plant's name, needs, and ideal location in your home based on light and space.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{color: '#34d399', backgroundColor: '#ecfdf5'}}>
              <Store size={24} />
            </div>
            <h3>Hyperlocal Marketplace</h3>
            <p>Buy, sell, swap, or thrift plants with people in your neighborhood. Support local nurseries and reduce waste.</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon" style={{color: 'var(--accent)', backgroundColor: '#fff1f2'}}>
              <Trophy size={24} />
            </div>
            <h3>Community Rewards</h3>
            <p>Track your air quality impact, join eco-challenges, and earn badges for sustainable plant parenting.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
