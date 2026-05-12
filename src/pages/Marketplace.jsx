import { useState } from 'react';
import { Search, Filter, Heart, MapPin } from 'lucide-react';
import { MVP_PLANTS } from '../data/plantRules';
import './Marketplace.css';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = MVP_PLANTS.filter(plant => {
    if (activeTab !== 'all' && plant.type !== activeTab) return false;
    if (searchQuery && !plant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in marketplace-container">
      <div className="marketplace-header">
        <h2 className="title-medium">Marketplace</h2>
        <div className="search-bar">
          <Search size={20} className="icon" />
          <input 
            type="text" 
            placeholder="Search plants..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="btn-icon"><Filter size={20} /></button>
        </div>
      </div>

      <div className="tabs-container">
        {['all', 'swap', 'thrift', 'buy', 'sell'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="plants-grid">
        {filteredPlants.map((plant, index) => (
          <div key={`${plant.name}-${index}`} className="plant-card">
            <div className="plant-image">
              <img 
                src={plant.image} 
                alt={plant.name} 
                className="plant-img-actual"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=400';
                }}
              />
              <div className="badge">{plant.type}</div>
              <button className="like-btn"><Heart size={18} /></button>
            </div>
            <div className="plant-details">
              <h3>{plant.name}</h3>
              <p className="price">{plant.price}</p>
              <div className="location">
                <MapPin size={14} />
                <span>{plant.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredPlants.length === 0 && (
        <div className="empty-state">
          <p className="text-subtle">No plants found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
