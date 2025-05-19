import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { createRequest, getProfile, updateProfile } from '../services/api';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaCalendarAlt, FaClock } from 'react-icons/fa';

function RequestForm() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    equipment_type: '',
    preferred_date: '',
    preferred_time_of_day: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getProfile();
        setFormData((prev) => ({
          ...prev,
          full_name: profile.full_name || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
        }));
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
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-200">
      <div className="w-full max-w-4xl mt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-50 rounded-lg shadow-md p-6 sm:p-8"
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-900 text-center">Создать заявку</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col mb-4">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">ФИО</label>
              <div className="relative flex items-center">
                <FaUser className="absolute left-3 text-gray-600" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Введите ФИО"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">Email</label>
              <div className="relative flex items-center">
                <FaEnvelope className="absolute left-3 text-gray-600" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Введите email"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">Телефон</label>
              <div className="relative flex items-center">
                <FaPhone className="absolute left-3 text-gray-600" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Введите телефон"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">Адрес</label>
              <div className="relative flex items-center">
                <FaMapMarkerAlt className="absolute left-3 text-gray-600" />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Введите адрес"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">Тип оборудования *</label>
              <div className="relative flex items-center">
                <FaTools className="absolute left-3 text-gray-600" />
                <select
                  name="equipment_type"
                  value={formData.equipment_type}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Выберите тип оборудования</option>
                  <option value="Газовый котёл">Газовый котёл</option>
                  <option value="Газовая плита">Газовая плита</option>
                  <option value="Газопровод">Газопровод</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col mb-4">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">Желаемая дата *</label>
              <div className="relative flex items-center">
                <FaCalendarAlt className="absolute left-3 text-gray-600" />
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleInputChange}
                  min={minDate}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            <div className="flex flex-col mb-4 sm:col-span-2">
              <label className="text-sm sm:text-base font-medium text-gray-800 mb-1">Время суток *</label>
              <div className="relative flex items-center">
                <FaClock className="absolute left-3 text-gray-600" />
                <select
                  name="preferred_time_of_day"
                  value={formData.preferred_time_of_day}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-gray-900 text-sm sm:text-base focus:ring-indigo-500 focus:border-indigo-500"
                  required
                >
                  <option value="">Выберите время суток</option>
                  <option value="morning">Утро (9:00–12:00)</option>
                  <option value="afternoon">День (12:00–15:00)</option>
                  <option value="evening">Вечер (15:00–18:00)</option>
                </select>
              </div>
            </div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 sm:col-span-2 flex justify-center"
            >
              <button
                type="submit"
                disabled={loading}
                className="bg-gray-800 text-white px-6 py-2 rounded-md text-sm sm:text-base hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-400 flex items-center gap-2"
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : 'Создать'}
              </button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

export default RequestForm;