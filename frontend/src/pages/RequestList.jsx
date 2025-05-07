// frontend/src/pages/RequestList.jsx
import { useState, useEffect } from 'react';
import { getRequests, cancelRequest } from '../services/api';

function RequestList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getRequests();
        setRequests(data);
      } catch (err) {
        setError('Ошибка при загрузке заявок');
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleCancel = async (id) => {
    try {
      await cancelRequest(id);
      setRequests(requests.filter(req => req.id !== id));
    } catch (err) {
      setError('Ошибка при отмене заявки');
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="row justify-content-center">
      <div className="col-12">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title mb-4">Ваши заявки</h2>
            {requests.length ? (
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="thead-dark">
                    <tr>
                      <th>ФИО</th>
                      <th>Email</th>
                      <th>Оборудование</th>
                      <th>Статус</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map(request => (
                      <tr key={request.id}>
                        <td>{request.full_name}</td>
                        <td>{request.email}</td>
                        <td>{request.equipment_type}</td>
                        <td>
                          <span
                            className={`badge ${
                              request.status === 'APPROVED'
                                ? 'bg-success'
                                : request.status === 'PENDING'
                                ? 'bg-warning'
                                : 'bg-danger'
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => handleCancel(request.id)}
                            className="btn btn-danger btn-sm"
                          >
                            Отменить
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center">Заявок не найдено.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestList;