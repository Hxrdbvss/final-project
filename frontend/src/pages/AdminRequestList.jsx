import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests, updateRequest } from '../services/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaEdit, FaSort } from 'react-icons/fa';
import ReactPaginate from 'react-paginate';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const requestsPerPage = 5;
  const navigate = useNavigate();

  const statusLabels = {
    PENDING: 'Ожидание',
    APPROVED: 'Подтверждено',
    COMPLETED: 'Завершено',
    CANCELLED: 'Отменено',
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getRequests();
        setRequests(response);
        const datesResponse = await fetchAvailableDates();
        setAvailableDates(datesResponse.map(date => new Date(date)));
      } catch (err) {
        setError('Ошибка загрузки заявок.');
        toast.error('Ошибка загрузки данных.', { position: 'top-right' });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const fetchAvailableDates = async () => {
    return [
      '2025-05-23T00:00:00Z',
      '2025-05-24T00:00:00Z',
      '2025-05-25T00:00:00Z',
    ];
  };

  const handleEditRequest = (request) => {
    setEditRequestData({
      ...request,
      scheduled_time: request.scheduled_time ? new Date(request.scheduled_time) : null,
    });
    setIsEditingRequest(true);
  };

  const handleUpdateRequest = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedData = {
        ...editRequestData,
        scheduled_time: editRequestData.scheduled_time ? editRequestData.scheduled_time.toISOString() : null,
      };
      await updateRequest(editRequestData.id, updatedData);
      const updatedRequests = await getRequests();
      setRequests(updatedRequests);
      setIsEditingRequest(false);
      toast.success('Заявка успешно обновлена!', { position: 'top-right' });
    } catch (err) {
      toast.error('Ошибка при обновлении заявки: ' + (err.response?.data?.detail || err.message), { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      setLoading(true);
      await updateRequest(requestId, { status: newStatus });
      const updatedRequests = await getRequests();
      setRequests(updatedRequests);
      toast.success('Статус успешно обновлён!', { position: 'top-right' });
    } catch (err) {
      toast.error('Ошибка при обновлении статуса: ' + (err.response?.data?.detail || err.message), { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredRequests = requests.filter((req) => {
    const matchesSearch = req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (req.engineer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue = a[sortField] || '';
    const bValue = b[sortField] || '';
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const offset = currentPage * requestsPerPage;
  const paginatedRequests = sortedRequests.slice(offset, offset + requestsPerPage);
  const pageCount = Math.ceil(sortedRequests.length / requestsPerPage);

  if (loading) return (
    <div className="flex justify-center items-center h-screen bg-gray-200">
      <ClipLoader color="#6366f1" size={50} />
      <p className="ml-2 text-gray-900">Загрузка...</p>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-200">
      <div className="max-w-md mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
        <p className="text-red-500 text-gray-900">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-200">
      <div className="w-full max-w-6xl mt-12">
        <div className="bg-gray-50 rounded-lg shadow-md p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Список всех заявок</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <input
                type="text"
                placeholder="Поиск по ФИО или инженеру..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-1/3"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-1/4"
              >
                <option value="all">Все статусы</option>
                <option value="PENDING">Ожидание</option>
                <option value="APPROVED">Подтверждено</option>
                <option value="COMPLETED">Завершено</option>
                <option value="CANCELLED">Отменено</option>
              </select>
            </div>
            {filteredRequests.length === 0 && !loading && (
              <p className="text-center text-gray-900">Заявок не найдено.</p>
            )}
            {filteredRequests.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th
                          className="py-3 px-4 cursor-pointer text-sm font-medium text-gray-800 uppercase tracking-wider"
                          onClick={() => handleSort('full_name')}
                        >
                          Пользователь <FaSort className="inline" />
                        </th>
                        <th
                          className="py-3 px-4 cursor-pointer text-sm font-medium text-gray-800 uppercase tracking-wider"
                          onClick={() => handleSort('status')}
                        >
                          Статус <FaSort className="inline" />
                        </th>
                        <th
                          className="py-3 px-4 cursor-pointer text-sm font-medium text-gray-800 uppercase tracking-wider"
                          onClick={() => handleSort('engineer_name')}
                        >
                          Инженер <FaSort className="inline" />
                        </th>
                        <th
                          className="py-3 px-4 cursor-pointer text-sm font-medium text-gray-800 uppercase tracking-wider"
                          onClick={() => handleSort('scheduled_time')}
                        >
                          Дата <FaSort className="inline" />
                        </th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-800 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedRequests.map(request => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">{request.full_name || 'N/A'}</td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : request.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : request.status === 'CANCELLED'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabels[request.status] || request.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{request.engineer_name || 'Не назначен'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {request.scheduled_time ? new Date(request.scheduled_time).toLocaleString('ru-RU') : 'Не назначена'}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleEditRequest(request)}
                              className="bg-blue-500 text-white text-sm px-2 py-1 rounded-md hover:bg-blue-600 flex items-center"
                              disabled={request.status === 'COMPLETED' || request.status === 'CANCELLED'}
                            >
                              <FaEdit className="mr-1" /> Редактировать
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <ReactPaginate
                  previousLabel={'←'}
                  nextLabel={'→'}
                  breakLabel={'...'}
                  pageCount={pageCount}
                  marginPagesDisplayed={2}
                  pageRangeDisplayed={3}
                  onPageChange={({ selected }) => setCurrentPage(selected)}
                  containerClassName="flex justify-center mt-6 gap-2"
                  activeClassName="bg-gray-800 text-white"
                  pageClassName="inline-block"
                  pageLinkClassName="px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100"
                  previousClassName="inline-block"
                  previousLinkClassName="px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100"
                  nextClassName="inline-block"
                  nextLinkClassName="px-3 py-1 rounded-md bg-gray-50 border border-gray-200 text-gray-900 hover:bg-gray-100"
                  breakClassName="inline-block"
                  breakLinkClassName="px-3 py-1 text-gray-900"
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {isEditingRequest && editRequestData && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50"
        >
          <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-5 text-gray-900 dark:text-gray-100">Редактировать заявку</h3>
            <form onSubmit={handleUpdateRequest} className="space-y-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Время дня</label>
                <select
                  name="preferred_time_of_day"
                  value={editRequestData.preferred_time_of_day || 'morning'}
                  onChange={(e) => setEditRequestData({ ...editRequestData, preferred_time_of_day: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="morning">Утро (9:00–12:00)</option>
                  <option value="afternoon">День (12:00–15:00)</option>
                  <option value="evening">Вечер (15:00–18:00)</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Дата</label>
                <DatePicker
                  onChange={(date) => setEditRequestData({ ...editRequestData, scheduled_time: date })}
                  value={editRequestData.scheduled_time}
                  minDate={new Date()}
                  tileDisabled={({ date }) => !availableDates.some(d => d.toDateString() === date.toDateString())}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Описание</label>
                <textarea
                  name="description"
                  value={editRequestData.description || ''}
                  onChange={(e) => setEditRequestData({ ...editRequestData, description: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-800 dark:text-gray-200">Статус</label>
                <select
                  name="status"
                  value={editRequestData.status}
                  onChange={(e) => setEditRequestData({ ...editRequestData, status: e.target.value })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
                >
                  <option value="PENDING">Ожидание</option>
                  <option value="APPROVED">Подтверждено</option>
                  <option value="COMPLETED">Завершено</option>
                  <option value="CANCELLED">Отменено</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsEditingRequest(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
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