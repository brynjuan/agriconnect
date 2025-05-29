import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  outline = false,
  fullWidth = false,
  disabled = false,
  loading = false,
  icon: Icon = null,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 ease-in-out focus:outline-none focus:ring-1 focus:ring-offset-0 active:transform active:scale-[0.98]';
  
  // Size classes with consistent spacing and better icon support
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[32px]',
    md: 'px-4 py-2 text-base min-h-[40px]',
    lg: 'px-6 py-2.5 text-lg min-h-[48px]',
    icon: 'p-2 aspect-square'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    icon: 'w-5 h-5'
  };

  // Icon spacing classes
  const iconSpacingClasses = {
    sm: iconPosition === 'left' ? 'mr-2' : 'ml-2',
    md: iconPosition === 'left' ? 'mr-3' : 'ml-3',
    lg: iconPosition === 'left' ? 'mr-3' : 'ml-3',
    icon: ''
  };
  
  // Enhanced variant classes with better visual hierarchy
  const variantClasses = {
    primary: outline 
      ? 'border border-green-600 text-green-600 bg-transparent hover:bg-green-50 active:bg-green-100 focus:ring-green-500' 
      : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 focus:ring-green-500 shadow-sm hover:shadow',
    secondary: outline 
      ? 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400' 
      : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100 focus:ring-gray-400 shadow-sm hover:shadow',
    danger: outline 
      ? 'border border-red-500 text-red-500 bg-transparent hover:bg-red-50 active:bg-red-100 focus:ring-red-500' 
      : 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700 focus:ring-red-500 shadow-sm hover:shadow',
    success: outline
      ? 'border border-green-500 text-green-500 bg-transparent hover:bg-green-50 active:bg-green-100 focus:ring-green-500'
      : 'bg-green-500 text-white hover:bg-green-600 active:bg-green-700 focus:ring-green-500 shadow-sm hover:shadow',
    link: 'text-green-600 hover:text-green-700 underline-offset-4 hover:underline bg-transparent p-0 focus:ring-0'
  };
  
  // Enhanced disabled classes
  const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none shadow-none';
  
  // Loading state classes
  const loadingClasses = 'relative text-transparent pointer-events-none';
  
  // Width class
  const widthClass = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={disabled || loading ? undefined : onClick}
      className={`
        ${baseClasses}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? disabledClasses : ''}
        ${loading ? loadingClasses : ''}
        ${widthClass}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      {...props}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`
            h-4 w-4 border-2 border-b-transparent rounded-full animate-spin
            ${outline ? 'border-current' : 'border-white'}
          `}></div>
        </div>
      )}
      
      {/* Button Content with Icon */}
      <span className={`inline-flex items-center justify-center ${loading ? 'opacity-0' : ''}`}>
        {Icon && iconPosition === 'left' && (
          <Icon className={`${iconSizeClasses[size]} ${iconSpacingClasses[size]}`} />
        )}
        {children}
        {Icon && iconPosition === 'right' && (
          <Icon className={`${iconSizeClasses[size]} ${iconSpacingClasses[size]}`} />
        )}
      </span>
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'icon']),
  outline: PropTypes.bool,
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.elementType,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Button;
