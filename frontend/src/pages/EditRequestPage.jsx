import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRequest, updateRequest, getAvailableDates, getAvailableEngineers } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

function EditRequestPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editRequestData, setEditRequestData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableEngineers, setAvailableEngineers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching request data for ID:', id); // Отладка
        const requestResponse = await getRequest(id);
        console.log('Request data:', requestResponse); // Отладка
        const initialData = {
          id: requestResponse.id,
          full_name: requestResponse.full_name || '',
          phone: requestResponse.phone || '',
          address: requestResponse.address || '',
          equipment_type: requestResponse.equipment_type || '',
          preferred_date: requestResponse.preferred_date ? new Date(requestResponse.preferred_date) : null,
          preferred_time_of_day: requestResponse.preferred_time_of_day || 'morning',
          status: requestResponse.status,
          engineer_id: requestResponse.engineer?.id || '',
        };
        setEditRequestData(initialData);

        console.log('Fetching available dates'); // Отладка
        const datesResponse = await getAvailableDates();
        console.log('Available dates:', datesResponse); // Отладка
        setAvailableDates(datesResponse.available_dates.map(date => new Date(date)));

        if (initialData.preferred_date && initialData.preferred_time_of_day) {
          console.log('Fetching available engineers for date:', initialData.preferred_date, 'time:', initialData.preferred_time_of_day); // Отладка
          const engineersResponse = await getAvailableEngineers(
            initialData.preferred_date.toISOString().split('T')[0],
            initialData.preferred_time_of_day
          );
          console.log('Available engineers:', engineersResponse); // Отладка
          setAvailableEngineers(engineersResponse);
        }
      } catch (err) {
        console.error('Error fetching data:', err); // Отладка
        toast.error('Ошибка загрузки данных заявки.', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (field, value) => {
    setEditRequestData((prev) => {
      const newData = { ...prev, [field]: value };
      if (field === 'preferred_date' || field === 'preferred_time_of_day') {
        fetchAvailableEngineers(newData);
      }
      return newData;
    });
  };

  const fetchAvailableEngineers = async (data) => {
    if (data.preferred_date && data.preferred_time_of_day) {
      try {
        console.log('Fetching engineers for date:', data.preferred_date.toISOString().split('T')[0], 'time:', data.preferred_time_of_day); // Отладка
        const engineersResponse = await getAvailableEngineers(
          data.preferred_date.toISOString().split('T')[0],
          data.preferred_time_of_day
        );
        console.log('Engineers response:', engineersResponse); // Отладка
        setAvailableEngineers(engineersResponse);
      } catch (err) {
        console.error('Error fetching engineers:', err); // Отладка
        toast.error('Ошибка загрузки доступных инженеров.', { position: 'top-right' });
      }
    } else {
      setAvailableEngineers([]);
    }
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    if (!editRequestData) return;

    try {
      setLoading(true);
      const dataToSend = {
        full_name: editRequestData.full_name,
        phone: editRequestData.phone,
        address: editRequestData.address,
        equipment_type: editRequestData.equipment_type,
        preferred_date: editRequestData.preferred_date?.toISOString().split('T')[0],
        preferred_time_of_day: editRequestData.preferred_time_of_day,
        status: editRequestData.status,
        engineer_id: editRequestData.engineer_id || null,
      };
      console.log('Sending update request:', dataToSend); // Отладка
      await updateRequest(editRequestData.id, dataToSend);
      toast.success('Заявка успешно обновлена!', { position: 'top-right' });
      navigate('/request-list');
    } catch (err) {
      console.error('Error updating request:', err); // Отладка
      toast.error(err.response?.data?.detail || 'Ошибка при обновлении заявки.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <ClipLoader color="#6366f1" size={50} />
        <p className="ml-2 text-gray-900">Загрузка...</p>
      </div>
    );
  }

  if (!editRequestData) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <p className="text-red-500">Ошибка загрузки данных заявки.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-200">
      <div className="w-full max-w-2xl mt-12">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Редактировать заявку</h2>
          <form onSubmit={handleUpdateRequest} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ФИО</label>
              <input
                type="text"
                value={editRequestData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Телефон</label>
              <input
                type="tel"
                value={editRequestData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Адрес</label>
              <input
                type="text"
                value={editRequestData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Тип оборудования</label>
              <input
                type="text"
                value={editRequestData.equipment_type}
                onChange={(e) => handleInputChange('equipment_type', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Предпочтительная дата</label>
              <DatePicker
                onChange={(date) => handleInputChange('preferred_date', date)}
                value={editRequestData.preferred_date}
                disabledDays={(date) =>
                  !availableDates.some((d) => d.toDateString() === date.toDateString())
                }
                minDate={new Date()}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Время дня</label>
              <select
                value={editRequestData.preferred_time_of_day}
                onChange={(e) => handleInputChange('preferred_time_of_day', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              >
                <option value="morning">Утро (9:00–12:00)</option>
                <option value="afternoon">День (12:00–15:00)</option>
                <option value="evening">Вечер (15:00–18:00)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
              <select
                value={editRequestData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              >
                <option value="PENDING">Ожидание</option>
                <option value="APPROVED">Одобрено</option>
                <option value="REJECTED">Отклонено</option>
                <option value="COMPLETED">Завершено</option>
                <option value="CANCELLED">Отменено</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Инженер</label>
              <select
                value={editRequestData.engineer_id}
                onChange={(e) => handleInputChange('engineer_id', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
                disabled={!editRequestData.preferred_date || !editRequestData.preferred_time_of_day}
              >
                <option value="">Не назначен</option>
                {availableEngineers.map((engineer) => (
                  <option key={engineer.id} value={engineer.id}>
                    {engineer.name || engineer.email} {/* Используй подходящее поле */}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/request-list')}
                className="p-3 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="p-3 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Сохранить'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditRequestPage;