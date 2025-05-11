// frontend/src/pages/EditRequest.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Form, Button, Container } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ClipLoader } from 'react-spinners';
import { getRequests, updateRequest } from '../services/api';

function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    equipment_type: '',
    scheduled_time: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requests = await getRequests();
        const request = requests.find((req) => req.id === parseInt(id));
        if (request) {
          setFormData({
            full_name: request.full_name || '',
            email: request.email || '',
            phone: request.phone || '',
            address: request.address || '',
            equipment_type: request.equipment_type || '',
            scheduled_time: request.scheduled_time
              ? new Date(request.scheduled_time).toISOString().slice(0, 16)
              : '',
          });
        } else {
          toast.error('Заявка не найдена.', { position: 'top-right' });
          navigate('/requests');
        }
      } catch (err) {
        toast.error('Ошибка при загрузке заявки.', { position: 'top-right' });
      } finally {
        setFetching(false);
      }
    };
    fetchRequest();
  }, [id, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.equipment_type || !formData.scheduled_time) {
      toast.error('Заполните обязательные поля: тип оборудования и время!', { position: 'top-right' });
      return;
    }

    const formattedData = {
      ...formData,
      scheduled_time: new Date(formData.scheduled_time).toISOString(),
    };

    setLoading(true);
    try {
      await updateRequest(id, formattedData);
      toast.success('Заявка обновлена!', { position: 'top-right' });
      navigate('/requests');
    } catch (err) {
      console.error('Ошибка API:', err.response?.data || err.message);
      toast.error('Ошибка при обновлении заявки.', { position: 'top-right' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="text-center mt-5">
        <ClipLoader color="#007bff" size={50} />
        <p className="mt-2">Загрузка...</p>
      </div>
    );
  }

  return (
    <Container fluid className="min-h-screen py-10 px-4 bg-gradient-to-br from-gray-100 to-white dark:from-gray-900 dark:to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <div className="card p-6">
          <h2 className="card-title mb-6 text-center">Редактировать заявку</h2>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">ФИО</Form.Label>
              <Form.Control
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Введите ФИО"
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Введите email"
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Телефон</Form.Label>
              <Form.Control
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Введите телефон"
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Адрес</Form.Label>
              <Form.Control
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Введите адрес"
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
              />
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Тип оборудования *</Form.Label>
              <Form.Select
                name="equipment_type"
                value={formData.equipment_type}
                onChange={handleInputChange}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
                required
              >
                <option value="">Выберите тип оборудования</option>
                <option value="Газовый котёл">Газовый котёл</option>
                <option value="Газовая плита">Газовая плита</option>
                <option value="Газопровод">Газопровод</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-4">
              <Form.Label className="text-lg font-medium text-teal-400">Время назначения *</Form.Label>
              <Form.Control
                type="datetime-local"
                name="scheduled_time"
                value={formData.scheduled_time}
                onChange={handleInputChange}
                className="bg-white/30 dark:bg-gray-800/30 backdrop-blur-md border-teal-400/20"
                required
              />
            </Form.Group>
            <motion.div whileHover={{ scale: 1.05 }} className="text-center">
              <Button
                variant="primary"
                type="submit"
                disabled={loading}
                className="w-100"
              >
                {loading ? <ClipLoader color="#fff" size={20} /> : 'Сохранить'}
              </Button>
            </motion.div>
          </Form>
        </div>
      </motion.div>
    </Container>
  );
}

export default EditRequest;