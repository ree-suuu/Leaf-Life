import { Wind, Sprout, Plus, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const OWNED_PLANTS = [
  { id: 1, name: 'Monstera', lastWatered: '2 days ago', image: '🪴' },
  { id: 2, name: 'Snake Plant', lastWatered: '1 week ago', image: '🌵' },
  { id: 3, name: 'Pothos', lastWatered: 'Yesterday', image: '🌿' },
];

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in dashboard-container">
      <div className="dashboard-header">
        <div>
          <h2 className="title-large" style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Hi, Alex 👋</h2>
          <p className="text-subtle">Your urban jungle is thriving.</p>
        </div>
        <button className="btn-icon">
          <Settings size={24} color="var(--text-secondary)" />
        </button>
      </div>
      
      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel">
          <div className="metric-icon bg-green">
            <Sprout size={24} />
          </div>
          <div>
            <h3 className="metric-value">12</h3>
            <p className="metric-label">Plants Owned</p>
          </div>
        </div>
        
        <div className="metric-card glass-panel">
          <div className="metric-icon bg-blue">
            <Wind size={24} />
          </div>
          <div>
            <h3 className="metric-value">+15%</h3>
            <p className="metric-label">Air Quality</p>
          </div>
        </div>
      </div>

      {/* Air Quality Details */}
      <div className="glass-panel air-quality-panel">
        <div className="aq-header">
          <h3>Air Purification Impact</h3>
          <span className="aq-status">Excellent</span>
        </div>
        <p className="text-subtle">Your collection filters approximately <strong>2.4kg of CO2</strong> per year and significantly improves indoor humidity.</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: '75%' }}></div>
        </div>
      </div>

      {/* Collection */}
      <div className="collection-header">
        <h3 className="section-title">Your Collection</h3>
        <button className="btn-text" onClick={() => navigate('/scan')}>Add Plant</button>
      </div>

      <div className="collection-grid">
        {OWNED_PLANTS.map(plant => (
          <div key={plant.id} className="collection-card">
            <div className="collection-img">{plant.image}</div>
            <div className="collection-info">
              <h4>{plant.name}</h4>
              <p>Watered {plant.lastWatered}</p>
            </div>
          </div>
        ))}
        
        {/* Add New Card */}
        <div className="collection-card add-card" onClick={() => navigate('/scan')}>
          <div className="add-icon">
            <Plus size={32} />
          </div>
          <h4>Add New</h4>
          <p>Scan a plant</p>
        </div>
      </div>
    </div>
  );
}
