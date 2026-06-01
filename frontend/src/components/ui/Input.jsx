import React from 'react';

/**
 * Standard UI Input
 * @param {Object} props
 * @param {string} [props.className='']
 * @param {boolean} [props.disabled=false]
 * @param {string} [props.type='text']
 */
const Input = ({
  className = '',
  disabled = false,
  type = 'text',
  ...props
}) => {
  return (
    <input
      type={type}
      className={`input-cf ${className}`}
      disabled={disabled}
      {...props}
    />
  );
};

export default Input;
export { Input };
