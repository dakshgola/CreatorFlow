import React from 'react';

/**
 * Standard UI Badge
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {'default'|'success'|'warning'|'danger'|'info'|'accent'} [props.variant='default']
 * @param {string} [props.className='']
 */
const Badge = ({
  children,
  variant = 'default',
  className = '',
  ...props
}) => {
  return (
    <span
      className={`badge-cf badge-cf-${variant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
export { Badge };
