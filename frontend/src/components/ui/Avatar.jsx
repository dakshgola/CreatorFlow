import React from 'react';

/**
 * Standard UI Avatar with initials fallback
 * @param {Object} props
 * @param {string} [props.src]
 * @param {string} [props.alt='Avatar']
 * @param {string} [props.name='']
 * @param {number} [props.size=40]
 * @param {string} [props.className='']
 */
const Avatar = ({
  src,
  alt = 'Avatar',
  name = '',
  size = 40,
  className = '',
  ...props
}) => {
  const getInitials = (fullname) => {
    if (!fullname) return '?';
    const parts = fullname.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.max(12, Math.floor(size / 2.5))}px`,
  };

  return (
    <div
      className={`avatar-cf ${className}`}
      style={{ ...sizeStyle, ...props.style }}
      {...props}
    >
      {src ? (
        <img src={src} alt={alt} />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};

export default Avatar;
export { Avatar };
