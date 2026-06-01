import React from 'react';

/**
 * Standard UI Spinner
 * @param {Object} props
 * @param {number} [props.size=24]
 * @param {string} [props.className='']
 */
const Spinner = ({
  size = 24,
  className = '',
  ...props
}) => {
  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
  };

  return (
    <div
      className={`spinner-cf ${className}`}
      style={{ ...sizeStyle, ...props.style }}
      {...props}
    />
  );
};

export default Spinner;
export { Spinner };
