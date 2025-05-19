import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEngineer } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

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
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Создать инженера</h1>
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">ФИО</label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Телефон</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Адрес</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 text-gray-700 dark:text-gray-300">Локация (ID)</label>
            <input
              type="number"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="btn-secondary text-sm px-4 py-2 rounded-md"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="btn-primary text-sm px-4 py-2 rounded-md"
              disabled={loading}
            >
              {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Создать'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEngineer;