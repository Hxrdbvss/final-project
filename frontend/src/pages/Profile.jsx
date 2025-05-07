// frontend/src/pages/Profile.jsx
import { useState, useEffect } from 'react';
import { getProfile, updateProfile } from '../services/api';

function Profile() {
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    address: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data[0] || { full_name: '', phone: '', address: '' });
      } catch (err) {
        setError('Ошибка при загрузке профиля');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(profile);
      alert('Профиль обновлён');
    } catch (err) {
      setError('Ошибка при обновлении профиля');
    }
  };

  if (loading) return <div className="text-center mt-5">Загрузка...</div>;
  if (error) return <div className="alert alert-danger mt-5">{error}</div>;

  return (
    <div className="row justify-content-center">
      <div className="col-md-10 col-lg-8">
        <div className="card shadow-sm">
          <div className="card-body">
            <h2 className="card-title text-center mb-4">Профиль пользователя</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="full_name" className="form-label">ФИО</label>
                <input
                  type="text"
                  id="full_name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="phone" className="form-label">Телефон</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="address" className="form-label">Адрес</label>
                <textarea
                  id="address"
                  name="address"
                  value={profile.address}
                  onChange={handleChange}
                  className="form-control"
                  rows="3"
                />
              </div>
              <button type="submit" className="btn btn-primary w-100">
                Сохранить
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;