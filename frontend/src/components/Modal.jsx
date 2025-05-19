// frontend/src/components/Modal.jsx
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Button from './Button';

function Modal({ show, onHide, title, children, onConfirm }) {
  if (!show) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-lg p-6 w-full max-w-md border border-white/50 dark:border-white/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{title}</h3>
          <button
            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            onClick={onHide}
          >
            ✕
          </button>
        </div>
        <div className="mb-4 text-gray-700 dark:text-gray-300">{children}</div>
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onHide}>
            Отмена
          </Button>
          {onConfirm && (
            <Button variant="danger" onClick={onConfirm}>
              Подтвердить
            </Button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

Modal.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onConfirm: PropTypes.func,
};

export default Modal;