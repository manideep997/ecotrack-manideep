'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X, Smartphone, Lock, KeyRound } from 'lucide-react';

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [step, setStep] = useState<'LOGIN' | 'OTP'>('LOGIN');
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockMode, setMockMode] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Check if user exists
      const checkRes = await fetch('/api/auth/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile })
      });
      const checkData = await checkRes.json();

      if (checkData.exists) {
        // User exists, try to log in
        const res = await signIn('credentials', { email: mobile, password, redirect: false });
        if (res?.error) {
          setError('Invalid password');
        } else {
          onClose();
          window.location.reload();
        }
      } else {
        // New user, send OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedOtp(otp);

        const sendRes = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: mobile, otp })
        });
        const sendData = await sendRes.json();
        
        if (sendData.mock) {
          setMockMode(true);
        }
        
        setStep('OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (otpInput !== generatedOtp) {
      setError('Incorrect OTP. Please try again.');
      setLoading(false);
      return;
    }

    try {
      // Register user
      const regRes = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: mobile, password, name })
      });

      if (regRes.ok) {
        // Log in immediately after register
        await signIn('credentials', { email: mobile, password, redirect: false });
        onClose();
        window.location.reload();
      } else {
        setError('Failed to create account.');
      }
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="glass-panel" style={{ width: '90%', maxWidth: '400px', position: 'relative', background: '#0f172a' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
          <X size={24} />
        </button>

        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
          {step === 'LOGIN' ? 'Welcome to EcoTrack' : 'Verify Your Number'}
        </h2>

        {error && <div style={{ color: '#ef4444', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}
        
        {step === 'LOGIN' ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Mobile Number</label>
              <div style={{ position: 'relative' }}>
                <Smartphone size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="tel"
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="+1234567890" 
                  value={mobile} 
                  onChange={e => setMobile(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="password"
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="••••••••" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                />
              </div>
            </div>
            <button disabled={loading} type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              {loading ? 'Please wait...' : 'Continue'}
            </button>
            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '1rem' }}>
              If you don't have an account, one will be created automatically.
            </p>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {mockMode && (
              <div style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fcd34d', padding: '1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1rem', border: '1px solid #f59e0b' }}>
                <strong>Note for Testing Team:</strong> Real SMS quota has been exceeded for today. 
                <br/>Your Mock OTP is: <span style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '2px', color: '#fff' }}>{generatedOtp}</span>
              </div>
            )}
            {!mockMode && (
              <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                We've sent a real SMS with a 6-digit code to <strong>{mobile}</strong>.
              </p>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Your Name</label>
              <div style={{ position: 'relative' }}>
                <input 
                  required
                  type="text"
                  className="input-field" 
                  style={{ paddingLeft: '1rem' }}
                  placeholder="John Doe" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Enter OTP</label>
              <div style={{ position: 'relative' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input 
                  required
                  type="text"
                  maxLength={6}
                  className="input-field" 
                  style={{ paddingLeft: '2.5rem', fontSize: '1.2rem', letterSpacing: '4px', textAlign: 'center' }}
                  placeholder="------" 
                  value={otpInput} 
                  onChange={e => setOtpInput(e.target.value)} 
                />
              </div>
            </div>
            <button disabled={loading} type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
              {loading ? 'Verifying...' : 'Verify & Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
