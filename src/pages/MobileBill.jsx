import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Leaf, CreditCard, ShieldCheck, CheckCircle, Package } from 'lucide-react';

export default function MobileBill() {
  const { sessionId } = useParams();
  const [bill, setBill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [success, setSuccess] = useState(false);

  // ✅ ADD THIS LINE — works because QR URL already contains the laptop's LAN IP
  const backendBase = `http://${window.location.hostname}:5000`;

  useEffect(() => {
    const fetchBill = async () => {
      try {
        const response = await fetch(`${backendBase}/api/payment/bill/${sessionId}`); // ✅ changed
        if (response.ok) {
          const data = await response.json();
          setBill(data);
        }
      } catch (err) {
        console.error("Error fetching bill:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBill();
  }, [sessionId]);

  const [verifying, setVerifying] = useState(false);

  const handlePay = async () => {
    setPaying(true);
    try {
      // Step 1: Simulated "App Redirection/Payment" delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 2: Show "Bank Server Detecting..." state
      setPaying(false);
      setVerifying(true);
      await new Promise(resolve => setTimeout(resolve, 2000));

      const response = await fetch(`${backendBase}/api/payment/complete/${sessionId}`, { // ✅ changed
        method: 'POST'
      });
      if (response.ok) {
        setSuccess(true);
      }
    } catch (err) {
      alert("Payment failed. Please try again.");
    } finally {
      setPaying(false);
      setVerifying(false);
    }
  };


  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
      <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid var(--primary-light)', borderTop: '4px solid var(--primary)', borderRadius: '50%', marginBottom: '1rem' }}></div>
      <p>Loading Invoice...</p>
    </div>
  );

  if (!bill) return (
    <div style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1.5rem' }}>
        <h2 style={{ color: '#ef4444' }}>Session Expired</h2>
        <p>This payment link is no longer valid.</p>
      </div>
    </div>
  );

  if (verifying) return (
    <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4' }}>
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', borderRadius: '2rem', backgroundColor: 'white', maxWidth: '400px', width: '100%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div className="animate-pulse" style={{ width: '100px', height: '100px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <ShieldCheck size={60} color="#16a34a" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#111827', marginBottom: '1rem' }}>Bank Server Detection</h2>
        <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
          Our server is securely communicating with the bank to verify your eSewa transaction...
        </p>
        <div style={{ marginTop: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
           <div className="animate-bounce" style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%' }}></div>
           <div className="animate-bounce" style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%', animationDelay: '0.2s' }}></div>
           <div className="animate-bounce" style={{ width: '12px', height: '12px', background: '#16a34a', borderRadius: '50%', animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );

  if (success) return (
    <div className="animate-fade-in" style={{ padding: '2rem', textAlign: 'center', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-secondary)' }}>
      <div className="glass-panel" style={{ padding: '3rem 1.5rem', borderRadius: '2rem', backgroundColor: 'white', maxWidth: '400px', width: '100%' }}>
        <div style={{ width: '80px', height: '80px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <CheckCircle size={48} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '1rem' }}>Payment Successful!</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Your payment for <b>{bill.plantName}</b> has been processed by eSewa.</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>You can now close this tab. Your desktop app will update automatically.</p>
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in" style={{ padding: '1rem', minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: '800', fontSize: '1.5rem', marginBottom: '0.5rem' }}>
            <Leaf size={28} /> Leaf & Life
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Secure Dynamic Payment</p>
        </header>

        <div className="glass-panel" style={{ backgroundColor: 'white', borderRadius: '1.5rem', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px dashed #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', marginBottom: '0.25rem' }}>Order ID</p>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{bill.id}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', fontWeight: '700', marginBottom: '0.25rem' }}>Date</p>
                <p style={{ fontWeight: '600', fontSize: '0.875rem' }}>{new Date(bill.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '1rem' }}>
              <div style={{ width: '48px', height: '48px', background: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Package size={24} />
              </div>
              <div>
                <p style={{ fontWeight: '700', color: '#111827' }}>{bill.plantName}</p>
                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Quantity: {bill.quantity}</p>
              </div>
            </div>
          </div>

          <div style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <span style={{ color: '#6b7280' }}>Subtotal</span>
              <span style={{ fontWeight: '600' }}>Rs. {bill.amount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{ color: '#6b7280' }}>Processing Fee</span>
              <span style={{ color: '#10b981', fontWeight: '600' }}>FREE</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid #f3f4f6', paddingTop: '1rem', marginBottom: '2rem' }}>
              <span style={{ fontWeight: '800', fontSize: '1.125rem' }}>Total Amount</span>
              <span style={{ fontWeight: '800', fontSize: '1.125rem', color: 'var(--primary)' }}>Rs. {bill.amount}</span>
            </div>

            <button 
              onClick={handlePay}
              disabled={paying}
              style={{ 
                width: '100%', 
                padding: '1rem', 
                borderRadius: '1rem', 
                border: 'none', 
                backgroundColor: '#60bb46', // eSewa green
                color: 'white', 
                fontWeight: '700', 
                fontSize: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '0.75rem',
                cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(96, 187, 70, 0.2)'
              }}
            >
              {paying ? 'Connecting eSewa...' : (
                <>
                  <CreditCard size={20} />
                  Pay with eSewa
                </>
              )}
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem', color: '#6b7280', fontSize: '0.75rem' }}>
              <ShieldCheck size={14} color="#10b981" />
              Bank-to-Server Encrypted
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
