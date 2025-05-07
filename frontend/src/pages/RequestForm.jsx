// frontend/src/pages/RequestForm.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRequest } from '../services/api';

function RequestForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    equipment_type: '',
    request_date: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createRequest(formData);
      navigate('/requests');
    } catch (err) {
      setError(err.response?.data?.detail || 'Ошибка при создании заявки');
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-10 col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Создать заявку</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="full_name" className="form-label">ФИО</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Адрес</label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="equipment_type" className="form-label">Тип оборудования</label>
                <input
                  type="text"
                  id="equipment_type"
                  name="equipment_type"
                  value={formData.equipment_type}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="request_date" className="form-label">Дата и время</label>
                <input
                  type="datetime-local"
                  id="request_date"
                  name="request_date"
                  value={formData.request_date}
                  onChange={handleChange}
                  className="form-control"
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Отправить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestForm;