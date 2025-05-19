import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests, updateRequest } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaEdit } from 'react-icons/fa';
import { motion } from 'framer-motion';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

function AdminRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editRequestData, setEditRequestData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRequests();
        setRequests(response);
      } catch (err) {
        setError('Ошибка загрузки заявок.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchAvailableDates = async () => {
      try {
        const response = await api.get('available-dates/', {
          params: { time_of_day: editRequestData?.preferred_time_of_day || 'morning' }
        });
        setAvailableDates(response.data.available_dates.map(date => new Date(date)));
      } catch (err) {
        toast.error('Ошибка загрузки доступных дат.', { position: 'top-right' });
      }
    };
    if (isEditingRequest) fetchAvailableDates();
  }, [editRequestData?.preferred_time_of_day, isEditingRequest]);

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateRequest(editRequestData.id, { ...editRequestData, preferred_date: editRequestData.date.split('T')[0] });
      setIsEditingRequest(false);
      const requestsResponse = await getRequests();
      setRequests(requestsResponse);
      toast.success('Заявка успешно обновлена!', { position: 'top-right' });
    } catch (err) {
      toast.error(err.response?.data || 'Ошибка при обновлении заявки.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRequest = (request) => {
    setEditRequestData({
      id: request.id,
      preferred_time_of_day: request.preferred_time_of_day,
      date: request.preferred_date ? new Date(request.preferred_date).toISOString() : '',
      description: request.description || '',
      status: request.status,
    });
    setIsEditingRequest(true);
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <ClipLoader color="#50e3c2" size={50} />
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-indigo-600 dark:text-indigo-400">Список всех заявок</h1>
        {requests.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">Нет заявок.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-4 pr-4">
            {requests.map(request => (
              <div key={request.id} className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg shadow hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200">
                <p><strong>Заявка #{request.id}</strong></p>
                <p>Пользователь: {request.full_name}</p>
                <p>Статус: {request.status}</p>
                <p>Инженер: {request.engineer_name || 'Не назначен'}</p>
                <p>Дата: {request.scheduled_time ? new Date(request.scheduled_time).toLocaleString() : 'Не назначена'}</p>
                <select
                  value={request.status}
                  onChange={(e) => {
                    const newStatus = e.target.value;
                    updateRequest(request.id, { ...request, status: newStatus }).then(() => {
                      const requestsResponse = getRequests();
                      setRequests(requestsResponse);
                      toast.success('Статус обновлён!', { position: 'top-right' });
                    });
                  }}
                  className="mt-2 p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="PENDING">В ожидании</option>
                  <option value="APPROVED">Подтверждено</option>
                  <option value="COMPLETED">Завершено</option>
                  <option value="CANCELLED">Отменено</option>
                </select>
                <button
                  onClick={() => handleEditRequest(request)}
                  className="mt-2 ml-2 btn-primary text-sm px-3 py-1 rounded-md bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-colors duration-200"
                >
                  <FaEdit className="inline mr-1" /> Редактировать
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {isEditingRequest && editRequestData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        >
          <div className="bg-white dark:bg-gray-800 p-5 rounded-lg shadow-lg w-full max-w-sm">
            <h3 className="text-lg mb-4 text-gray-900 dark:text-gray-100">Редактировать заявку</h3>
            <form onSubmit={handleUpdateRequest}>
              <div className="mb-3">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Выберите время дня</label>
                <select
                  name="preferred_time_of_day"
                  value={editRequestData.preferred_time_of_day || 'morning'}
                  onChange={(e) => setEditRequestData({ ...editRequestData, preferred_time_of_day: e.target.value })}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="morning">Утро (9:00–12:00)</option>
                  <option value="afternoon">День (12:00–15:00)</option>
                  <option value="evening">Вечер (15:00–18:00)</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Дата</label>
                <DatePicker
                  onChange={(date) => setEditRequestData({ ...editRequestData, date: date.toISOString() })}
                  value={editRequestData.date ? new Date(editRequestData.date) : null}
                  disabledDays={(date) => !availableDates.some(d => d.toDateString() === date.toDateString())}
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Описание</label>
                <textarea
                  name="description"
                  value={editRequestData.description}
                  onChange={(e) => setEditRequestData({ ...editRequestData, description: e.target.value })}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-gray-700 dark:text-gray-300">Статус</label>
                <select
                  name="status"
                  value={editRequestData.status}
                  onChange={(e) => setEditRequestData({ ...editRequestData, status: e.target.value })}
                  className="w-full p-2 border rounded bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="PENDING">В ожидании</option>
                  <option value="APPROVED">Подтверждено</option>
                  <option value="COMPLETED">Завершено</option>
                  <option value="CANCELLED">Отменено</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditingRequest(false)}
                  className="btn-secondary text-sm px-4 py-2 rounded-md"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm px-4 py-2 rounded-md"
                  disabled={loading}
                >
                  {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default AdminRequestList;