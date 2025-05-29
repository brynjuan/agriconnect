import React from 'react';
import PropTypes from 'prop-types';

const Checkbox = ({
  id,
  name,
  checked,
  onChange,
  label,
  error,
  required = false,
  disabled = false,
  className = '',
  labelClassName = '',
  ...props
}) => {
  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          required={required}
          disabled={disabled}
          className={`
            h-5 w-5
            text-accent-500 
            border-2 border-accent-200 
            rounded 
            focus:ring-accent-400 focus:ring-opacity-25
            ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
          `}
          {...props}
        />
        
        <div className="ml-3">
          {label && (
            <label 
              htmlFor={id} 
              className={`text-sm text-gray-900 select-none ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'} ${labelClassName}`}
            >
              {/* Tampilkan label dalam Bahasa Indonesia */}
              {label}
              {required && <span className="ml-1 text-accent-500">*</span>}
            </label>
          )}
        </div>
      </div>
      
      {error && (
        // Pesan error dalam Bahasa Indonesia
        <p className="mt-1 ml-8 text-sm text-red-600">
          {error === 'This field is required' ? 'Bagian ini wajib diisi' : error}
        </p>
      )}
    </div>
  );
};

Checkbox.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.node,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  labelClassName: PropTypes.string
};

export default Checkbox;
