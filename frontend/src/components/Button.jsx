// src/components/ui/Button.jsx
import PropTypes from 'prop-types';

function Button({ children, variant = 'primary', className = '', disabled, ...props }) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50', // Добавлен вариант outline
    ghost: 'text-gray-700 hover:bg-gray-100', // Добавлен вариант ghost
  };

  return (
    <button
      className={`px-4 py-2 rounded-md font-medium transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'outline', 'ghost']),
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Button;