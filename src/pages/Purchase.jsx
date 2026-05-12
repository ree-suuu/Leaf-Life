import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, ShieldCheck, ShoppingCart, Lock, X, Minus, Plus } from 'lucide-react';

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

  // Password Verification State
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

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

  const handleProceedToVerify = () => {
    setShowQuantitySelector(false);
    setShowPasswordPrompt(true);
    setError('');
  };

  const handleVerifyAndBuy = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.email) {
      setError('User session not found. Please log in again.');
      setVerifying(false);
      return;
    }

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
        
        // Finalize purchase with quantity
        const buyResponse = await fetch(`/api/plants/${id}/buy`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, quantity })
        });

        if (buyResponse.ok) {
          setSuccess(true);
        } else {
          setError('Purchase failed. Please try again.');
        }
        setPurchasing(false);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setVerifying(false);
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
        <div style={{ display: 'grid', gridTemplateColumns: 'window.innerWidth > 600 ? "1fr 1fr" : "1fr"', gap: '2rem' }}>
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
              disabled={purchasing || showPasswordPrompt || showQuantitySelector}
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

            <button onClick={handleProceedToVerify} className="btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
              Confirm & Proceed
            </button>
          </div>
        </div>
      )}

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div style={{ 
          position: 'fixed', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          backdropFilter: 'blur(4px)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div className="glass-panel animate-scale-up" style={{ 
            backgroundColor: 'var(--bg-surface)', 
            padding: '2rem', 
            borderRadius: '1.5rem', 
            width: '100%', 
            maxWidth: '400px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            position: 'relative'
          }}>
            <button 
              onClick={() => setShowPasswordPrompt(false)}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{ width: '48px', height: '48px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                <Lock size={24} color="var(--primary)" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Confirm Purchase</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>enter ur password</p>
              <p style={{ marginTop: '0.5rem', fontWeight: '600' }}>Total: {quantity} × {plant.name}</p>
            </div>

            <form onSubmit={handleVerifyAndBuy}>
              <div style={{ marginBottom: '1.5rem' }}>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoFocus
                  required
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1rem', 
                    borderRadius: '0.75rem', 
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem'
                  }}
                />
                {error && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.5rem' }}>{error}</p>}
              </div>

              <button 
                type="submit" 
                disabled={verifying}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.75rem' }}
              >
                {verifying ? 'Verifying...' : 'Verify & Buy'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

