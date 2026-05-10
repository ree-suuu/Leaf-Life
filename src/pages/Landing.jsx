import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Store, Trophy, Activity, Users, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import './Landing.css';
import './Scan.css';
import logo from "../assets/Leaf and Life logo.png";

export default function Landing() {
  const [location, setLocation] = useState('');
  const [spaceType, setSpaceType] = useState('indoor');
  const [lightLevel, setLightLevel] = useState('2');
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            // Enhanced precision logic
            const address = data.address;
            const place = address.suburb || address.neighbourhood || address.city_district || address.village || address.town;
            const city = address.city || address.county || "";
            
            // Only join if place and city are different
            const cityName = place && city && place !== city ? `${place}, ${city}` : (place || city || "Nepal");
            
            setLocation(cityName);
          } catch (error) {
            console.error("Geocoding error:", error);
            setLocation("Kathmandu");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Location error", error);
          alert("Could not detect location. Please enter manually.");
          setLoading(false);
        }
      );
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const lightMap = { '1': 'Low', '2': 'Medium', '3': 'High' };
    const sunlight = lightMap[lightLevel];
    const spaceMap = { 'indoor': 'Indoor', 'rooftop': 'Rooftop', 'balcony': 'Balcony', 'garden': 'Rooftop' };
    const space = spaceMap[spaceType];

    try {
      const response = await fetch(`/api/recommend?space=${space}&sunlight=${sunlight}&location=${location}`);
      
      if (!response.ok) {
        const directResponse = await fetch(`http://localhost:5000/api/recommend?space=${space}&sunlight=${sunlight}&location=${location}`);
        if (!directResponse.ok) throw new Error('Recommendation failed');
        const data = await directResponse.json();
        setRecommendedPlants(data);
      } else {
        const data = await response.json();
        setRecommendedPlants(data);
      }
      setShowResults(true);
    } catch (error) {
      console.error('RECOMMENDATION ERROR:', error);
      alert(`Error: ${error.message}. Please ensure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <Link to="/" className="logo-section" style={{ textDecoration: 'none', color: 'inherit' }}>
          <img src={logo} alt="Leaf and Life" className="app-logo" />
          <span className="logo-text">Leaf and Life</span>
        </Link>
        <nav className="desktop-nav">
          <Link to="#features">Features</Link>
          <Link to="/marketplace">Marketplace</Link>
          <Link to="#community">Community</Link>
        </nav>
        <div className="auth-buttons">
          <Link to="/login" className="btn-text" style={{ textDecoration: 'none' }}>Log in</Link>
          <Link to="/signup" className="btn-primary">Get Started</Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
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

      {/* Space and Location Recommendation Section */}
      <section id="recommendation" className="features-section" style={{ paddingTop: '0', paddingBottom: '4rem' }}>
        <div className="features-header">
          <h2>Space & Location-Based Plant Recommendation</h2>
          <p>Tell us about your space, and we'll recommend the perfect plants for your environment. No photos required!</p>
        </div>
        
        <div className="recommendation-content" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'left' }}>
          {!showResults ? (
            <div className="location-form-container">
              <form onSubmit={handleRecommendationSubmit} className="smart-setup-form">
                <div className="form-group">
                  <label><span className="step-number">1</span> Where are you located?</label>
                  <div className="location-input-group">
                    <div className="input-with-icon">
                      <MapPin size={18} className="icon" />
                      <input 
                        type="text" 
                        placeholder="Enter city or zip code" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        required
                      />
                    </div>
                    <button type="button" className="btn-outline" onClick={requestLocation}>
                      <MapPin size={16} /> Use My Location
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label><span className="step-number">2</span> Where will your new plant live?</label>
                  <div className="space-grid">
                    <label className={`space-card ${spaceType === 'indoor' ? 'selected' : ''}`}>
                      <input type="radio" name="space" value="indoor" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'indoor'} />
                      <span className="emoji">🏠</span>
                      <span className="space-title">Indoor</span>
                      <span className="space-desc">Low light, stable temp</span>
                    </label>
                    <label className={`space-card ${spaceType === 'rooftop' ? 'selected' : ''}`}>
                      <input type="radio" name="space" value="rooftop" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'rooftop'} />
                      <span className="emoji">☀️</span>
                      <span className="space-title">Rooftop</span>
                      <span className="space-desc">Direct sun, high wind</span>
                    </label>
                    <label className={`space-card ${spaceType === 'balcony' ? 'selected' : ''}`}>
                      <input type="radio" name="space" value="balcony" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'balcony'} />
                      <span className="emoji">🪴</span>
                      <span className="space-title">Balcony</span>
                      <span className="space-desc">Partial shade</span>
                    </label>
                    <label className={`space-card ${spaceType === 'garden' ? 'selected' : ''}`}>
                      <input type="radio" name="space" value="garden" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'garden'} />
                      <span className="emoji">🌳</span>
                      <span className="space-title">Garden/Open</span>
                      <span className="space-desc">Direct ground</span>
                    </label>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop: '1.5rem' }}>
                  <label><span className="step-number">3</span> How much natural light does this spot get?</label>
                  <div className="light-slider-container">
                    <input 
                      type="range" min="1" max="3" 
                      value={lightLevel} 
                      onChange={(e) => setLightLevel(e.target.value)} 
                      className="light-slider" 
                    />
                    <div className="light-labels">
                      <div className={`light-label ${lightLevel === '1' ? 'active' : ''}`}>
                        <span className="emoji">☁️</span>
                        <span className="light-title">Low</span>
                      </div>
                      <div className={`light-label ${lightLevel === '2' ? 'active' : ''}`}>
                        <span className="emoji">🌤️</span>
                        <span className="light-title">Medium</span>
                      </div>
                      <div className={`light-label ${lightLevel === '3' ? 'active' : ''}`}>
                        <span className="emoji">☀️</span>
                        <span className="light-title">High</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button type="submit" className="btn-primary w-full mt-6" disabled={loading}>
                  {loading ? 'Finding perfect plants...' : 'Get Recommendations'} <ArrowRight size={18} />
                </button>
              </form>
            </div>
          ) : (
            <div className="results-view text-left">
              <div className="flex justify-between items-center mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 className="section-title" style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700' }}>Recommended for you</h3>
                <button className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setShowResults(false)}>
                  Edit Details
                </button>
              </div>
              
              <div className="glass-panel" style={{ backgroundColor: 'var(--bg-surface)', borderRadius: '1rem', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid var(--border-color)' }}>
                <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>Your Environment</h3>
                <ul className="care-list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>📍 <strong>Location:</strong> {location || 'Not specified'}</li>
                  <li style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>🏠 <strong>Space:</strong> {spaceType.charAt(0).toUpperCase() + spaceType.slice(1)}</li>
                  <li style={{ color: 'var(--text-secondary)' }}>☀️ <strong>Light:</strong> {lightLevel === '1' ? 'Low' : lightLevel === '2' ? 'Medium' : 'High'}</li>
                </ul>
              </div>

              <h3 className="section-title" style={{ fontSize: '1rem', marginBottom: '1rem', fontWeight: '600' }}>Top Matches</h3>
              <div className="recommendations" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {recommendedPlants.length > 0 ? (
                  recommendedPlants.map(plant => (
                    <div key={plant.id} className="plant-card" onClick={() => navigate('/marketplace')} style={{ background: 'var(--bg-surface)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border-color)', cursor: 'pointer', transition: 'transform 0.2s ease' }}>
                      <div className="plant-img-placeholder" style={{ height: '140px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        {plant.image.startsWith('http') ? (
                          <img src={plant.image} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '2.5rem' }}>{plant.image}</span>
                        )}
                      </div>
                      <div className="plant-info" style={{ padding: '1rem' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', fontWeight: '600' }}>{plant.name}</h4>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '1rem', fontWeight: '600' }}>
                            {plant.purification_score * 10}% Impact
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                    <p className="text-subtle">No plants found for this specific combination. Try a different space or light level!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
