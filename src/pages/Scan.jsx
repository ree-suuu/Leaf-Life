import { useState, useRef, useEffect } from 'react';
import { Camera, MapPin, Search, Leaf, ArrowRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Scan.css';

export default function Scan() {
  const [step, setStep] = useState('scan'); // 'scan', 'location', 'results'
  const [stream, setStream] = useState(null);
  const [location, setLocation] = useState('');
  const [spaceType, setSpaceType] = useState('indoor-bright');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const navigate = useNavigate();

  // Initialize camera when step is 'scan'
  useEffect(() => {
    if (step === 'scan') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback if camera fails
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    setIsScanning(true);
    // Simulate AI scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setStep('location');
    }, 2000);
  };

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            // Enhanced precision logic
            const address = data.address;
            const place = address.suburb || address.neighbourhood || address.city_district || address.village || address.town;
            const city = address.city || address.county || "";
            
            const cityName = place && city && place !== city ? `${place}, ${city}` : (place || city || "Nepal");
            setLocation(cityName);
          } catch (error) {
            console.error("Geocoding error:", error);
            setLocation("Kathmandu");
          }
        },
        (error) => {
          console.error("Location error", error);
          alert("Could not detect location. Please enter manually.");
        }
      );
    }
  };

  const handleSubmitLocation = (e) => {
    e.preventDefault();
    setStep('results');
  };

  return (
    <div className="animate-fade-in scan-container">
      {step === 'scan' && (
        <div className="scan-view">
          <h2 className="title-medium text-center">Identify Plant</h2>
          <p className="text-subtle text-center mb-4">Center the plant in the frame</p>
          
          <div className="camera-container">
            {stream ? (
              <video ref={videoRef} autoPlay playsInline className="camera-feed" />
            ) : (
              <div className="camera-fallback">
                <Camera size={48} color="var(--text-muted)" />
                <p>Camera access required</p>
              </div>
            )}
            
            {/* Viewfinder overlay */}
            <div className="viewfinder">
              <div className="corner top-left"></div>
              <div className="corner top-right"></div>
              <div className="corner bottom-left"></div>
              <div className="corner bottom-right"></div>
            </div>
            
            {isScanning && (
              <div className="scanning-overlay">
                <div className="scan-line"></div>
                <p>Analyzing plant...</p>
              </div>
            )}
          </div>
          
          <button 
            className="btn-capture"
            onClick={handleCapture}
            disabled={isScanning || !stream}
          >
            <div className="inner-circle"></div>
          </button>
        </div>
      )}

      {step === 'location' && (
        <div className="location-view">
          <div className="identified-header">
            <div className="plant-image-bg">
              <img src="https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80" alt="Monstera" />
              <div className="identified-overlay">
                <span className="badge-identified">✓ IDENTIFIED</span>
                <h2>Monstera Deliciosa</h2>
                <p>Swiss Cheese Plant</p>
              </div>
            </div>
          </div>

          <div className="location-form-container">
            <h3 className="text-center form-title">Let's find the perfect spot</h3>
            
            <form onSubmit={handleSubmitLocation} className="smart-setup-form">
              {/* Step 1 */}
              <div className="form-group">
                <label><span className="step-number">1</span> Where are you located?</label>
                <div className="location-input-group">
                  <div className="input-with-icon">
                    <MapPin size={18} className="icon" />
                    <input 
                      type="text" 
                      placeholder="Enter city or zip code" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>
                  <button type="button" className="btn-outline" onClick={requestLocation}>
                    <MapPin size={16} /> Use My Location
                  </button>
                </div>
              </div>

              {/* Step 2 */}
              <div className="form-group">
                <label><span className="step-number">2</span> Where will your new plant live?</label>
                <div className="space-grid">
                  <label className={`space-card ${spaceType === 'indoor' ? 'selected' : ''}`}>
                    <input type="radio" name="space" value="indoor" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'indoor'} />
                    <span className="emoji">🏠</span>
                    <span className="space-title">Indoor</span>
                    <span className="space-desc">Low light, stable temp</span>
                  </label>
                  <label className={`space-card ${spaceType === 'rooftop' ? 'selected' : ''}`}>
                    <input type="radio" name="space" value="rooftop" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'rooftop'} />
                    <span className="emoji">☀️</span>
                    <span className="space-title">Rooftop</span>
                    <span className="space-desc">Direct sun, high wind</span>
                  </label>
                  <label className={`space-card ${spaceType === 'balcony' ? 'selected' : ''}`}>
                    <input type="radio" name="space" value="balcony" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'balcony'} />
                    <span className="emoji">🪴</span>
                    <span className="space-title">Balcony</span>
                    <span className="space-desc">Partial shade</span>
                  </label>
                  <label className={`space-card ${spaceType === 'garden' ? 'selected' : ''}`}>
                    <input type="radio" name="space" value="garden" onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === 'garden'} />
                    <span className="emoji">🌳</span>
                    <span className="space-title">Garden/Open</span>
                    <span className="space-desc">Direct ground</span>
                  </label>
                </div>
              </div>

              {/* Step 3 */}
              <div className="form-group">
                <label><span className="step-number">3</span> How much natural light does this spot get?</label>
                <div className="light-slider-container">
                  <input type="range" min="1" max="3" defaultValue="2" className="light-slider" />
                  <div className="light-labels">
                    <div className="light-label">
                      <span className="emoji">☁️</span>
                      <span className="light-title">Low</span>
                      <span className="light-desc">No direct windows</span>
                    </div>
                    <div className="light-label active">
                      <span className="emoji">🌤️</span>
                      <span className="light-title">Medium</span>
                      <span className="light-desc">Bright indirect light</span>
                    </div>
                    <div className="light-label">
                      <span className="emoji">☀️</span>
                      <span className="light-title">High</span>
                      <span className="light-desc">Direct sun 6+ hrs</span>
                    </div>
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full mt-6">
                Get Recommendations <ArrowRight size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'results' && (
        <div className="results-view">
          <div className="result-header">
            <div className="plant-avatar">🌿</div>
            <div>
              <h2 className="title-medium" style={{ marginBottom: 0 }}>Monstera Deliciosa</h2>
              <p className="text-subtle">Swiss Cheese Plant</p>
            </div>
          </div>
          
          <div className="glass-panel p-4 mb-4">
            <h3 className="section-title">Care Tips for {location || 'Your Area'}</h3>
            <ul className="care-list">
              <li>💧 <strong>Water:</strong> Every 1-2 weeks, allowing soil to dry out between waterings.</li>
              <li>☀️ <strong>Light:</strong> Perfect for your {spaceType.replace('-', ' ')} space!</li>
              <li>🌡️ <strong>Temp:</strong> Ideal between 65°F-85°F. Keep away from drafts.</li>
            </ul>
          </div>

          <h3 className="section-title">Similar Plants in Marketplace</h3>
          <div className="recommendations">
            {[1, 2].map(i => (
              <div key={i} className="plant-card" onClick={() => navigate('/marketplace')}>
                <div className="plant-img-placeholder">🪴</div>
                <div className="plant-info">
                  <h4>Philodendron</h4>
                  <p>Rs. 25 • Thrift</p>
                </div>
              </div>
            ))}
          </div>
          
          <button className="btn-secondary w-full mt-4" onClick={() => setStep('scan')}>
            Scan Another Plant
          </button>
        </div>
      )}
    </div>
  );
}
