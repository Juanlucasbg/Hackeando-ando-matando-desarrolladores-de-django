import React, { forwardRef } from 'react';
import '../styles/responsive.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Reusable button component with multiple variants and states
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const getButtonClasses = () => {
      const baseClasses = 'btn';
      const variantClasses = `btn-${variant}`;
      const sizeClasses = `btn-${size}`;
      const stateClasses = loading ? 'btn-loading' : '';
      const disabledClasses = disabled ? 'btn-disabled' : '';
      const widthClasses = fullWidth ? 'btn-full-width' : '';

      return [
        baseClasses,
        variantClasses,
        sizeClasses,
        stateClasses,
        disabledClasses,
        widthClasses,
        className,
      ].filter(Boolean).join(' ');
    };

    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={getButtonClasses()}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        aria-describedby={loading ? 'loading-description' : undefined}
        {...props}
      >
        {loading && (
          <span className="btn-spinner" aria-hidden="true">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 12a9 9 0 11-6.219-8.56" />
            </svg>
          </span>
        )}

        {leftIcon && !loading && (
          <span className="btn-icon btn-icon-left" aria-hidden="true">
            {leftIcon}
          </span>
        )}

        <span className="btn-text">
          {children}
        </span>

        {rightIcon && !loading && (
          <span className="btn-icon btn-icon-right" aria-hidden="true">
            {rightIcon}
          </span>
        )}

        {loading && (
          <span id="loading-description" className="sr-only">
            Loading, please wait
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;