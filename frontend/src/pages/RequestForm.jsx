// frontend/src/pages/RequestForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, createRequest } from '../services/api';
import { Button, Form } from 'react-bootstrap';
import { FaSave } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

function RequestForm() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    request_date: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          request_date: '', // Дата задаётся пользователем
        });
      } catch (err) {
        setError('Ошибка при загрузке профиля.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRequest(formData); // Предполагаем, что есть функция createRequest в api.js
      toast.success('Заявка успешно создана!');
      navigate('/requests');
    } catch (err) {
      toast.error('Ошибка при создании заявки.');
    }
  };

  if (loading) return (
    <div className="text-center mt-5">
      <ClipLoader color="#007bff" size={50} />
      <p className="mt-2">Загрузка...</p>
    </div>
  );

  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Создание заявки</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label><strong>ФИО:</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Введите ФИО"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>Email:</strong></Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Введите email"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>Телефон:</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Введите телефон"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>Адрес:</strong></Form.Label>
                <Form.Control
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Введите адрес"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label><strong>Дата и время:</strong></Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="request_date"
                  value={formData.request_date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().slice(0, 16)}
                />
              </Form.Group>
              <motion.div whileHover={{ scale: 1.05 }} className="d-flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  className="w-50 d-flex align-items-center justify-content-center"
                >
                  <FaSave className="me-1" /> Создать
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => navigate('/')}
                  className="w-50 d-flex align-items-center justify-content-center"
                >
                  Отмена
                </Button>
              </motion.div>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestForm;