// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Профиль не найден.');
        } else {
          setError('Ошибка при загрузке профиля.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Вы успешно вышли!', { position: 'top-right' });
    navigate('/login');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader color="#50e3c2" size={50} />
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="min-h-screen py-10 px-4 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="card p-6">
          <h2 className="card-title mb-6">Профиль</h2>
          <div className="space-y-4 text-lg">
            <p><strong>ФИО:</strong> {user.full_name || 'Не заполнено'}</p>
            <p><strong>Email:</strong> {user.email || 'Не заполнено'}</p>
            <p><strong>Телефон:</strong> {user.phone || 'Не заполнено'}</p>
            <p><strong>Адрес:</strong> {user.address || 'Не заполнено'}</p>
          </div>
          <div className="mt-6 space-x-4">
            <button
              onClick={handleEditProfile}
              className="btn-primary"
            >
              Изменить профиль
            </button>
            <button
              onClick={handleLogout}
              className="btn-danger"
            >
              Выйти
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default Profile;