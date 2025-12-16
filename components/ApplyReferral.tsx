'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function ApplyReferral() {
  const { status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetch('/api/affiliate/apply-ref', {
        method: 'POST',
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => console.log('Referral applied:', data))
        .catch((err) => console.error('Referral error:', err));
    }
  }, [status]);

  return null; // Không render gì cả
}