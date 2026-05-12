import { useState, useEffect } from 'react';
import { Wind, Sprout, Plus, Settings, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState(null);
  const [ownedPlants, setOwnedPlants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserName(user.fullName);
      setUserId(user.id);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (userId) {
      const fetchOwnedPlants = async () => {
        try {
          const response = await fetch(`/api/users/${userId}/plants`);
          const data = await response.json();
          if (Array.isArray(data)) {
            setOwnedPlants(data);
          }
        } catch (err) {
          console.error("Error fetching owned plants:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchOwnedPlants();
    }
  }, [userId]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Calculate dynamic metrics
  const totalPurificationScore = ownedPlants.reduce((sum, plant) => sum + (plant.purification_score || 0), 0);
  const airQualityImprovement = Math.min(totalPurificationScore, 100); // Capped at 100%
  const co2Filtered = (totalPurificationScore * 0.2).toFixed(1); // Mock calculation: each point filters 0.2kg CO2

  return (
    <div className="animate-fade-in dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2 className="title-large" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Hi, {userName || 'Plant Parent'} 👋</h2>
          <p className="text-subtle">Your urban jungle is thriving.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-icon">
            <Settings size={24} color="var(--text-secondary)" />
          </button>
          <button className="btn-icon" onClick={handleLogout} title="Log out">
            <LogOut size={24} color="var(--text-secondary)" />
          </button>
        </div>
      </div>
      
      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon bg-green">
            <Sprout size={24} />
          </div>
          <div>
            <h3 className="metric-value">{ownedPlants.length}</h3>
            <p className="metric-label">Plants Owned</p>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className="metric-icon bg-blue">
            <Wind size={24} />
          </div>
          <div>
            <h3 className="metric-value">+{airQualityImprovement}%</h3>
            <p className="metric-label">Air Quality</p>
          </div>
        </div>
      </div>

      {/* Air Quality Details */}
      <div className="glass-panel air-quality-panel">
        <div className="aq-header">
          <h3>Air Purification Impact</h3>
          <span className="aq-status">{airQualityImprovement > 50 ? 'Excellent' : airQualityImprovement > 20 ? 'Good' : 'Improving'}</span>
        </div>
        <p className="text-subtle">
          {ownedPlants.length > 0 
            ? `Your collection filters approximately ${co2Filtered}kg of CO2 per year and significantly improves indoor humidity.`
            : "You haven't added any plants yet. Start your journey to cleaner air!"}
        </p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${Math.max(airQualityImprovement, 5)}%` }}></div>
        </div>
      </div>

      {/* Collection */}
      <div className="collection-header">
        <h3 className="section-title">Your Collection</h3>
        <button className="btn-text" onClick={() => navigate('/recommend')}>Find New Plant</button>
      </div>

      <div className="collection-grid">
        {loading ? (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem' }}>Loading your collection...</p>
        ) : ownedPlants.length > 0 ? (
          ownedPlants.map(plant => (
            <div key={plant.id} className="collection-card">
              <div className="collection-img" style={{ overflow: 'hidden' }}>
                <img src={plant.image} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
              <div className="collection-info">
                <h4>{plant.name}</h4>
                <p>{plant.type}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', border: '1px dashed var(--border-color)' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No plants in your collection yet.</p>
            <button className="btn-primary" onClick={() => navigate('/recommend')}>Get Your First Plant</button>
          </div>
        )}
        
        {/* Add New Card - only show if there are already plants, or keep as a constant CTA */}
        {ownedPlants.length > 0 && (
          <div className="collection-card add-card" onClick={() => navigate('/recommend')}>
            <div className="add-icon">
              <Plus size={32} />
            </div>
            <h4>Add New</h4>
            <p>Find a match</p>
          </div>
        )}
      </div>
    </div>
  );
}
