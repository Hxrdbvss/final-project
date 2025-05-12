import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRequests, cancelRequest } from '../services/api';
import { Button, Modal, Form, ListGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaSearch, FaSort, FaDownload } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import ReactPaginate from 'react-paginate';
import { motion } from 'framer-motion';

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

    console.log('Request:', req, 'Matches:', { matchesSearch, matchesStatus, matchesDate });
    return matchesSearch && matchesStatus && matchesDate;
  }) : [];

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
  const paginatedRequests = sortedRequests.slice(
    offset,
    offset + requestsPerPage
  );
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
      <div className="text-center mt-5">
        <ClipLoader color="#007bff" size={50} />
        <p className="mt-2">Загрузка...</p>
      </div>
    );
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;
  if (!requests.length)
    return (
      <div className="text-center mt-5">
        <p>Заявок пока нет. <a href="/" onClick={() => navigate('/')}>Создать новую заявку</a>.</p>
      </div>
    );

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <motion.div
          className="card shadow-sm custom-card-width"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="card-body">
            <h2 className="card-title mb-4">Ваши заявки</h2>
            <div className="d-flex flex-column flex-md-row gap-3 mb-4 position-relative">
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <Form.Control
                  type="text"
                  placeholder="Поиск по ФИО, оборудованию или инженеру..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                  className="w-100 w-md-auto"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ListGroup
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      maxHeight: '200px',
                      overflowY: 'auto',
                    }}
                  >
                    {suggestions.map((suggestion, index) => (
                      <ListGroup.Item
                        key={index}
                        action
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-100 w-md-auto"
              >
                <option value="all">Все статусы</option>
                <option value="PENDING">Ожидание</option>
                <option value="APPROVED">Одобрено</option>
                <option value="REJECTED">Отклонено</option>
                <option value="COMPLETED">Завершено</option>
              </Form.Select>
              <Form.Control
                type="date"
                placeholder="Начальная дата"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
                className="w-100 w-md-auto"
              />
              <Form.Control
                type="date"
                placeholder="Конечная дата"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
                className="w-100 w-md-auto"
              />
              <motion.div whileHover={{ scale: 1.1 }}>
                <Button
                  variant="primary"
                  className="w-100 w-md-auto"
                  onClick={exportToCSV}
                  disabled={exporting}
                >
                  {exporting ? (
                    <ClipLoader color="#ffffff" size={14} />
                  ) : (
                    <>
                      <FaDownload /> Экспорт CSV
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
                <div className="table-responsive">
                  <table className="table table-striped table-hover">
                    <thead className="thead-dark">
                      <tr>
                        <th onClick={() => handleSort('full_name')}>
                          ФИО <FaSort />
                        </th>
                        <th onClick={() => handleSort('equipment_type')}>
                          Оборудование <FaSort />
                        </th>
                        <th onClick={() => handleSort('status')}>
                          Статус <FaSort />
                        </th>
                        <th onClick={() => handleSort('engineer_name')}>
                          Инженер <FaSort />
                        </th>
                        <th onClick={() => handleSort('scheduled_time')}>
                          Время проведения <FaSort />
                        </th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRequests.map((request) => (
                        <tr key={request.id}>
                          <td>{request.full_name || '-'}</td>
                          <td>{request.equipment_type || '-'}</td>
                          <td>
                            <span
                              className={`badge ${
                                request.status === 'APPROVED'
                                  ? 'bg-success'
                                  : request.status === 'PENDING'
                                  ? 'bg-warning'
                                  : request.status === 'REJECTED'
                                  ? 'bg-danger'
                                  : 'bg-secondary'
                              }`}
                            >
                              {statusLabels[request.status] || request.status || 'Не определён'}
                            </span>
                          </td>
                          <td>{request.engineer_name || 'Не назначен'}</td>
                          <td>
                            {request.scheduled_time
                              ? new Date(request.scheduled_time).toLocaleString('ru-RU')
                              : 'Не задано'}
                          </td>
                          <td>
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => navigate(`/edit-request/${request.id}`)}
                                className="me-2"
                                disabled={request.status === 'REJECTED' || request.status === 'COMPLETED'}
                              >
                                Редактировать
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancel(request.id)}
                                className="me-2"
                                disabled={request.status === 'REJECTED' || request.status === 'COMPLETED'}
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
                  onPageChange={handlePageClick}
                  containerClassName={'pagination justify-content-center mt-4'}
                  activeClassName={'active'}
                  pageClassName={'page-item'}
                  pageLinkClassName={'page-link'}
                  previousClassName={'page-item'}
                  previousLinkClassName={'page-link'}
                  nextClassName={'page-item'}
                  nextLinkClassName={'page-link'}
                  breakClassName={'page-item'}
                  breakLinkClassName={'page-link'}
                />
              </motion.div>
            ) : (
              <p className="text-center">Заявок не найдено.</p>
            )}
          </div>
        </motion.div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение</Modal.Title>
        </Modal.Header>
        <Modal.Body>Вы уверены, что хотите отменить эту заявку?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setjavaxShowModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmCancel}>
            Подтвердить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default RequestList;