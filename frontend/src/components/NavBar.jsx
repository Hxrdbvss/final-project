import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfile } from '../services/api';

function NavBar() {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const profile = await getProfile();
        setUserRole(profile.role);
        localStorage.setItem('user_role', profile.role); // Сохраняем роль в localStorage
      } catch (err) {
        console.error('Ошибка при загрузке роли:', err);
      }
    };
    if (localStorage.getItem('access_token')) {
      fetchUserRole();
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_role');
    toast.success('Вы успешно вышли!', { position: 'top-right' });
    navigate('/login');
  };

  const isAuthenticated = !!localStorage.getItem('access_token');

  return (
    <nav className="fixed top-0 left-0 right-0 bg-gray-800 text-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold">
              GasService
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/profile" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                  Профиль
                </Link>
                <Link to="/requests" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                  Мои заявки
                </Link>
                {userRole === 'ADMIN' && (
                  <>
                    <Link to="/request-list" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                      Все заявки
                    </Link>
                    <Link to="/create-engineer" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                      Создать инженера
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="hover:bg-gray-700 px-3 py-2 rounded-md"
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                  Войти
                </Link>
                <Link to="/register" className="hover:bg-gray-700 px-3 py-2 rounded-md">
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;