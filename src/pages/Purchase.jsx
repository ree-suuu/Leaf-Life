import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, ShieldCheck, ShoppingCart, X, Minus, Plus, QrCode } from 'lucide-react';

export default function Purchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Quantity State
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // QR Payment State
  const [showQRPrompt, setShowQRPrompt] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  useEffect(() => {
    const fetchPlant = async () => {
      try {
        const response = await fetch('/api/plants');
        const data = await response.json();
        const found = data.find(p => p.id === parseInt(id));
        setPlant(found);
      } catch (err) {
        console.error("Error fetching plant:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlant();
  }, [id]);

  const handleBuyClick = () => {
    setShowQuantitySelector(true);
  };

  const handleProceedToPayment = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      alert('Please log in to purchase.');
      return;
    }
    setShowQuantitySelector(false);
    setShowQRPrompt(true);
  };

  const handlePaymentComplete = async () => {
    setPaymentProcessing(true);
    const user = JSON.parse(localStorage.getItem('user'));
    
    try {
      // Simulate bank server detection delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      const buyResponse = await fetch(`/api/plants/${id}/buy`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, quantity })
      });

      if (buyResponse.ok) {
        setShowQRPrompt(false);
        setSuccess(true);
      } else {
        alert('Payment verification failed. Please try again.');
      }
    } catch (err) {
      console.error("Payment error:", err);
    } finally {
      setPaymentProcessing(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading plant details...</div>;
  if (!plant) return <div style={{ padding: '2rem', textAlign: 'center' }}>Plant not found.</div>;

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}
      >
        <ArrowLeft size={20} /> Back
      </button>

      {success ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-surface)', borderRadius: '1.5rem', border: '1px solid var(--border-color)' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' }}>Purchase Successful!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            You have successfully purchased {quantity} {plant.name}(s). The nursery will contact you for delivery.
          </p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary" style={{ width: '100%', maxWidth: '300px' }}>Go to Dashboard</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div style={{ borderRadius: '1.5rem', overflow: 'hidden', height: '350px', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={plant.image} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '1rem' }} />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: '700', margin: 0 }}>{plant.name}</h1>
              <span style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>{plant.price}</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              <MapPin size={16} /> {plant.location}
            </div>

            <div className="glass-panel" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '1rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>Care Requirements</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Light</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{plant.sunlight_need === '1' ? 'Low' : plant.sunlight_need === '2' ? 'Medium' : 'High'}</span>
                </div>
                <div>
                  <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Space</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>{plant.space_tag}</span>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                <ShieldCheck size={16} color="#10b981" /> Verified Health Guarantee
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <ShieldCheck size={16} color="#10b981" /> Direct from Local Nursery
              </div>
            </div>

            <button 
              onClick={handleBuyClick} 
              disabled={purchasing || showQuantitySelector || showQRPrompt}
              className="btn-primary" 
              style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1rem' }}
            >
              {purchasing ? 'Processing...' : (
                <>
                  <ShoppingCart size={20} />
                  Buy Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Quantity Selector Modal */}
      {showQuantitySelector && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel animate-scale-up" style={{ 
            backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '1.5rem', 
            width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative'
          }}>
            <button onClick={() => setShowQuantitySelector(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Select Quantity</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>How many {plant.name}s do you want to buy?</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem', marginBottom: '2.5rem' }}>
              <button 
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Minus size={20} />
              </button>
              <span style={{ fontSize: '2rem', fontWeight: '700', width: '40px', textAlign: 'center' }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                style={{ width: '48px', height: '48px', borderRadius: '12px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <Plus size={20} />
              </button>
            </div>

            <button onClick={handleProceedToPayment} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Confirm & Proceed to Payment
            </button>
          </div>
        </div>
      )}

      {/* QR Code Payment Modal */}
      {showQRPrompt && (
        <div style={{ 
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
        }}>
          <div className="glass-panel animate-scale-up" style={{ 
            backgroundColor: 'var(--bg-surface)', padding: '2rem', borderRadius: '1.5rem', 
            width: '100%', maxWidth: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', position: 'relative',
            textAlign: 'center'
          }}>
            <button onClick={() => setShowQRPrompt(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}><X size={20} /></button>
            
            <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <QrCode size={24} color="var(--primary)" />
            </div>
            
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.5rem' }}>Scan to Pay</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>Scan the QR code with your bank app to complete the purchase of {quantity} {plant.name}(s).</p>
            
            <div style={{ 
              backgroundColor: 'white', padding: '1rem', borderRadius: '1rem', display: 'inline-block', marginBottom: '1.5rem',
              border: '4px solid var(--primary-light)'
            }}>
              <img 
                src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PlantApp-Payment-Simulation" 
                alt="Payment QR Code" 
                style={{ width: '200px', height: '200px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <p style={{ fontWeight: '700', fontSize: '1.125rem', color: 'var(--primary)' }}>
                Total Amount: Rs. {parseInt(plant.price.replace('Rs. ', '')) * quantity}
              </p>
            </div>

            <button 
              onClick={handlePaymentComplete} 
              disabled={paymentProcessing}
              className="btn-primary" 
              style={{ width: '100%', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
            >
              {paymentProcessing ? 'Detecting Payment...' : 'I\'ve Scanned & Paid'}
            </button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' }}>
              Waiting for bank server confirmation...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
