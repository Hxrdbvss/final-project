import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEngineer } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import Button from '../components/Button';
import Input from '../components/Input';

function CreateEngineer() {
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    location: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createEngineer(formData);
      toast.success('Инженер успешно создан!', { position: 'top-right' });
      navigate('/profile');
    } catch (err) {
      toast.error(err.response?.data || 'Ошибка при создании инженера.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-r from-indigo-100 to-blue-100 flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full"
      >
        <h1 className="text-3xl font-semibold text-gray-800 mb-6 text-center bg-gradient-to-r from-indigo-500 to-blue-500 text-transparent bg-clip-text">
          Создать инженера
        </h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
            <Input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
            <Input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Локация (ID)</label>
            <Input
              type="number"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                onClick={() => navigate('/profile')}
                className="p-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500"
              >
                Отмена
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }}>
              <Button
                type="submit"
                className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Создать'}
              </Button>
            </motion.div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateEngineer;