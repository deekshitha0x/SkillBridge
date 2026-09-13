import React from 'react';

export function ProgressBar({ value = 0, max = 100, variant = 'primary', className = '' }) {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);

  const variants = {
    primary: 'bg-ink-navy',
    verified: 'bg-verified-green',
    gold: 'bg-ledger-gold',
    coral: 'bg-alert-coral',
  };

  return (
    <div className={`w-full bg-hairline-grey/50 rounded-full h-2 overflow-hidden ${className}`}>
      <div
        className={`h-full transition-all duration-300 rounded-full ${variants[variant] || variants.primary}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
