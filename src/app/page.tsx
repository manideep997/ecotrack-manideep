'use client';
import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import Chatbot from '@/components/Chatbot';

export default function Home() {
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState('');

  useEffect(() => {
    fetch('/api/cities').then(res => res.json()).then(data => {
      if (Array.isArray(data)) {
        setCities(data);
        if (data.length > 0) setSelectedCity(data[0].name);
      } else {
        console.error('Failed to fetch cities:', data);
        setCities([]);
      }
    });
  }, []);

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Track & Reduce Your Carbon Footprint</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', marginBottom: '2rem' }}>
          Welcome to EcoTrack. A beautifully simple way to visualize your environmental impact and get real-time AI-powered insights to help you build sustainable habits.
        </p>
        
        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', padding: '1rem 2rem', borderRadius: '15px' }}>
          <label style={{ marginRight: '1rem', fontWeight: 'bold' }}>Global City Context:</label>
          <select 
            className="input-field" 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            style={{ width: '250px', display: 'inline-block' }}
          >
            {cities.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {selectedCity && <Dashboard selectedCity={selectedCity} cityData={cities.find(c => c.name === selectedCity)} />}
      {selectedCity && <Chatbot selectedCity={selectedCity} />}
    </div>
  );
}
