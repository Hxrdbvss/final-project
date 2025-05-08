// frontend/src/pages/RequestForm.jsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

function RequestForm() {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      address: '',
      equipment_type: '',
      request_date: '',
    },
  });
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  const onSubmit = (data) => {
    setFormData(data);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setShowModal(false);
    try {
      await createRequest(formData);
      toast.success('Заявка успешно создана!', { position: 'top-right' });
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при создании заявки');
      toast.error('Ошибка при создании заявки', { position: 'top-right' });
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-10 col-lg-8">
        <div className="card shadow-sm custom-card-width">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Создать заявку</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label htmlFor="full_name" className="form-label">ФИО</label>
                <input
                  id="full_name"
                  {...register('full_name', { required: 'Поле обязательно' })}
                  className={`form-control ${errors.full_name ? 'is-invalid' : ''}`}
                />
                {errors.full_name && <div className="invalid-feedback">{errors.full_name.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  id="email"
                  type="email"
                  {...register('email', {
                    required: 'Поле обязательно',
                    pattern: { value: /^\S+@\S+$/i, message: 'Неверный формат email' },
                  })}
                  className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                />
                {errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Телефон</label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone', {
                    required: 'Поле обязательно',
                    pattern: { value: /^\+?[1-9]\d{1,14}$/, message: 'Неверный формат телефона' },
                  })}
                  className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                />
                {errors.phone && <div className="invalid-feedback">{errors.phone.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Адрес</label>
                <input
                  id="address"
                  {...register('address', { required: 'Поле обязательно' })}
                  className={`form-control ${errors.address ? 'is-invalid' : ''}`}
                />
                {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="equipment_type" className="form-label">Тип оборудования</label>
                <input
                  id="equipment_type"
                  {...register('equipment_type', { required: 'Поле обязательно' })}
                  className={`form-control ${errors.equipment_type ? 'is-invalid' : ''}`}
                />
                {errors.equipment_type && <div className="invalid-feedback">{errors.equipment_type.message}</div>}
              </div>
              <div className="mb-3">
                <label htmlFor="request_date" className="form-label">Дата и время</label>
                <input
                  id="request_date"
                  type="datetime-local"
                  {...register('request_date', { required: 'Поле обязательно' })}
                  className={`form-control ${errors.request_date ? 'is-invalid' : ''}`}
                />
                {errors.request_date && <div className="invalid-feedback">{errors.request_date.message}</div>}
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Отправить
              </button>
            </form>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Подтверждение</Modal.Title>
              </Modal.Header>
              <Modal.Body>Вы уверены, что хотите отправить заявку?</Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Отмена
                </Button>
                <Button variant="primary" onClick={handleConfirm}>
                  Подтвердить
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestForm;