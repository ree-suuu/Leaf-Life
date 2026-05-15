import { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, ShoppingCart, X, Minus, Plus, QrCode, CheckCircle } from 'lucide-react';
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
  const [showQRPrompt, setShowQRPrompt] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
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

  const handleBuyClick = (e, plant) => {
    e.stopPropagation(); // Prevent navigation to detail page
    setSelectedPlant(plant);
    setQuantity(1);
    setShowQuantitySelector(true);
    setError('');
  };

  const handleProceedToPayment = () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      setError('Please log in to purchase.');
      alert('Please log in to purchase.');
      return;
    }
    setShowQuantitySelector(false);
    setShowQRPrompt(true);
  };

  const handlePaymentComplete = async () => {
    setPaymentProcessing(true);
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    
    try {
      // Simulate bank server detection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const buyResponse = await fetch(`/api/plants/${selectedPlant.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quantity })
      });

      if (buyResponse.ok) {
        setShowQRPrompt(false);
        setSuccess(true);
        // Refresh plants list
        const refreshRes = await fetch('/api/plants');
        const newData = await refreshRes.json();
        setPlants(newData);
      } else {
        alert('Payment verification failed. Please try again.');
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  const closeModals = () => {
    setShowQuantitySelector(false);
    setShowQRPrompt(false);
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
          <button className="btn-icon" type="button"><Filter size={20} /></button>
        </div>
      </div>

      <div className="tabs-container">
        {['all', 'swap', 'thrift', 'buy', 'sell'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab-button ${activeTab === tab ? 'active' : ''}`}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="plants-grid">
        {loading ? (
          <p>Loading plants...</p>
        ) : filteredPlants.map((plant) => (
          <div key={plant.id} className="plant-card" onClick={() => navigate(`/purchase/${plant.id}`)}>
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
              <button className="like-btn" type="button" onClick={(e) => e.stopPropagation()}><Heart size={18} /></button>
            </div>
            <div className="plant-details">
              <div>
                <h3>{plant.name}</h3>
                <p className="price">{plant.price}</p>
                <div className="location">
                  <MapPin size={14} />
                  <span>{plant.location}</span>
                </div>
              </div>
              <button 
                type="button"
                className="btn-primary buy-btn" 
                style={{ width: '100%', marginTop: '0.75rem', padding: '0.5rem', fontSize: '0.875rem' }}
                onClick={(e) => handleBuyClick(e, plant)}
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
        <div className="modal-overlay" onClick={closeModals}>
          <div className="glass-panel modal-content animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" type="button" onClick={closeModals}><X size={20} /></button>
            <div className="modal-header">
              <h3>Select Quantity</h3>
              <p>How many {selectedPlant?.name}s do you want?</p>
            </div>
            
            <div className="quantity-controls">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="qty-btn"><Minus size={20} /></button>
              <span className="qty-value">{quantity}</span>
              <button type="button" onClick={() => setQuantity(Math.min(10, quantity + 1))} className="qty-btn"><Plus size={20} /></button>
            </div>

            <button type="button" onClick={handleProceedToPayment} className="btn-primary w-full">
              Confirm & Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* QR Code Payment Modal */}
      {showQRPrompt && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="glass-panel modal-content animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" type="button" onClick={closeModals}><X size={20} /></button>
            <div className="modal-header">
              <div className="qr-icon" style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', justifyContent: 'center' }}><QrCode size={48} /></div>
              <h3>Scan to Pay</h3>
              <p>Scan the QR code with your bank app</p>
              <p className="purchase-summary" style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.25rem' }}>
                Total: Rs. {parseInt(selectedPlant?.price.replace('Rs. ', '')) * quantity}
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', margin: '1rem 0' }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PlantApp-Payment-Simulation" 
                alt="Payment QR Code" 
                style={{ width: '200px', height: '200px' }}
              />
            </div>

            <button type="button" onClick={handlePaymentComplete} disabled={paymentProcessing} className="btn-primary w-full" style={{ marginTop: '1rem' }}>
              {paymentProcessing ? 'Detecting Payment...' : 'I\'ve Scanned & Paid'}
            </button>
            <p className="text-subtle" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>Waiting for bank server confirmation...</p>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {success && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="glass-panel modal-content animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <div className="success-icon"><CheckCircle size={48} /></div>
            <h3>Purchase Successful!</h3>
            <p>You bought {quantity} {selectedPlant?.name}(s).</p>
            <div className="modal-actions">
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-primary w-full">Go to Dashboard</button>
              <button type="button" onClick={closeModals} className="btn-text w-full">Continue Shopping</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
