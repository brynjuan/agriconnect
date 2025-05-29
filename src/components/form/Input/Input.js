"use client";

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';

const Input = forwardRef(({
  type = 'text',
  id,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  error,
  success,
  icon: Icon,
  className = '',
  required = false,
  disabled = false,
  autoComplete,
  ...props
}, ref) => {
  // Generate status classes
  const getStatusClasses = () => {
    if (error) {
      return 'border-red-300 hover:border-red-400 focus:border-red-500 focus:ring-red-200';
    }
    if (success) {
      return 'border-green-300 hover:border-green-400 focus:border-green-500 focus:ring-green-200';
    }
    return 'border-gray-200 hover:border-gray-400 focus:border-gray-500 focus:ring-gray-200';
  };

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className={`h-5 w-5 ${error ? 'text-red-400' : success ? 'text-green-400' : 'text-gray-400'}`} aria-hidden="true" />
          </div>
        )}
        
        <input
          type={type}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            block w-full 
            px-4 py-2.5 
            ${Icon ? 'pl-10' : ''}
            bg-white
            border rounded-md 
            shadow-sm
            placeholder-gray-400 
            transition-all duration-200 ease-in-out
            focus:outline-none focus:ring-1 focus:ring-offset-0
            text-gray-900
            text-sm
            ${getStatusClasses()}
            ${disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : ''}
            ${className}
          `}
          ref={ref}
          {...props}
        />

        {/* Success Icon */}
        {success && !error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Error Icon */}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {success && !error && (
        <p className="mt-2 text-sm text-green-600">{success}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  label: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.string,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  autoComplete: PropTypes.string
};

export default Input;
