// frontend/src/components/Input.jsx
import PropTypes from 'prop-types';

function Input({ label, name, value, onChange, placeholder, type = 'text', required, error, icon: Icon, ...props }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
            size={16}
          />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`w-full px-4 py-2 ${Icon ? 'pl-10' : ''} border border-gray-200 dark:border-gray-700 rounded-md bg-white/90 dark:bg-gray-800/90 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm sm:text-base ${error ? 'border-red-500' : ''}`}
          {...props}
        />
      </div>
      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  type: PropTypes.string,
  required: PropTypes.bool,
  error: PropTypes.string,
  icon: PropTypes.elementType,
};

export default Input;