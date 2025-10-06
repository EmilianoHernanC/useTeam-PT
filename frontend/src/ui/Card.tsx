import type{ ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card = ({ children, className = '', hover = false }: CardProps) => {
  return (
    <div
      className={`
        bg-slate-800 rounded-lg border border-slate-700 
        ${hover ? 'hover:border-slate-600 hover:shadow-lg transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};