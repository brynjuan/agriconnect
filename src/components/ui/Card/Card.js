import React from 'react';
import PropTypes from 'prop-types';

// Card component - Parent container
export const Card = ({ children, className, hover = true, ...props }) => {
  return (
    <div 
      className={`bg-white rounded-xl border border-gray-100 shadow-sm transition duration-200 ease-in-out 
        ${hover ? 'hover:shadow-lg hover:border-gray-200' : ''} 
        ${className || ''}`} 
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  hover: PropTypes.bool
};

// CardHeader component
export const CardHeader = ({ children, className, title, subtitle, gradient = false, ...props }) => {
  return (
    <div 
      className={`p-6 border-b border-gray-100 first:rounded-t-xl
        ${gradient ? 'bg-gradient-to-b from-white to-stone-50' : 'bg-white'}
        ${className || ''}`}
      {...props}
    >
      {title ? (
        <div>
          <h3 className="text-xl font-semibold text-gray-800 transition duration-200 ease-in-out hover:text-green-700">{title}</h3>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      ) : children}
    </div>
  );
};

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  gradient: PropTypes.bool
};

// CardContent component
export const CardContent = ({ children, className, gradient = false, ...props }) => {
  return (
    <div 
      className={`p-6 first:rounded-t-xl last:rounded-b-xl
        ${gradient ? 'bg-gradient-to-b from-white to-stone-50' : 'bg-white'}
        ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  gradient: PropTypes.bool
};

// CardFooter component
export const CardFooter = ({ children, className, ...props }) => {
  return (
    <div 
      className={`p-6 border-t border-gray-100 bg-stone-50 last:rounded-b-xl
        ${className || ''}`}
      {...props}
    >
      {children}
    </div>
  );
};

CardFooter.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

// Default export for convenience
export default Card;
