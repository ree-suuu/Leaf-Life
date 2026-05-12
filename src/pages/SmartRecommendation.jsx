import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles } from 'lucide-react';
import './Scan.css'; // Reusing some scan styles for consistency

export default function SmartRecommendation() {
  const [location, setLocation] = useState('');
  const [spaceType, setSpaceType] = useState('indoor');
  const [lightLevel, setLightLevel] = useState('2');
  const [showResults, setShowResults] = useState(false);
  const [recommendedPlants, setRecommendedPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const requestLocation = () => {
    if ("geolocation" in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await response.json();
            
            const address = data.address;
            const place = address.suburb || address.neighbourhood || address.city_district || address.village || address.town;
            const city = address.city || address.county || "";
            const cityName = place && city && place !== city ? `${place}, ${city}` : (place || city || "Nepal");
            
            setLocation(cityName);
          } catch (error) {
            console.error("Geocoding error:", error);
            setLocation("Kathmandu");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Location error", error);
          alert("Could not detect location. Please enter manually.");
          setLoading(false);
        }
      );
    }
  };

  const handleRecommendationSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const lightMap = { '1': 'Low', '2': 'Medium', '3': 'High' };
    const sunlight = lightMap[lightLevel];
    const spaceMap = { 'indoor': 'Indoor', 'rooftop': 'Rooftop', 'balcony': 'Balcony', 'garden': 'Rooftop' };
    const space = spaceMap[spaceType];

    try {
      const response = await fetch(`/api/recommend?space=${space}&sunlight=${sunlight}&location=${location}`);
      const data = await response.json();
      setRecommendedPlants(data);
      setShowResults(true);
    } catch (error) {
      console.error('RECOMMENDATION ERROR:', error);
      alert(`Error: ${error.message}. Please ensure the backend is running.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          Smart Recommendation
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Find the perfect plant based on your specific environment and climate.
        </p>
      </header>

      {!showResults ? (
        <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--bg-surface)', borderRadius: '1.5rem', border: '1px solid var(--border-color)' }}>
          <form onSubmit={handleRecommendationSubmit}>
            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>1.</span> Where are you located?
              </label>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, position: 'relative', minWidth: '250px' }}>
                  <MapPin size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input 
                    type="text" 
                    placeholder="Enter city or zip code" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '0.75rem', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <button type="button" className="btn-secondary" onClick={requestLocation} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                  <MapPin size={16} /> Use My Location
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>2.</span> Where will your plant live?
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                {['indoor', 'rooftop', 'balcony', 'garden'].map(type => (
                  <label key={type} style={{ 
                    cursor: 'pointer',
                    padding: '1rem',
                    borderRadius: '1rem',
                    border: '2px solid',
                    borderColor: spaceType === type ? 'var(--primary)' : 'var(--border-color)',
                    backgroundColor: spaceType === type ? 'var(--primary-light)' : 'var(--bg-secondary)',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}>
                    <input type="radio" name="space" value={type} onChange={(e) => setSpaceType(e.target.value)} checked={spaceType === type} style={{ display: 'none' }} />
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                      {type === 'indoor' ? '🏠' : type === 'rooftop' ? '☀️' : type === 'balcony' ? '🪴' : '🌳'}
                    </div>
                    <div style={{ fontWeight: '600', textTransform: 'capitalize' }}>{type}</div>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '2.5rem' }}>
              <label style={{ display: 'block', fontWeight: '600', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>3.</span> Available natural light?
              </label>
              <div style={{ padding: '0 1rem' }}>
                <input 
                  type="range" min="1" max="3" 
                  value={lightLevel} 
                  onChange={(e) => setLightLevel(e.target.value)} 
                  style={{ width: '100%', accentColor: 'var(--primary)', height: '8px', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  <div style={{ textAlign: 'center', color: lightLevel === '1' ? 'var(--primary)' : 'inherit', fontWeight: lightLevel === '1' ? '700' : '400' }}>☁️ Low</div>
                  <div style={{ textAlign: 'center', color: lightLevel === '2' ? 'var(--primary)' : 'inherit', fontWeight: lightLevel === '2' ? '700' : '400' }}>🌤️ Medium</div>
                  <div style={{ textAlign: 'center', color: lightLevel === '3' ? 'var(--primary)' : 'inherit', fontWeight: lightLevel === '3' ? '700' : '400' }}>☀️ High</div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', fontSize: '1.125rem' }}>
              {loading ? 'Finding perfect plants...' : (
                <>
                  Find My Perfect Match <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="results-view animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Top Matches for You</h3>
            <button className="btn-secondary" onClick={() => setShowResults(false)} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              Edit Details
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {recommendedPlants.length > 0 ? (
              recommendedPlants.map(plant => (
                <div key={plant.id} className="glass-panel plant-card" onClick={() => navigate(`/purchase/${plant.id}`)} style={{ 
                  background: 'var(--bg-surface)', 
                  borderRadius: '1.5rem', 
                  overflow: 'hidden', 
                  border: '1px solid var(--border-color)', 
                  cursor: 'pointer', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                }}>
                  <div style={{ height: '180px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', padding: '1rem' }}>
                    <img src={plant.image} alt={plant.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.125rem', fontWeight: '700' }}>{plant.name}</h4>
                      <span style={{ color: 'var(--primary)', fontWeight: '700' }}>{plant.price}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      <MapPin size={14} /> {plant.location}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                      <span style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '1rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={12} /> {plant.purification_score * 10}% Health Impact
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.125rem' }}>No plants found for this specific combination. Try adjusting your space or light level!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
