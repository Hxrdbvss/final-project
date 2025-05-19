// frontend/src/hooks/useRequests.js
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getRequests } from '../services/api';

export const useRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('full_name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [currentPage, setCurrentPage] = useState(0);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const requestsPerPage = 5;

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

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
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

  return {
    requests,
    loading,
    error,
    searchTerm,
    suggestions,
    showSuggestions,
    statusFilter,
    sortField,
    sortOrder,
    currentPage,
    dateRange,
    paginatedRequests,
    pageCount,
    setRequests,
    setSearchTerm,
    setSuggestions,
    setShowSuggestions,
    setStatusFilter,
    setSortField,
    setSortOrder,
    setCurrentPage,
    setDateRange,
    handleSearchChange,
    handleSuggestionClick,
    handleSort,
    handlePageClick: ({ selected }) => setCurrentPage(selected),
  };
};