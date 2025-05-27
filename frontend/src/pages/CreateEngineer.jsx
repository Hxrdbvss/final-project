import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEngineer } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';

function CreateEngineer() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    location_id: '',
    work_start_time: '',
    work_end_time: '',
    is_available: true,
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createEngineer(formData);
      toast.success('Инженер успешно создан!', { position: 'top-right' });
      navigate('/request-list');
    } catch (err) {
      toast.error('Ошибка при создании инженера.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex justify-center bg-gray-200">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Создать инженера</h2>
        <form onSubmit={handleSubmit} className="flex-grow space-y-3 overflow-hidden">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Фамилия</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID локации</label>
            <input
              type="text"
              name="location_id"
              value={formData.location_id}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Начало работы</label>
            <input
              type="time"
              name="work_start_time"
              value={formData.work_start_time}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Конец работы</label>
            <input
              type="time"
              name="work_end_time"
              value={formData.work_end_time}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_available"
              checked={formData.is_available}
              onChange={(e) => setFormData((prev) => ({ ...prev, is_available: e.target.checked }))}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm font-medium text-gray-700">Доступен</label>
          </div>
          <div className="mt-auto flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => navigate('/request-list')}
              className="p-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 focus:ring-2 focus:ring-indigo-500"
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