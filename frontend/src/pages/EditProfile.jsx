// frontend/src/pages/EditProfile.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile } from '../services/api';
import { Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function EditProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setUser(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        });
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

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      errors.email = 'Email должен быть Gmail-адресом (например, example@gmail.com)';
    }
    const phoneRegex = /^(?:\+7|8)\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      errors.phone = 'Введите номер в формате: +7 (код) XXX-XX-XX или 8 (код) XXX-XX-XX';
    }
    if (!formData.full_name.trim()) {
      errors.full_name = 'Поле ФИО не может быть пустым';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      const updatedData = await updateProfile(formData);
      setUser(updatedData);
      toast.success('Профиль успешно обновлён!');
      navigate('/profile');
    } catch (err) {
      toast.error('Ошибка при обновлении профиля.');
    }
  };

  const handleCancel = () => {
    navigate('/profile');
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
          <h2 className="card-title mb-6">Редактирование профиля</h2>
          <Form>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">ФИО:</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Введите ФИО"
                isInvalid={!!formErrors.full_name}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
              <Form.Control.Feedback type="invalid" className="text-red-400">
                {formErrors.full_name}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Email:</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите email (только Gmail)"
                isInvalid={!!formErrors.email}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
              <Form.Control.Feedback type="invalid" className="text-red-400">
                {formErrors.email}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Телефон:</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Введите телефон (например, +7 (код) XXX-XX-XX)"
                isInvalid={!!formErrors.phone}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
              <Form.Control.Feedback type="invalid" className="text-red-400">
                {formErrors.phone}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Адрес:</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Введите адрес"
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
            </Form.Group>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="d-flex gap-3"
            >
              <Button
                variant="primary"
                onClick={handleSave}
                className="w-50 d-flex align-items-center justify-content-center"
              >
                <FaSave className="me-2" /> Сохранить
              </Button>
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="w-50 d-flex align-items-center justify-content-center bg-gray-600 hover:bg-gray-700"
              >
                Отмена
              </Button>
            </motion.div>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}

export default EditProfile;