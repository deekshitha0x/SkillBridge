import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary', 'secondary', 'verified', 'gold', 'coral', 'outline'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) {
  const baseStyle =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-ink-navy text-bone hover:bg-opacity-90 focus:ring-ink-navy shadow-sm',
    secondary:
      'bg-hairline-grey text-ink-navy hover:bg-slate/20 focus:ring-slate',
    verified:
      'bg-verified-green text-white hover:bg-opacity-90 focus:ring-verified-green shadow-sm',
    gold:
      'bg-ledger-gold text-ink-navy hover:bg-opacity-90 focus:ring-ledger-gold shadow-sm font-semibold',
    coral:
      'bg-alert-coral text-white hover:bg-opacity-90 focus:ring-alert-coral shadow-sm',
    outline:
      'border border-hairline-grey text-ink-navy hover:bg-bone focus:ring-ink-navy',
  };

  const sizes = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base font-semibold',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyle} ${variants[variant] || variants.primary} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
