import React from 'react';

/**
 * Standard UI Button
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'primary'|'secondary'|'ghost'|'danger'} [props.variant='primary']
 * @param {string} [props.className='']
 * @param {boolean} [props.disabled=false]
 */
const Button = ({
  children,
  variant = 'primary',
  className = '',
  disabled = false,
  ...props
}) => {
  return (
    <button
      className={`btn-cf btn-cf-${variant} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
export { Button };
