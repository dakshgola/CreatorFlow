import React from 'react';

/**
 * Standard UI Card
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'default'|'elevated'|'outlined'} [props.variant='default']
 * @param {string} [props.className='']
 */
const Card = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <div
      className={`card-cf card-cf-${variant} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
export { Card };
