import { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, ShoppingCart, X, Minus, Plus, Lock, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Marketplace.css';

export default function Marketplace() {
  const navigate = useNavigate();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Purchase Flow State
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPlants = async () => {
      try {
        const response = await fetch('/api/plants');
        const data = await response.json();
        setPlants(data);
      } catch (err) {
        console.error("Error fetching plants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlants();
  }, []);

  const filteredPlants = plants.filter(plant => {
    if (activeTab !== 'all' && plant.type !== activeTab) return false;
    if (searchQuery && !plant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleBuyClick = (plant) => {
    setSelectedPlant(plant);
    setQuantity(1);
    setShowQuantitySelector(true);
    setError('');
  };

  const handleProceedToVerify = () => {
    setShowQuantitySelector(false);
    setShowPasswordPrompt(true);
    setPassword('');
    setError('');
  };

  const handleVerifyAndBuy = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Please log in to purchase.');
      setVerifying(false);
      return;
    }
    const user = JSON.parse(userStr);

    try {
      const response = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setShowPasswordPrompt(false);
        setPurchasing(true);
        
        const buyResponse = await fetch(`/api/plants/${selectedPlant.id}/buy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, quantity })
        });

        if (buyResponse.ok) {
          setSuccess(true);
          // Refresh plants list
          const refreshRes = await fetch('/api/plants');
          const newData = await refreshRes.json();
          setPlants(newData);
        } else {
          setError('Purchase failed. Please try again.');
        }
        setPurchasing(false);
      } else {
        setError(data.error || 'Incorrect password');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const closeModals = () => {
    setShowQuantitySelector(false);
    setShowPasswordPrompt(false);
    setSuccess(false);
    setSelectedPlant(null);
  };

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
        {loading ? (
          <p>Loading plants...</p>
        ) : filteredPlants.map((plant) => (
          <div key={plant.id} className="plant-card">
            <div className="plant-image" onClick={() => navigate(`/purchase/${plant.id}`)}>
              <img 
                src={plant.image} 
                alt={plant.name} 
                className="plant-img-actual"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=400';
                }}
              />
              <div className="badge">{plant.type}</div>
              <button className="like-btn" onClick={(e) => e.stopPropagation()}><Heart size={18} /></button>
            </div>
            <div className="plant-details">
              <div onClick={() => navigate(`/purchase/${plant.id}`)} style={{ cursor: 'pointer' }}>
                <h3>{plant.name}</h3>
                <p className="price">{plant.price}</p>
                <div className="location">
                  <MapPin size={14} />
                  <span>{plant.location}</span>
                </div>
              </div>
              <button 
                className="btn-primary buy-btn" 
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', fontSize: '0.875rem' }}
                onClick={() => handleBuyClick(plant)}
              >
                <ShoppingCart size={16} /> Buy Now
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {filteredPlants.length === 0 && !loading && (
        <div className="empty-state">
          <p className="text-subtle">No plants found. Try a different search.</p>
        </div>
      )}

      {/* Quantity Selector Modal */}
      {showQuantitySelector && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-scale-up">
            <button className="close-modal" onClick={closeModals}><X size={20} /></button>
            <div className="modal-header">
              <h3>Select Quantity</h3>
              <p>How many {selectedPlant?.name}s do you want?</p>
            </div>
            
            <div className="quantity-controls">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn"><Minus size={20} /></button>
              <span className="qty-value">{quantity}</span>
              <button onClick={() => setQuantity(Math.min(10, quantity + 1))} className="qty-btn"><Plus size={20} /></button>
            </div>

            <button onClick={handleProceedToVerify} className="btn-primary w-full">
              Confirm & Proceed
            </button>
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-scale-up">
            <button className="close-modal" onClick={closeModals}><X size={20} /></button>
            <div className="modal-header">
              <div className="lock-icon"><Lock size={24} /></div>
              <h3>Confirm Purchase</h3>
              <p>Enter your password to verify</p>
              <p className="purchase-summary">{quantity} × {selectedPlant?.name}</p>
            </div>

            <form onSubmit={handleVerifyAndBuy}>
              <div className="form-group">
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  required
                  className="modal-input"
                />
                {error && <p className="error-text">{error}</p>}
              </div>
              <button type="submit" disabled={verifying} className="btn-primary w-full">
                {verifying ? 'Verifying...' : 'Verify & Buy'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="modal-overlay">
          <div className="glass-panel modal-content animate-scale-up text-center">
            <div className="success-icon"><CheckCircle size={48} /></div>
            <h3>Purchase Successful!</h3>
            <p>You bought {quantity} {selectedPlant?.name}(s).</p>
            <div className="modal-actions">
              <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">Go to Dashboard</button>
              <button onClick={closeModals} className="btn-text w-full">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
