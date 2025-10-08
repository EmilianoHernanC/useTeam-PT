import type { InputHTMLAttributes } from 'react';
import { forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', style = {}, ...props }, ref) => {
    const defaultStyle = {
      backgroundColor: 'rgba(255,255,255,0.6)',
      borderColor: '#D4C5A0',
      color: '#1a1a1a',
      fontFamily: '"Courier New", Courier, monospace',
    };

    return (
      <div className="w-full">
        {label && (
          <label 
            className="block text-sm font-bold mb-2"
            style={{ 
              color: '#1a1a1a',
              fontFamily: '"Courier New", Courier, monospace'
            }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full px-4 py-3 
            border-2 rounded-xl
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          style={{ ...defaultStyle, ...style }}
          {...props}
        />
        {error && (
          <p 
            className="mt-1 text-sm"
            style={{ 
              color: '#ef4444',
              fontFamily: '"Courier New", Courier, monospace'
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';