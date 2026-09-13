import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, Award, AlertCircle } from 'lucide-react';

export function Badge({
  children,
  variant = 'default', // 'verified', 'claimed', 'pending', 'gold', 'slate', 'coral'
  icon = true,
  className = '',
}) {
  if (variant === 'verified') {
    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-verified-green text-white shadow-sm ${className}`}
      >
        {icon && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />}
        {children || 'Verified'}
      </span>
    );
  }

  if (variant === 'claimed') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border border-verified-green text-verified-green bg-transparent ${className}`}
      >
        {icon && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />}
        {children || 'Claimed'}
      </span>
    );
  }

  if (variant === 'pending') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate/10 text-slate border border-hairline-grey ${className}`}
      >
        {icon && <Clock className="w-3.5 h-3.5" />}
        {children || 'Pending'}
      </span>
    );
  }

  if (variant === 'gold') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-ledger-gold/15 text-ledger-gold border border-ledger-gold/40 ${className}`}
      >
        {icon && <Award className="w-3.5 h-3.5 text-ledger-gold" />}
        {children}
      </span>
    );
  }

  if (variant === 'coral') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-alert-coral/10 text-alert-coral border border-alert-coral/30 ${className}`}
      >
        {icon && <AlertCircle className="w-3.5 h-3.5" />}
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-hairline-grey/40 text-ink-navy ${className}`}
    >
      {children}
    </span>
  );
}
