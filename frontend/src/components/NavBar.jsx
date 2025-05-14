import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome, FaList, FaUser, FaSignOutAlt } from 'react-icons/fa';
import styles from './NavBar.module.css';

function NavBar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const navItems = [
    { to: '/', label: 'Главная', icon: <FaHome className="text-lg" /> },
    { to: '/requests', label: 'Заявки', icon: <FaList className="text-lg" /> },
    { to: '/profile', label: 'Профиль', icon: <FaUser className="text-lg" /> },
    { to: null, label: 'Выход', icon: <FaSignOutAlt className="text-lg" />, onClick: handleLogout },
  ];

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${styles.nav} sm:flex fixed top-0 left-0 w-full z-50 shadow-lg`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-4">
        <div className="flex justify-between items-center w-full max-w-7xl mx-auto">
          <NavLink
            to="/"
            className={`${styles.brand} text-white text-xl font-bold hover:text-teal-400 transition-colors`}
          >
            Gas Service
          </NavLink>
          <ul className="flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.li
                key={item.label || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index, duration: 0.3 }}
                className={styles.navItem}
              >
                {item.to ? (
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `${styles.navItem} flex items-center text-white text-base py-2 px-4 rounded-md hover:text-teal-400 transition-colors ${isActive ? 'active' : ''}`
                    }
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </NavLink>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={item.onClick}
                    className={`${styles.navItem} flex items-center text-white text-base py-2 px-4 rounded-md`}
                  >
                    {item.icon}
                    <span className="ml-2">{item.label}</span>
                  </motion.button>
                )}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </motion.nav>
  );
}

export default NavBar;