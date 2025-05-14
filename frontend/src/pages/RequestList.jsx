import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { getRequests, cancelRequest } from '../services/api';
import { FaFilter, FaSearch, FaDownload, FaTools, FaCalendarAlt, FaClock, FaEdit, FaTrash } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import ReactPaginate from 'react-paginate';
import styles from './RequestList.module.css';

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
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const requestsPerPage = 5;
  const navigate = useNavigate();

  const statusLabels = {
    PENDING: 'Ожидание',
    APPROVED: 'Одобрено',
    REJECTED: 'Отклонено',
    COMPLETED: 'Завершено',
  };

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await getRequests();
        console.log('API response:', response);
        setRequests(Array.isArray(response) ? response : []);
      } catch (err) {
        console.error('Error fetching requests:', err);
        setError('Ошибка при загрузке заявок');
        toast.error('Не удалось загрузить заявки.', { position: 'top-right' });
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleCancel = (id) => {
    setSelectedRequestId(id);
    setShowModal(true);
  };

  const confirmCancel = async () => {
    setShowModal(false);
    try {
      await cancelRequest(selectedRequestId);
      setRequests(requests.filter((req) => req.id !== selectedRequestId));
      toast.success('Заявка успешно отменена!', { position: 'top-right' });
    } catch (err) {
      setError('Ошибка при отмене заявки');
      toast.error('Ошибка при отмене заявки', { position: 'top-right' });
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

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const filteredRequests = Array.isArray(requests) ? requests.filter((req) => {
    const matchesSearch =
      (req.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.equipment_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (req.engineer_name || '')
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const requestDate = req.request_date ? new Date(req.request_date) : null;
    const startDate = dateRange.start ? new Date(dateRange.start) : null;
    const endDate = dateRange.end ? new Date(dateRange.end) : null;
    const matchesDate =
      (!startDate || (requestDate && requestDate >= startDate)) &&
      (!endDate || (requestDate && requestDate <= endDate));

    return matchesSearch && matchesStatus && matchesDate;
  }) : [];

  const offset = currentPage * requestsPerPage;
  const paginatedRequests = filteredRequests.slice(offset, offset + requestsPerPage);
  const pageCount = Math.ceil(filteredRequests.length / requestsPerPage);

  const exportToCSV = () => {
    setExporting(true);
    const headers = [
      'ID,ФИО,Телефон,Адрес,Тип оборудования,Дата,Статус,Инженер,Время проведения\n',
    ];
    const rows = filteredRequests
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ClipLoader color="#4a90e2" size={50} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className={`${styles.card} p-4 sm:p-6 text-center`}>
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="min-h-screen pt-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className={`${styles.card} p-4 sm:p-6 text-center`}>
          <h2 className={`${styles.cardTitle} text-2xl sm:text-3xl`}>Список заявок</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-4">
            Заявок пока нет.{' '}
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 dark:text-blue-400 underline"
            >
              Создать новую заявку
            </button>
            .
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.pageWrapper}`}>
      <div className="max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${styles.container}`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className={`${styles.cardTitle} text-2xl sm:text-3xl`}>Список заявок</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilterPanel(true)}
              className={`${styles.filterBtn}`}
            >
              <FaFilter /> Фильтры
            </motion.button>
          </div>

          <div className={`${styles.searchWrapper} mb-6`}>
            <FaSearch className={`${styles.inputIcon}`} />
            <input
              type="text"
              placeholder="Поиск по ФИО, оборудованию или инженеру..."
              value={searchTerm}
              onChange={handleSearchChange}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
              className={`${styles.formInput}`}
            />
            {showSuggestions && suggestions.length > 0 && (
              <ul className={`${styles.suggestions}`}>
                {suggestions.map((suggestion, index) => (
                  <li
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`${styles.suggestionItem}`}
                  >
                    {suggestion}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {filteredRequests.length ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="space-y-4">
                {paginatedRequests.map((request) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`${styles.card}`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <FaTools className={`${styles.icon}`} />
                          <span className={`${styles.cardText}`}>
                            {request.equipment_type || '-'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaCalendarAlt className={`${styles.icon}`} />
                          <span className={`${styles.cardText}`}>
                            {request.request_date
                              ? new Date(request.request_date).toLocaleDateString('ru-RU')
                              : 'Не задано'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className={`${styles.icon}`} />
                          <span className={`${styles.cardText}`}>
                            {request.scheduled_time
                              ? new Date(request.scheduled_time).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                              : 'Не задано'}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1 text-right">
                        <div className="flex justify-end">
                          <span className={`${styles.statusBadge} ${
                            request.status === 'APPROVED' ? styles.statusApproved :
                            request.status === 'PENDING' ? styles.statusPending :
                            request.status === 'REJECTED' ? styles.statusRejected :
                            styles.statusCompleted
                          }`}>
                            {statusLabels[request.status] || request.status || 'Не определён'}
                          </span>
                        </div>
                        <div className={`${styles.cardText}`}>
                          Инженер: {request.engineer_name || 'Не назначен'}
                        </div>
                        <div className="flex justify-end space-x-2 mt-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/edit-request/${request.id}`)}
                            disabled={request.status === 'REJECTED' || request.status === 'COMPLETED'}
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            title="Редактировать"
                          >
                            <FaEdit />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCancel(request.id)}
                            disabled={request.status === 'REJECTED' || request.status === 'COMPLETED'}
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            title="Отменить"
                          >
                            <FaTrash />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <ReactPaginate
                previousLabel={'←'}
                nextLabel={'→'}
                breakLabel={'...'}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={`${styles.pagination}`}
                activeClassName={`${styles.active}`}
                pageClassName={`${styles.pageItem}`}
                pageLinkClassName={`${styles.pageLink}`}
                previousClassName={`${styles.pageItem}`}
                previousLinkClassName={`${styles.pageLink}`}
                nextClassName={`${styles.pageItem}`}
                nextLinkClassName={`${styles.pageLink}`}
                breakClassName={`${styles.pageItem}`}
                breakLinkClassName={`${styles.pageLink}`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                disabled={exporting}
                className={`${styles.btnPrimary} mt-6 block mx-auto`}
              >
                {exporting ? (
                  <ClipLoader color="#fff" size={14} />
                ) : (
                  <span className="flex items-center">
                    <FaDownload className="mr-2" /> Экспорт CSV
                  </span>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-300">Заявок не найдено.</p>
          )}
        </motion.div>

        {/* Выплывающее окно фильтров */}
        {showFilterPanel && (
          <div className={`${styles.filterOverlay}`}>
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ duration: 0.3 }}
              className={`${styles.filterPanel}`}
            >
              <div className={`${styles.filterHeader}`}>
                <h5>Фильтры</h5>
                <button onClick={() => setShowFilterPanel(false)} className={`${styles.closeBtn}`}>
                  ×
                </button>
              </div>
              <div className={`${styles.filterBody}`}>
                <div className="mb-4">
                  <label className={`${styles.formLabel}`}>Статус</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`${styles.formInput}`}
                  >
                    <option value="all">Все статусы</option>
                    <option value="PENDING">Ожидание</option>
                    <option value="APPROVED">Одобрено</option>
                    <option value="REJECTED">Отклонено</option>
                    <option value="COMPLETED">Завершено</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className={`${styles.formLabel}`}>Начальная дата</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className={`${styles.formInput}`}
                  />
                </div>
                <div className="mb-4">
                  <label className={`${styles.formLabel}`}>Конечная дата</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className={`${styles.formInput}`}
                  />
                </div>
              </div>
              <div className={`${styles.filterFooter}`}>
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setDateRange({ start: '', end: '' });
                  }}
                  className={`${styles.btnSecondary}`}
                >
                  Сбросить
                </button>
                <button
                  onClick={() => setShowFilterPanel(false)}
                  className={`${styles.btnPrimary}`}
                >
                  Применить
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Модал для подтверждения отмены */}
        {showModal && (
          <div className={`${styles.modalOverlay}`}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`${styles.modal}`}
            >
              <div className={`${styles.modalHeader}`}>
                <h5>Подтверждение</h5>
                <button onClick={() => setShowModal(false)} className={`${styles.modalClose}`}>
                  ×
                </button>
              </div>
              <div className={`${styles.modalBody}`}>
                Вы уверены, что хотите отменить эту заявку?
              </div>
              <div className={`${styles.modalFooter}`}>
                <button
                  onClick={() => setShowModal(false)}
                  className={`${styles.btnSecondary}`}
                >
                  Отмена
                </button>
                <button
                  onClick={confirmCancel}
                  className={`${styles.btnDanger}`}
                >
                  Подтвердить
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestList;