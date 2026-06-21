'use client';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import AuthModal from './AuthModal';

export default function AuthButton() {
  const { data: session } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (session && session.user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
          {session.user.name}
        </span>
        <button className="btn-secondary" onClick={() => signOut()}>Sign Out</button>
      </div>
    );
  }

  return (
    <>
      <button className="btn-secondary" onClick={() => setIsModalOpen(true)}>Login / Register</button>
      {isModalOpen && <AuthModal onClose={() => setIsModalOpen(false)} />}
    </>
  );
}
