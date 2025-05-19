// src/components/NavBar.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '@/components/Button'; // Изменено с { Button } на просто Button
import { Menu, X } from 'lucide-react';

function NavBar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('access_token');

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    navigate('/login');
  };

  const menuItems = [
    { label: 'Главная', path: '/' },
    { label: 'Заявки', path: '/requests' },
    { label: 'Профиль', path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass h-[var(--navbar-height)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-full">
        {/* Логотип */}
        <div className="flex-shrink-0">
          <Link to="/" className="text-xl font-bold text-primary-500 hover-effect">
            GasService
          </Link>
        </div>

        {/* Десктопное меню */}
        <div className="hidden md:flex space-x-4 items-center">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="text-gray-700 hover-effect"
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-primary-500 text-primary-500 hover:bg-indigo-50 hover-effect"
            >
              Выйти
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-primary-500 text-primary-500 hover:bg-indigo-50 hover-effect"
            >
              Войти
            </Button>
          )}
        </div>

        {/* Кнопка бургер-меню (мобильная версия) */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover-effect"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Мобильное меню */}
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden glass border-t border-white/20"
        >
          <div className="flex flex-col space-y-2 p-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className="text-gray-700 hover-effect py-2"
              >
                {item.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <Button
                variant="outline"
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="border-primary-500 text-primary-500 hover:bg-indigo-50 hover-effect"
              >
                Выйти
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  navigate('/login');
                  setIsOpen(false);
                }}
                className="border-primary-500 text-primary-500 hover:bg-indigo-50 hover-effect"
              >
                Войти
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}

export default NavBar;