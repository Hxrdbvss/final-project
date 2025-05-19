// src/components/Select.jsx
import React from 'react';

function Select({ options, value, onChange, label, ...rest }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-800 mb-1">{label}</label>}
      <select
        value={value}
        onChange={onChange}
        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default Select;