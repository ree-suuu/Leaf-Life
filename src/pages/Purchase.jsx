import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, CheckCircle, ShieldCheck, ShoppingCart } from 'lucide-react';

export default function Purchase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [success, setSuccess] = useState(false);

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

  const handleBuy = async () => {
    setPurchasing(true);
    // Simulate API call
    setTimeout(() => {
      setPurchasing(false);
      setSuccess(true);
      // In a real app, we would call the /api/plants/:id/buy endpoint
    }, 1500);
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
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>You have successfully purchased the {plant.name}. The nursery will contact you for delivery.</p>
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
              onClick={handleBuy} 
              disabled={purchasing}
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
    </div>
  );
}
