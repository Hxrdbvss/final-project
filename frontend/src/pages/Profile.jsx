import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';

function Profile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileResponse = await getProfile();
        setUser(profileResponse);
        setFormData({
          full_name: profileResponse.full_name || '',
          email: profileResponse.email || '',
          phone: profileResponse.phone || '',
          address: profileResponse.address || '',
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Профиль не найден.');
        } else {
          setError('Ошибка при загрузке данных.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Вы успешно вышли!', { position: 'top-right' });
    navigate('/login');
  };

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedProfile = await updateProfile(formData);
      setUser(updatedProfile);
      setIsEditing(false);
      toast.success('Профиль успешно обновлён!', { position: 'top-right' });
    } catch (err) {
      setError('Ошибка при обновлении профиля.');
      toast.error('Ошибка при обновлении профиля.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader color="#50e3c2" size={50} />
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="min-h-screen py-20 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto" // Увеличиваем ширину карточки с max-w-lg до max-w-2xl
      >
        <div className="card p-8 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900 dark:to-gray-800 shadow-xl rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
          <h2 className="card-title text-4xl font-bold mb-8 text-blue-600 dark:text-blue-300 tracking-tight">
            Профиль
          </h2>
          <div className="space-y-6 text-lg text-gray-800 dark:text-gray-200">
            <p className="flex items-center">
              <FaUser className="mr-4 text-blue-500 dark:text-blue-300 text-2xl" />
              <span>
                <strong className="font-semibold text-lg">ФИО:</strong> {user.full_name || 'Не заполнено'}
              </span>
            </p>
            <p className="flex items-center">
              <FaEnvelope className="mr-4 text-blue-500 dark:text-blue-300 text-2xl" />
              <span>
                <strong className="font-semibold text-lg">Email:</strong> {user.email || 'Не заполнено'}
              </span>
            </p>
            <p className="flex items-center">
              <FaPhone className="mr-4 text-blue-500 dark:text-blue-300 text-2xl" />
              <span>
                <strong className="font-semibold text-lg">Телефон:</strong> {user.phone || 'Не заполнено'}
              </span>
            </p>
            <p className="flex items-center">
              <FaMapMarkerAlt className="mr-4 text-blue-500 dark:text-blue-300 text-2xl" />
              <span>
                <strong className="font-semibold text-lg">Адрес:</strong> {user.address || 'Не заполнено'}
              </span>
            </p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleEditProfile}
              className="btn-primary text-base px-6 py-3 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-colors duration-200"
            >
              Изменить профиль
            </button>
            <button
              onClick={handleLogout}
              className="btn-danger text-base px-6 py-3 rounded-md bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 transition-colors duration-200"
            >
              Выйти
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-primary text-base px-6 py-3 rounded-md bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 transition-colors duration-200"
            >
              Создать заявку
            </button>
            <button
              onClick={() => navigate('/requests')}
              className="btn-primary text-base px-6 py-3 rounded-md bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-colors duration-200"
            >
              Мои заявки
            </button>
          </div>
        </div>

        {isEditing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
          >
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md"> {/* Увеличиваем модальное окно с max-w-sm до max-w-md */}
              <h3 className="text-xl mb-5 text-gray-900 dark:text-gray-100">Редактировать профиль</h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-base">ФИО</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-base">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-base">Телефон</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block mb-2 text-gray-700 dark:text-gray-300 text-base">Адрес</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-base"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={handleCloseEdit}
                    className="btn-secondary text-base px-6 py-3 rounded-md"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-base px-6 py-3 rounded-md"
                    disabled={loading}
                  >
                    {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Сохранить'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default Profile;