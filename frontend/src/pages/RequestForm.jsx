import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { createRequest, getProfile, updateProfile, getLocations } from '../services/api';

function RequestForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    equipment_type: '',
    preferred_date: '',
    preferred_time_of_day: '',
    location: '',
  });
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, locationsData] = await Promise.all([
          getProfile(),
          getLocations(),
        ]);
        setFormData((prev) => ({
          ...prev,
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          location: profile.location?.id || '',
        }));
        setLocations(locationsData);
      } catch (err) {
        toast.error('Ошибка при загрузке данных.', { position: 'top-right' });
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipment_type || !formData.preferred_date || !formData.preferred_time_of_day) {
      toast.error('Заполните обязательные поля: тип оборудования, дата и время суток!', { position: 'top-right' });
      return;
    }

    const selectedDate = new Date(formData.preferred_date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    if (selectedDate < tomorrow) {
      toast.error('Дата должна быть не ранее завтрашнего дня!', { position: 'top-right' });
      return;
    }

    const requestData = {
      full_name: formData.full_name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      equipment_type: formData.equipment_type,
      preferred_date: formData.preferred_date,
      preferred_time_of_day: formData.preferred_time_of_day,
      location: formData.location || null,
    };

    setLoading(true);
    try {
      await createRequest(requestData);
      await updateProfile({ email: formData.email });
      toast.success('Заявка создана, время и инженер будут назначены!', { position: 'top-right' });
      navigate('/requests');
    } catch (err) {
      console.error('Ошибка API:', err.response?.data || err.message);
      toast.error('Ошибка при создании заявки.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card w-full max-w-md sm:max-w-lg"
      >
        <div className="p-6 sm:p-8">
          <h2 className="card-title text-center mb-6">
            Создать заявку
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                ФИО
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Введите ФИО"
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите email"
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Телефон
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Введите телефон"
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Адрес
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Введите адрес"
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Местоположение
              </label>
              <select
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              >
                <option value="">Выберите местоположение</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {loc.name}, {loc.city}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Тип оборудования *
              </label>
              <select
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              >
                <option value="">Выберите тип оборудования</option>
                <option value="Газовый котёл">Газовый котёл</option>
                <option value="Газовая плита">Газовая плита</option>
                <option value="Газопровод">Газопровод</option>
              </select>
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Желаемая дата *
              </label>
              <input
                type="date"
                name="preferred_date"
                value={formData.preferred_date}
                onChange={handleInputChange}
                min={minDate}
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-medium text-teal-600 dark:text-teal-400 mb-1">
                Время суток *
              </label>
              <select
                name="preferred_time_of_day"
                value={formData.preferred_time_of_day}
                onChange={handleInputChange}
                className="w-full px-4 py-2 text-sm sm:text-base bg-transparent border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-transparent dark:text-gray-100"
                required
              >
                <option value="">Выберите время суток</option>
                <option value="morning">Утро (9:00–12:00)</option>
                <option value="afternoon">День (12:00–15:00)</option>
                <option value="evening">Вечер (15:00–18:00)</option>
              </select>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-6"
            >
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center"
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : 'Создать'}
              </button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

export default RequestForm;