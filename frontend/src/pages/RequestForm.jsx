import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { createRequest, getProfile, updateProfile } from '../services/api';
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaCalendarAlt, FaClock } from 'react-icons/fa';
import styles from './RequestForm.module.css';

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
    <div className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${styles.card} p-4 sm:p-6`}
        >
          <h2 className={`${styles.cardTitle} text-2xl sm:text-3xl`}>Создать заявку</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className={`${styles.formGroup}`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>ФИО</label>
              <div className={`${styles.inputWrapper}`}>
                <FaUser className={`${styles.inputIcon}`} />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Введите ФИО"
                  className={`${styles.formInput} text-sm sm:text-base`}
                  required
                />
              </div>
            </div>
            <div className={`${styles.formGroup}`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>Email</label>
              <div className={`${styles.inputWrapper}`}>
                <FaEnvelope className={`${styles.inputIcon}`} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Введите email"
                  className={`${styles.formInput} text-sm sm:text-base`}
                  required
                />
              </div>
            </div>
            <div className={`${styles.formGroup}`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>Телефон</label>
              <div className={`${styles.inputWrapper}`}>
                <FaPhone className={`${styles.inputIcon}`} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Введите телефон"
                  className={`${styles.formInput} text-sm sm:text-base`}
                  required
                />
              </div>
            </div>
            <div className={`${styles.formGroup}`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>Адрес</label>
              <div className={`${styles.inputWrapper}`}>
                <FaMapMarkerAlt className={`${styles.inputIcon}`} />
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Введите адрес"
                  className={`${styles.formInput} text-sm sm:text-base`}
                  required
                />
              </div>
            </div>
            <div className={`${styles.formGroup}`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>Тип оборудования *</label>
              <div className={`${styles.inputWrapper}`}>
                <FaTools className={`${styles.inputIcon}`} />
                <select
                  name="equipment_type"
                  value={formData.equipment_type}
                  onChange={handleInputChange}
                  className={`${styles.formInput} text-sm sm:text-base`}
                  required
                >
                  <option value="">Выберите тип оборудования</option>
                  <option value="Газовый котёл">Газовый котёл</option>
                  <option value="Газовая плита">Газовая плита</option>
                  <option value="Газопровод">Газопровод</option>
                </select>
              </div>
            </div>
            <div className={`${styles.formGroup}`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>Желаемая дата *</label>
              <div className={`${styles.inputWrapper}`}>
                <FaCalendarAlt className={`${styles.inputIcon}`} />
                <input
                  type="date"
                  name="preferred_date"
                  value={formData.preferred_date}
                  onChange={handleInputChange}
                  min={minDate}
                  className={`${styles.formInput} text-sm sm:text-base`}
                  required
                />
              </div>
            </div>
            <div className={`${styles.formGroup} sm:col-span-2`}>
              <label className={`${styles.formLabel} text-sm sm:text-base`}>Время суток *</label>
              <div className={`${styles.inputWrapper}`}>
                <FaClock className={`${styles.inputIcon}`} />
                <select
                  name="preferred_time_of_day"
                  value={formData.preferred_time_of_day}
                  onChange={handleInputChange}
                  className={`${styles.formInput} text-sm sm:text-base`}
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
                className={`${styles.btnPrimary} text-sm sm:text-base px-6 py-2`}
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