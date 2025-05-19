import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests, cancelRequest, updateRequest } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaSearch, FaSort, FaDownload, FaEdit } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import ReactPaginate from 'react-paginate';
import { motion } from 'framer-motion';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [isEditingRequest, setIsEditingRequest] = useState(false);
  const [editRequestData, setEditRequestData] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const requestsPerPage = 5;
  const navigate = useNavigate();

  const statusLabels = {
    PENDING: 'Ожидание',
    APPROVED: 'Одобрено',
    REJECTED: 'Отклонено',
    COMPLETED: 'Завершено',
    CANCELLED: 'Отменено',
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getRequests();
        setRequests(Array.isArray(response) ? response : []);
      } catch (err) {
        setError('Ошибка при загрузке заявок');
        toast.error('Не удалось загрузить заявки.', { position: 'top-right' });
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
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

  const handleCancel = (id) => {
    setSelectedRequestId(id);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    setShowModal(false);
    if (!selectedRequestId) {
      toast.error('ID заявки не определён.', { position: 'top-right' });
      return;
    }
    try {
      await cancelRequest(selectedRequestId);
      setRequests(requests.filter((req) => req.id !== selectedRequestId));
      toast.success('Заявка успешно отменена!', { position: 'top-right' });
    } catch (err) {
      setError('Ошибка при отмене заявки');
      toast.error('Ошибка при отмене заявки: ' + (err.response?.data?.message || err.message), { position: 'top-right' });
    }
  };

  const handleEditRequest = (request) => {
    setEditRequestData({
      id: request.id,
      preferred_time_of_day: request.preferred_time_of_day,
      date: request.preferred_date ? new Date(request.preferred_date).toISOString() : '',
      description: request.description || '',
    });
    setIsEditingRequest(true);
  };

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (value.length > 0 && Array.isArray(requests)) {
      const filteredSuggestions = requests
        .flatMap((req) => [
          req.full_name,
          req.equipment_type,
          req.engineer_name || '',
        ])
        .filter((item) => item && item.toLowerCase().includes(value.toLowerCase()))
        .filter((item, index, self) => self.indexOf(item) === index)
        .slice(0, 5);
      setSuggestions(filteredSuggestions);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
  };

  const filteredRequests = Array.isArray(requests)
    ? requests.filter((req) => {
        const matchesSearch =
          req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (req.engineer_name || '')
            .toLowerCase()
            .includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        const requestDate = req.request_date ? new Date(req.request_date) : null;
        const startDate = dateRange.start ? new Date(dateRange.start) : null;
        const endDate = dateRange.end ? new Date(dateRange.end) : null;
        const matchesDate =
          (!startDate || (requestDate && requestDate >= startDate)) &&
          (!endDate || (requestDate && requestDate <= endDate));
        return matchesSearch && matchesStatus && matchesDate;
      })
    : [];

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const aValue =
      sortField === 'scheduled_time' || sortField === 'request_date'
        ? new Date(a[sortField] || 0)
        : a[sortField] || '';
    const bValue =
      sortField === 'scheduled_time' || sortField === 'request_date'
        ? new Date(b[sortField] || 0)
        : b[sortField] || '';
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const offset = currentPage * requestsPerPage;
  const paginatedRequests = sortedRequests.slice(offset, offset + requestsPerPage);
  const pageCount = Math.ceil(sortedRequests.length / requestsPerPage);

  const exportToCSV = () => {
    setExporting(true);
    const headers = [
      'ID,ФИО,Телефон,Адрес,Тип оборудования,Дата,Статус,Инженер,Время проведения\n',
    ];
    const rows = sortedRequests
      .map((req) =>
        [
          req.id || '',
          req.full_name || '',
          req.phone || '',
          req.address || '',
          req.equipment_type || '',
          req.request_date
            ? new Date(req.request_date).toLocaleString('ru-RU')
            : '',
          statusLabels[req.status] || req.status || '',
          req.engineer_name || '',
          req.scheduled_time
            ? new Date(req.scheduled_time).toLocaleString('ru-RU')
            : '',
        ]
          .map((field) => `"${field}"`)
          .join(',')
      )
      .join('\n');
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'requests.csv');
    setTimeout(() => setExporting(false), 1000);
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <ClipLoader color="#6366f1" size={50} />
        <p className="ml-2 text-gray-900">Загрузка...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <Card className="max-w-md mx-auto p-6 sm:p-8 bg-gray-50 rounded-lg shadow-md">
          <p className="text-red-500 text-gray-900">{error}</p>
        </Card>
      </div>
    );
  if (!requests.length)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <Card className="max-w-md mx-auto p-6 sm:p-8 bg-gray-50 rounded-lg shadow-md">
          <p className="text-gray-900">
            Заявок пока нет.{' '}
            <a
              href="/"
              className="text-gray-800 hover:text-gray-900"
              onClick={() => navigate('/')}
            >
              Создать новую заявку
            </a>
          </p>
        </Card>
      </div>
    );

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-200">
      <div className="w-full max-w-6xl mt-12">
        <Card className="bg-gray-50 rounded-lg shadow-md p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">
              Ваши заявки
            </h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1 max-w-xs">
                <Input
                  placeholder="Поиск по ФИО, оборудованию или инженеру..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                  icon={FaSearch}
                  className="text-gray-900"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-gray-50/90 backdrop-blur-lg rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-gray-900"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'Все статусы' },
                  { value: 'PENDING', label: 'Ожидание' },
                  { value: 'APPROVED', label: 'Одобрено' },
                  { value: 'REJECTED', label: 'Отклонено' },
                  { value: 'COMPLETED', label: 'Завершено' },
                  { value: 'CANCELLED', label: 'Отменено' },
                ]}
                className="text-gray-900"
              />
              <Input
                type="date"
                placeholder="Начальная дата"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="text-gray-900"
              />
              <Input
                type="date"
                placeholder="Конечная дата"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="text-gray-900"
              />
              <motion.div whileHover={{ scale: 1.05 }}>
                <Button
                  onClick={exportToCSV}
                  disabled={exporting}
                  className="bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500"
                >
                  {exporting ? (
                    <ClipLoader color="#ffffff" size={14} />
                  ) : (
                    <>
                      <FaDownload className="mr-2" /> Экспорт CSV
                    </>
                  )}
                </Button>
              </motion.div>
            </div>
            {filteredRequests.length ? (
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
                          ФИО <FaSort className="inline" />
                        </th>
                        <th
                          className="py-3 px-4 cursor-pointer text-sm font-medium text-gray-800 uppercase tracking-wider"
                          onClick={() => handleSort('equipment_type')}
                        >
                          Оборудование <FaSort className="inline" />
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
                          Время проведения <FaSort className="inline" />
                        </th>
                        <th className="py-3 px-4 text-sm font-medium text-gray-800 uppercase tracking-wider">
                          Действия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paginatedRequests.map((request) => (
                        <tr
                          key={request.id}
                          className="hover:bg-gray-50"
                        >
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {request.full_name || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {request.equipment_type || '-'}
                          </td>
                          <td className="py-3 px-4 text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                request.status === 'APPROVED'
                                  ? 'bg-green-100 text-green-800'
                                  : request.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'REJECTED'
                                  ? 'bg-red-100 text-red-800'
                                  : request.status === 'COMPLETED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : request.status === 'CANCELLED'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {statusLabels[request.status] || request.status || 'Не определён'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {request.engineer_name || 'Не назначен'}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {request.scheduled_time
                              ? new Date(request.scheduled_time).toLocaleString('ru-RU')
                              : 'Не задано'}
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleEditRequest(request)}
                                disabled={
                                  request.status === 'REJECTED' || request.status === 'COMPLETED' || request.status === 'CANCELLED'
                                }
                                className="bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500"
                              >
                                <FaEdit className="inline mr-1" /> Редактировать
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancel(request.id)}
                                disabled={
                                  request.status === 'REJECTED' || request.status === 'COMPLETED' || request.status === 'CANCELLED'
                                }
                                className="bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500"
                              >
                                Отменить
                              </Button>
                            </motion.div>
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
            ) : (
              <p className="text-center text-gray-900">
                Заявок не найдено.
              </p>
            )}
          </motion.div>
        </Card>
      </div>

      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Подтверждение"
        onConfirm={confirmCancel}
      >
        Вы уверены, что хотите отменить эту заявку?
      </Modal>

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

export default RequestList;