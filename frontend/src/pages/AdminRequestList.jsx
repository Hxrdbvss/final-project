import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllRequests } from '../services/api';
import { toast } from 'react-toastify';
import { ClipLoader } from 'react-spinners';
import { FaSort, FaDownload, FaEdit } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import ReactPaginate from 'react-paginate';
import { motion } from 'framer-motion';

function AdminRequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [reportMonth, setReportMonth] = useState('');
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
        const response = await getAllRequests();
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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
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

  const filteredRequests = sortedRequests.filter((req) => {
    const isValidEngineer = req.status !== 'APPROVED' || (req.status === 'APPROVED' && req.engineer_name);
    return isValidEngineer;
  });

  const offset = currentPage * requestsPerPage;
  const paginatedRequests = filteredRequests.slice(offset, offset + requestsPerPage);
  const pageCount = Math.ceil(filteredRequests.length / requestsPerPage);

  const exportToCSV = () => {
    setExporting(true);
    const headers = [
      'ID,ФИО,Телефон,Адрес,Тип оборудования,Дата,Статус,Инженер,Время проведения\n',
    ];
    const rows = filteredRequests
      .map((req) => [
        req.id || '',
        req.full_name || '',
        req.phone || '',
        req.address || '',
        req.equipment_type || '',
        req.request_date ? new Date(req.request_date).toLocaleString('ru-RU') : '',
        statusLabels[req.status] || req.status || '',
        req.engineer_name || 'Не назначен',
        req.scheduled_time ? new Date(req.scheduled_time).toLocaleString('ru-RU') : '',
      ]
        .map((field) => `"${String(field).replace(/"/g, '""')}"`)
        .join(','))
      .join('\n');
    const csvContent = headers + rows;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `admin_requests_${new Date().toISOString().split('T')[0]}.csv`);
    setTimeout(() => setExporting(false), 1000);
  };

  const generateEngineerReport = () => {
    if (!reportMonth) {
      toast.error('Выберите месяц для отчёта.', { position: 'top-right' });
      return;
    }

    const [year, month] = reportMonth.split('-');
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const completedRequests = requests.filter((req) => {
      const requestDate = new Date(req.scheduled_time || req.request_date);
      return (
        req.status === 'COMPLETED' &&
        requestDate >= startOfMonth &&
        requestDate <= endOfMonth
      );
    });

    const engineerStats = completedRequests.reduce((acc, req) => {
      const engineer = req.engineer_name || 'Не назначен';
      acc[engineer] = (acc[engineer] || 0) + 1;
      return acc;
    }, {});

    const headers = ['Инженер,Количество выполненных заявок\n'];
    const rows = Object.entries(engineerStats)
      .map(([engineer, count]) => `"${engineer.replace(/"/g, '""')}",${count}`)
      .join('\n');
    const csvContent = headers + rows;
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `admin_engineer_report_${reportMonth}.csv`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-200">
        <ClipLoader color="#6366f1" size={50} />
        <p className="ml-2 text-gray-900">Загрузка...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <p className="text-red-500 text-gray-900">{error}</p>
        </div>
      </div>
    );
  }

  if (!requests.length) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-200">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
          <p className="text-gray-900">Заявок пока нет.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 flex justify-center bg-gray-200">
      <div className="w-full max-w-6xl mt-12">
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 text-center">Управление заявками</h2>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={exportToCSV}
                disabled={exporting}
                className="p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 focus:ring-2 focus:ring-gray-500 flex items-center w-full sm:w-auto"
              >
                {exporting ? <ClipLoader color="#ffffff" size={14} /> : (
                  <>
                    <FaDownload className="mr-2" /> Экспорт CSV
                  </>
                )}
              </button>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="month"
                  value={reportMonth}
                  onChange={(e) => setReportMonth(e.target.value)}
                  className="p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
                />
                <button
                  onClick={generateEngineerReport}
                  className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 flex items-center w-full sm:w-auto"
                >
                  <FaDownload className="mr-2" /> Отчёт по инженерам
                </button>
              </div>
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
                        <tr key={request.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">{request.full_name || '-'}</td>
                          <td className="py-3 px-4 text-sm text-gray-900">{request.equipment_type || '-'}</td>
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
                            {request.scheduled_time ? new Date(request.scheduled_time).toLocaleString('ru-RU') : 'Не задано'}
                          </td>
                          <td className="py-3 px-4">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <button
                                onClick={() => navigate(`/edit-request/${request.id}`)}
                                className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-500 flex items-center"
                              >
                                <FaEdit className="mr-1" /> Редактировать
                              </button>
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
              <p className="text-center text-gray-900">Заявок не найдено.</p>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default AdminRequestList;