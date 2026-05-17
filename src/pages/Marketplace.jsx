import { useState, useEffect } from 'react';
import { Search, Filter, Heart, MapPin, ShoppingCart, X, Minus, Plus, QrCode, CheckCircle, Loader2 } from 'lucide-react';
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
  const [paymentSessionId, setPaymentSessionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, completed
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

  // Polling for payment status
  useEffect(() => {
    let interval;
    if (showQRPrompt && paymentSessionId && paymentStatus === 'pending') {
      interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/payment/status/${paymentSessionId}`);
          const data = await response.json();
          if (data.status === 'completed') {
            setPaymentStatus('completed');
            clearInterval(interval);
            handleFinalizePurchase();
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [showQRPrompt, paymentSessionId, paymentStatus]);

  const filteredPlants = plants.filter(plant => {
    if (activeTab !== 'all' && plant.type !== activeTab) return false;
    if (searchQuery && !plant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleBuyClick = (e, plant) => {
    e.stopPropagation();
    setSelectedPlant(plant);
    setQuantity(1);
    setShowQuantitySelector(true);
    setError('');
  };

  const handleProceedToPayment = async () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      alert('Please log in to purchase.');
      return;
    }
    const user = JSON.parse(userStr);
    const amount = parseInt(selectedPlant.price.replace('Rs. ', '')) * quantity;

    try {
      const response = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plantId: selectedPlant.id, userId: user.id, quantity, amount })
      });
      const data = await response.json();
      setPaymentSessionId(data.sessionId);
      setPaymentStatus('pending');
      setShowQuantitySelector(false);
      setShowQRPrompt(true);
    } catch (err) {
      alert("Failed to initiate payment.");
    }
  };

  const handleFinalizePurchase = async () => {
    const userStr = localStorage.getItem('user');
    const user = JSON.parse(userStr);
    
    try {
      const buyResponse = await fetch(`/api/plants/${selectedPlant.id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quantity })
      });

      if (buyResponse.ok) {
        setShowQRPrompt(false);
        setSuccess(true);
        // Refresh plants
        const refreshRes = await fetch('/api/plants');
        const newData = await refreshRes.json();
        setPlants(newData);
      }
    } catch (err) {
      console.error("Finalization error:", err);
    }
  };

  const closeModals = () => {
    setShowQuantitySelector(false);
    setShowQRPrompt(false);
    setSuccess(false);
    setSelectedPlant(null);
    setPaymentSessionId(null);
  };

  // Determine local IP for mobile access
  // ✅ Dynamically use whatever IP the desktop browser is on
const localIP = window.location.hostname;
const paymentURL = `http://${localIP}:5173/payment-mobile/${paymentSessionId}`;
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
          <button key={tab} onClick={() => setActiveTab(tab)} className={`tab-button ${activeTab === tab ? 'active' : ''}`} type="button">{tab}</button>
        ))}
      </div>

      <div className="plants-grid">
        {loading ? (
          <p>Loading plants...</p>
        ) : filteredPlants.map((plant) => (
          <div key={plant.id} className="plant-card" onClick={() => navigate(`/purchase/${plant.id}`)}>
            <div className="plant-image">
              <img src={plant.image} alt={plant.name} className="plant-img-actual" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1545239351-ef35f43d514b?q=80&w=400'; }} />
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
            <button type="button" onClick={handleProceedToPayment} className="btn-primary w-full">Confirm & Show QR</button>
          </div>
        </div>
      )}

      {showQRPrompt && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="glass-panel modal-content animate-scale-up text-center" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" type="button" onClick={closeModals}><X size={20} /></button>
            <div className="modal-header">
              <div className="qr-icon" style={{ marginBottom: '1rem', color: 'var(--primary)', display: 'flex', justifyContent: 'center' }}><QrCode size={48} /></div>
              <h3>Scan to Pay</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Scan this with your mobile to see the bill and pay.</p>
              <p className="purchase-summary" style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1.25rem' }}>
                Total: Rs. {parseInt(selectedPlant?.price.replace('Rs. ', '')) * quantity}
              </p>
            </div>

            <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', margin: '1.5rem 0', border: '1px solid #eee' }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(paymentURL)}`} 
                alt="Payment QR Code" 
                style={{ width: '200px', height: '200px' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem' }}>
              <Loader2 className="animate-spin" size={20} color="var(--primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: '600' }}>Waiting for mobile scan...</span>
            </div>
            
            <p className="text-subtle" style={{ fontSize: '0.75rem', marginTop: '1rem' }}>
              Keep this window open. Once you pay on your phone, this will update automatically.
            </p>
          </div>
        </div>
      )}

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
