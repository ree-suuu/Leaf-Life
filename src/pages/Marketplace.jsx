import { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, ShoppingBag } from 'lucide-react';
import './Marketplace.css';

export default function Marketplace() {
  const [plants, setPlants] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      console.log('Attempting to fetch plants...');
      const response = await fetch('/api/plants');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched plants success:', data);
      setPlants(data);
    } catch (error) {
      console.error('CRITICAL FETCH ERROR:', error);
      // Fallback to absolute URL if proxy fails during development
      try {
        console.log('Attempting fallback to localhost:5000...');
        const fallbackResponse = await fetch('http://localhost:5000/api/plants');
        const fallbackData = await fallbackResponse.json();
        setPlants(fallbackData);
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (plantId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to buy plants!');
      return;
    }

    try {
      setBuyingId(plantId);
      const response = await fetch(`/api/plants/${plantId}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        // Remove the bought plant from the local state
        setPlants(prev => prev.filter(p => p.id !== plantId));
        alert('Purchase successful! The plant is now yours.');
      } else {
        const data = await response.json();
        alert(data.error || 'Purchase failed');
      }
    } catch (error) {
      alert('Failed to connect to server');
    } finally {
      setBuyingId(null);
    }
  };

  const filteredPlants = plants.filter(plant => {
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

      {loading ? (
        <div className="empty-state">
          <p className="text-subtle">Loading marketplace...</p>
        </div>
      ) : (
        <div className="plants-grid">
          {filteredPlants.map(plant => (
            <div key={plant.id} className="plant-card">
              <div className="plant-image">
                {plant.image && plant.image.trim().startsWith('http') ? (
                  <img src={plant.image.trim()} alt={plant.name} className="plant-img-actual" />
                ) : (
                  <div className="image-placeholder">{plant.image}</div>
                )}
                <div className="badge">{plant.type}</div>
                <button className="like-btn"><Heart size={18} /></button>
              </div>
              <div className="plant-details">
                <div className="plant-info-top">
                  <h3>{plant.name}</h3>
                  <p className="price">{plant.price}</p>
                </div>
                <div className="location">
                  <MapPin size={14} />
                  <span>{plant.location}</span>
                </div>
                <button 
                  className="btn-primary buy-btn" 
                  onClick={() => handleBuy(plant.id)}
                  disabled={buyingId === plant.id}
                  style={{ marginTop: '1rem', width: '100%', padding: '0.5rem', fontSize: '0.875rem' }}
                >
                  {buyingId === plant.id ? 'Processing...' : (
                    <>
                      <ShoppingBag size={16} style={{ marginRight: '0.5rem' }} />
                      Buy Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {!loading && filteredPlants.length === 0 && (
        <div className="empty-state">
          <p className="text-subtle">No plants found. Try a different search.</p>
        </div>
      )}
    </div>
  );
}
