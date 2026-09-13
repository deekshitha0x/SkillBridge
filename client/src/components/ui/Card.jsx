import React from 'react';

export function Card({ children, className = '', onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-lg border border-hairline-grey shadow-sm p-5 transition-all duration-150 ${
        onClick ? 'cursor-pointer hover:border-slate hover:shadow-md' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className = '' }) {
  return (
    <div className={`flex items-start justify-between mb-4 ${className}`}>
      <div>
        <h3 className="font-serif text-xl font-semibold text-ink-navy">{title}</h3>
        {subtitle && <p className="text-sm text-slate mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
