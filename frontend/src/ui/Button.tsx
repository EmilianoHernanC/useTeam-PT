import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
  isLoading?: boolean;
}

export const Button = ({
  variant = 'primary',
  size = 'md',
  children,
  isLoading = false,
  disabled,
  className = '',
  style = {},
  ...props
}: ButtonProps) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]';
  
  const variants = {
    primary: {
      backgroundColor: '#08298d',
      color: 'white',
      border: '2px solid #08298d',
      fontFamily: '"Courier New", Courier, monospace',
    },
    secondary: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      color: '#1a1a1a',
      border: '2px solid #D4C5A0',
      fontFamily: '"Courier New", Courier, monospace',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      border: '2px solid #ef4444',
      fontFamily: '"Courier New", Courier, monospace',
    },
    ghost: {
      backgroundColor: 'rgba(0,0,0,0.1)',
      color: '#1a1a1a',
      border: '2px solid #D4C5A0',
      fontFamily: '"Courier New", Courier, monospace',
    },
  };
  
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-7 py-3 text-lg',
  };

  const variantStyle = variants[variant];

  return (
    <button
      className={`${baseStyles} ${sizes[size]} ${className}`}
      style={{ ...variantStyle, ...style }}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
};