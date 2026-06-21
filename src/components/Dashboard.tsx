'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Activity, Medal, Info } from 'lucide-react';
import { CarbonEngine } from '@/lib/carbon';
import { getCityFactors } from '@/lib/emissionFactors';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler
} from 'chart.js';
import { Doughnut, Bar, PolarArea, Line } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, RadialLinearScale, PointElement, LineElement, Filler);

export default function Dashboard({ selectedCity, cityData }: { selectedCity: string, cityData: any }) {
  const { data: session, status } = useSession();
  const engine = new CarbonEngine();
  const factors = getCityFactors(selectedCity);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // input state
  const [cat, setCat] = useState('TRAVEL');
  const [subcat, setSubcat] = useState('Car');
  const [val, setVal] = useState('');

  const fetchActivities = async () => {
    if (status !== 'authenticated' || !selectedCity) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/activities?city=${encodeURIComponent(selectedCity)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setActivities(data);
      } else {
        setActivities([]);
      }
    } catch (e) {
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated') {
      fetchActivities();
    } else {
      setActivities([]);
      setLoading(false);
    }
  }, [selectedCity, status]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!val) return;
    const numVal = parseFloat(val);
    
    const result = engine.process(cat, subcat, numVal, cityData);
    
    await fetch('/api/activities', {
      method: 'POST',
      body: JSON.stringify({ category: cat, subcategory: subcat, inputValue: numVal, unit: cat === 'TRAVEL' ? 'miles' : cat === 'ELECTRICITY' ? 'kWh' : 'servings', cityName: selectedCity }),
      headers: { 'Content-Type': 'application/json' }
    });
    setVal('');
    fetchActivities();
    if (result.insight) alert(result.insight + (result.pointsEarned > 0 ? ` (+${result.pointsEarned} Points!)` : ''));
  };

  const totalCO2 = activities.reduce((acc, curr: any) => acc + curr.co2Emitted, 0).toFixed(2);

  // 1. Doughnut Data
  const categories = ['TRAVEL', 'ELECTRICITY', 'FOOD'];
  const categoryData = categories.map(cat => 
    activities.filter((a: any) => a.category === cat).reduce((sum, a: any) => sum + a.co2Emitted, 0)
  );

  const doughnutData = {
    labels: ['Travel', 'Electricity', 'Food'],
    datasets: [{
      data: categoryData,
      backgroundColor: ['#0ea5e9', '#f59e0b', '#10b981'],
      borderWidth: 0,
    }],
  };

  // 2. Bar Data
  const dates = [...new Set(activities.map((a: any) => new Date(a.date).toLocaleDateString()))].reverse();
  const dateData = dates.map(d => 
    activities.filter((a: any) => new Date(a.date).toLocaleDateString() === d).reduce((sum, a: any) => sum + a.co2Emitted, 0)
  );
  
  const barData = {
    labels: dates.length > 0 ? dates.slice(-14) : ['No Data'],
    datasets: [{
      label: 'Emissions (kg CO₂)',
      data: dateData.length > 0 ? dateData.slice(-14) : [0],
      backgroundColor: '#10b981',
      borderRadius: 4
    }]
  };

  // 3. Subcategories Data (Toxic Subcategories)
  const subcategories = [...new Set(activities.map((a: any) => a.subcategory))];
  const toxicDataValues = subcategories.map(sub => 
    activities.filter((a: any) => a.subcategory === sub).reduce((sum, a: any) => sum + a.co2Emitted, 0)
  );

  const toxicData = {
    labels: subcategories.length > 0 ? subcategories : ['No Data'],
    datasets: [{
      label: 'Emissions',
      data: toxicDataValues.length > 0 ? toxicDataValues : [0],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(249, 115, 22, 0.8)'
      ],
      borderRadius: 4,
    }]
  };

  // 4. Line Data (Cumulative)
  const chronologicalActivities = [...activities].sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  let cumulativeSum = 0;
  const cumulativeMap = new Map();
  
  // If only 1 day of data exists, add an artificial "yesterday" start point at 0 so the line chart draws a visible line
  if (chronologicalActivities.length > 0) {
    const firstDate = new Date(chronologicalActivities[0].date);
    const yesterday = new Date(firstDate.getTime() - 86400000).toLocaleDateString();
    cumulativeMap.set(yesterday, 0);
  }

  chronologicalActivities.forEach((a: any) => {
    const d = new Date(a.date).toLocaleDateString();
    cumulativeSum += a.co2Emitted;
    cumulativeMap.set(d, cumulativeSum);
  });

  const lineDates = Array.from(cumulativeMap.keys());
  const lineValues = Array.from(cumulativeMap.values());

  const lineData = {
    labels: lineDates.length > 0 ? lineDates : ['No Data'],
    datasets: [{
      label: 'Cumulative CO₂ (kg)',
      data: lineValues.length > 0 ? lineValues : [0],
      fill: true,
      backgroundColor: 'rgba(14, 165, 233, 0.2)',
      borderColor: '#0ea5e9',
      tension: 0.4
    }]
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem', marginTop: '2rem' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <h2 style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>Your Total Footprint</h2>
            <div style={{ fontSize: '4rem', fontWeight: '800', background: 'linear-gradient(to right, #10b981, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {totalCO2} <span style={{ fontSize: '1.5rem', color: 'var(--color-text-muted)', WebkitTextFillColor: 'initial' }}>kg CO₂</span>
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <h3 style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
             <div style={{ height: '200px', width: '200px' }}>
               <Doughnut data={doughnutData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#ccc' } } } }} />
             </div>
          </div>
        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem' }}>Cumulative Trajectory</h3>
            <div style={{ height: '250px' }}>
              <Line data={lineData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#ccc' } }, x: { grid: { display: false }, ticks: { color: '#ccc' } } }, plugins: { legend: { display: false } } }} />
            </div>
          </div>
          <div className="glass-panel">
            <h3 style={{ marginBottom: '1rem' }}>Daily Spikes</h3>
            <div style={{ height: '250px' }}>
              <Bar data={barData} options={{ maintainAspectRatio: false, scales: { y: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#ccc' } }, x: { grid: { display: false }, ticks: { color: '#ccc' } } }, plugins: { legend: { display: false } } }} />
            </div>
          </div>
        </div>

        {/* Row 3 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
          <div className="glass-panel" style={{ minWidth: 0 }}>
            <h3 style={{ marginBottom: '1rem' }}>Toxic Subcategories</h3>
            <div style={{ height: '250px', display: 'flex', justifyContent: 'center', width: '100%', position: 'relative' }}>
              <Bar 
                data={toxicData} 
                options={{ 
                  maintainAspectRatio: false, 
                  indexAxis: 'y', 
                  plugins: { legend: { display: false } }, 
                  scales: { 
                    x: { beginAtZero: true, grid: { color: '#333' }, ticks: { color: '#ccc' } }, 
                    y: { grid: { display: false }, ticks: { color: '#ccc' } } 
                  } 
                }} 
              />
            </div>
          </div>

          <div className="glass-panel" style={{ minWidth: 0 }}>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
              <Activity size={20} /> Log New Activity
            </h3>
            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <select className="input-field" value={cat} onChange={e => {setCat(e.target.value); setSubcat(e.target.value === 'TRAVEL' ? 'Car' : e.target.value === 'ELECTRICITY' ? 'Grid' : 'Beef')}}>
                  <option value="TRAVEL">Travel</option>
                  <option value="ELECTRICITY">Electricity</option>
                  <option value="FOOD">Food</option>
                </select>
                <select className="input-field" value={subcat} onChange={e => setSubcat(e.target.value)}>
                  {cat === 'TRAVEL' && <><option>Car</option><option>Flight</option><option>Transit</option></>}
                  {cat === 'ELECTRICITY' && <option>Grid</option>}
                  {cat === 'FOOD' && <><option>Beef</option><option>Chicken</option><option>Plant-Based</option></>}
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input className="input-field" type="number" placeholder="Value" value={val} onChange={e => setVal(e.target.value)} style={{ flex: 1, minWidth: '100px' }} />
                <span style={{ color: 'var(--color-text-muted)', width: '80px', flexShrink: 0 }}>{cat === 'TRAVEL' ? 'miles' : cat === 'ELECTRICITY' ? 'kWh' : 'servings'}</span>
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem' }}>Log Activity</button>
            </form>
          </div>
        </div>

        {/* Row 4: Transparency */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Info size={20} color="var(--color-primary)" /> Emission Factors & Data Sources ({selectedCity})
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.9rem' }}>
            
            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Electricity</div>
              <div>{factors.electricity.value} {factors.electricity.unit}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Source: {factors.electricity.source}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: factors.electricity.accuracy === 'High' ? '#10b981' : '#f59e0b' }}>Accuracy: {factors.electricity.accuracy}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Car Travel</div>
              <div>{factors.car.value} {factors.car.unit}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Source: {factors.car.source}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: factors.car.accuracy === 'High' ? '#10b981' : '#f59e0b' }}>Accuracy: {factors.car.accuracy}</div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ fontWeight: '600', color: 'var(--color-primary)', marginBottom: '0.25rem' }}>Public Transit</div>
              <div>{factors.transit.value} {factors.transit.unit}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>Source: {factors.transit.source}</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', color: factors.transit.accuracy === 'High' ? '#10b981' : '#f59e0b' }}>Accuracy: {factors.transit.accuracy}</div>
            </div>

          </div>
        </div>

      </div>

      <div className="glass-panel" style={{ height: 'calc(100vh - 200px)', overflowY: 'auto' }}>
        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>Historical Log</h3>
        {loading ? <p style={{color: 'var(--color-text-muted)'}}>Loading...</p> : activities.length === 0 ? <p style={{color: 'var(--color-text-muted)'}}>No activities yet.</p> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activities.map((act: any) => (
              <div key={act.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                <div>
                  <div style={{ fontWeight: '600' }}>{act.subcategory}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{new Date(act.date).toLocaleDateString()} • {act.inputValue} {act.unit}</div>
                </div>
                <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>+{act.co2Emitted.toFixed(2)} kg</div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
