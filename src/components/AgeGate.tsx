'use client';

import Link from 'next/link';
import { useState, useSyncExternalStore } from 'react';

const AGE_KEY = 'americanonly_age_confirmed';
const subscribeToAgeConfirmation = () => () => {};
const getAgeConfirmationSnapshot = () => localStorage.getItem(AGE_KEY) !== '1';
const getAgeConfirmationServerSnapshot = () => false;

export default function AgeGate() {
  const needsConfirmation = useSyncExternalStore(
    subscribeToAgeConfirmation,
    getAgeConfirmationSnapshot,
    getAgeConfirmationServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const show = needsConfirmation && !dismissed;

  function confirm() {
    localStorage.setItem(AGE_KEY, '1');
    setDismissed(true);
  }

  function exit() {
    window.location.href = 'https://www.google.com';
  }

  if (!show) return null;

  return (
    <div className="age-gate-overlay" role="dialog" aria-modal="true" aria-labelledby="age-gate-title">
      <div className="age-gate-modal">
        <div className="age-gate-logo">🇺🇸 OnlyAmericanFans</div>
        <h1 id="age-gate-title" className="age-gate-title">Adults Only</h1>
        <p className="age-gate-text">
          This website contains adult content intended for persons aged <strong>18 years and over</strong>.
          By entering you confirm that you are at least 18 years of age and consent to viewing
          adult material in compliance with all laws applicable in your jurisdiction.
        </p>
        <div className="age-gate-actions">
          <button className="age-gate-btn age-gate-btn--confirm" onClick={confirm}>
            I am 18 or older — Enter
          </button>
          <button className="age-gate-btn age-gate-btn--exit" onClick={exit}>
            I am under 18 — Exit
          </button>
        </div>
        <p className="age-gate-legal">
          By entering, you also agree to our{' '}
          <Link href="/terms" style={{ color: 'var(--accent)' }}>Terms of Use</Link> and{' '}
          <Link href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
