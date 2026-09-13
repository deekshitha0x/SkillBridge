import React from 'react';
import { ShieldCheck } from 'lucide-react';

export function VerifiedBadge({ showText = true, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-verified-green text-white shadow-sm ${className}`}
    >
      <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
      {showText && <span>Verified</span>}
    </span>
  );
}
