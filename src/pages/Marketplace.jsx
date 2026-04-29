import { useState } from 'react';
import { Search, Filter, Heart, MapPin } from 'lucide-react';
import './Marketplace.css';

// Mock Data
const PLANTS = [
  { id: 1, name: 'Monstera Deliciosa', type: 'buy', price: '$25', location: '2 miles away', image: '🪴' },
  { id: 2, name: 'Snake Plant', type: 'swap', price: 'Trade', location: '1.5 miles away', image: '🌵' },
  { id: 3, name: 'Pothos Vine', type: 'thrift', price: '$5', location: '0.5 miles away', image: '🌿' },
  { id: 4, name: 'Fiddle Leaf Fig', type: 'buy', price: '$45', location: '5 miles away', image: '🌳' },
  { id: 5, name: 'Aloe Vera', type: 'sell', price: '$10', location: 'You', image: '🌱' },
  { id: 6, name: 'Peace Lily', type: 'swap', price: 'Trade', location: '3 miles away', image: '🌺' },
];

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlants = PLANTS.filter(plant => {
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
        {filteredPlants.map(plant => (
          <div key={plant.id} className="plant-card">
            <div className="plant-image">
              <div className="image-placeholder">{plant.image}</div>
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
