import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRequests, updateRequest } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

function EditRequestPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editRequestData, setEditRequestData] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const requestsPerPage = 1; // Показываем только одну заявку за раз

  useEffect(() => {
    const fetchData = async () => {
      try {
        const allRequests = await getAllRequests();
        setRequests(allRequests);

        // Извлекаем инженеров
        const uniqueEngineers = [...new Set(allRequests
          .filter(req => req.engineer)
          .map(req => ({
            id: req.engineer.id,
            name: req.engineer.name || req.engineer.email,
          })))];
        setEngineers(uniqueEngineers);

        // Устанавливаем первую заявку для редактирования
        if (allRequests.length > 0) {
          const firstRequest = allRequests[0];
          setEditRequestData({
            id: firstRequest.id,
            full_name: firstRequest.full_name || '',
            phone: firstRequest.phone || '',
            address: firstRequest.address || '',
            equipment_type: firstRequest.equipment_type || '',
            preferred_date: firstRequest.preferred_date ? new Date(firstRequest.preferred_date) : null,
            preferred_time_of_day: firstRequest.preferred_time_of_day || 'morning',
            status: firstRequest.status,
            engineer_id: firstRequest.engineer?.id || '',
          });
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast.error('Ошибка загрузки данных.', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Вычисляем текущую заявку на основе страницы
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequest = requests.slice(indexOfFirstRequest, indexOfLastRequest)[0];

  // Обновляем editRequestData при смене страницы
  useEffect(() => {
    if (currentRequest) {
      setEditRequestData({
        id: currentRequest.id,
        full_name: currentRequest.full_name || '',
        phone: currentRequest.phone || '',
        address: currentRequest.address || '',
        equipment_type: currentRequest.equipment_type || '',
        preferred_date: currentRequest.preferred_date ? new Date(currentRequest.preferred_date) : null,
        preferred_time_of_day: currentRequest.preferred_time_of_day || 'morning',
        status: currentRequest.status,
        engineer_id: currentRequest.engineer?.id || '',
      });
    }
  }, [currentRequest]);

  const totalPages = Math.ceil(requests.length / requestsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleInputChange = (field, value) => {
    setEditRequestData((prev) => ({ ...prev, [field]: value }));
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
      await updateRequest(editRequestData.id, dataToSend);
      toast.success('Заявка успешно обновлена!', { position: 'top-right' });
      const updatedRequests = requests.map((req) =>
        req.id === editRequestData.id ? { ...req, ...dataToSend } : req
      );
      setRequests(updatedRequests);
    } catch (err) {
      console.error('Error updating request:', err);
      toast.error(err.response?.data?.detail || 'Ошибка при обновлении заявки.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-200">
        <ClipLoader color="#6366f1" size={50} />
        <p className="ml-2 text-gray-900">Загрузка...</p>
      </div>
    );
  }

  if (!editRequestData) {
    return (
      <div className="flex justify-center items-center h-full bg-gray-200">
        <p className="text-red-500">Заявок нет.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex justify-center bg-gray-200">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-4 flex flex-col overflow-hidden">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Редактировать заявку</h2>
        <form onSubmit={handleUpdateRequest} className="flex-grow space-y-3 overflow-hidden">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ФИО</label>
            <input
              type="text"
              value={editRequestData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
            <input
              type="tel"
              value={editRequestData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Адрес</label>
            <input
              type="text"
              value={editRequestData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Тип оборудования</label>
            <input
              type="text"
              value={editRequestData.equipment_type}
              onChange={(e) => handleInputChange('equipment_type', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Предпочтительная дата</label>
            <DatePicker
              onChange={(date) => handleInputChange('preferred_date', date)}
              value={editRequestData.preferred_date}
              minDate={new Date(new Date().setDate(new Date().getDate() + 1))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Время дня</label>
            <select
              value={editRequestData.preferred_time_of_day}
              onChange={(e) => handleInputChange('preferred_time_of_day', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            >
              <option value="morning">Утро (9:00–12:00)</option>
              <option value="afternoon">День (12:00–15:00)</option>
              <option value="evening">Вечер (15:00–18:00)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={editRequestData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            >
              <option value="PENDING">Ожидание</option>
              <option value="APPROVED">Одобрено</option>
              <option value="REJECTED">Отклонено</option>
              <option value="COMPLETED">Завершено</option>
              <option value="CANCELLED">Отменено</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Инженер</label>
            <select
              value={editRequestData.engineer_id}
              onChange={(e) => handleInputChange('engineer_id', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-800"
            >
              <option value="">Не назначен</option>
              {engineers.map((engineer) => (
                <option key={engineer.id} value={engineer.id}>
                  {engineer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-between items-end mt-4">
            <div className="flex space-x-2">
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => navigate('/request-list')}
                className="p-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-2 focus:ring-gray-500"
              >
                Назад
              </button>
              <button
                type="submit"
                className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 focus:ring-2 focus:ring-indigo-500"
                disabled={loading}
              >
                {loading ? <ClipLoader color="#ffffff" size={20} /> : 'Сохранить'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditRequestPage;