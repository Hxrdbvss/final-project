import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient navbar navbar-expand-lg fixed-top"
    >
      <div className="container-fluid px-4 sm:px-6 lg:px-8">
        <NavLink className="navbar-brand text-white text-lg sm:text-xl" to="/">
          Gas Service
        </NavLink>
        <button
          className="navbar-toggler text-white"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNav"
          aria-expanded={isOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={`collapse navbar-collapse ${isOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-auto space-x-2 sm:space-x-4">
            <li className="nav-item">
              <NavLink
                to="/"
                className="nav-link text-sm sm:text-base py-2 px-3 rounded-md"
                activeClassName="active"
                onClick={() => setIsOpen(false)}
              >
                Главная
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/requests"
                className="nav-link text-sm sm:text-base py-2 px-3 rounded-md"
                activeClassName="active"
                onClick={() => setIsOpen(false)}
              >
                Заявки
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink
                to="/profile"
                className="nav-link text-sm sm:text-base py-2 px-3 rounded-md"
                activeClassName="active"
                onClick={() => setIsOpen(false)}
              >
                Профиль
              </NavLink>
            </li>
            <li className="nav-item">
              <button
                onClick={handleLogout}
                className="btn-primary text-sm sm:text-base py-2 px-4 mt-2 sm:mt-0 w-full sm:w-auto"
              >
                Выход
              </button>
            </li>
          </ul>
        </div>
      </div>
    </motion.nav>
  );
}

export default NavBar;