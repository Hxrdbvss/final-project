// frontend/src/components/Card.jsx
import PropTypes from 'prop-types';

function Card({ children, className = '' }) {
  return (
    <div
      className={`bg-white/15 dark:bg-gray-800/15 backdrop-blur-lg border border-white/50 dark:border-white/20 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Card;