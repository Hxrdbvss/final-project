import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getProfile, unsubscribeProfile } from '../services/api';

function EditProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getProfile();
        setProfile(data);
      } catch (error) {
        toast.error(error.message);
      }
    };
    fetchProfile();
  }, []);

  const handleUnsubscribe = async () => {
    try {
      await unsubscribeProfile();
      toast.success('Вы отписались от профиля.');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      navigate('/login');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (!profile) return <div className="text-center mt-10">Загрузка...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Профиль</h2>
      <div className="space-y-4">
        <div>
          <strong className="text-gray-700">Имя:</strong> {profile.name || 'Не указано'}
        </div>
        <div>
          <strong className="text-gray-700">Email:</strong> {profile.email || 'Не указан'}
        </div>
        <button
          onClick={handleUnsubscribe}
          className="mt-4 w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Отписаться
        </button>
      </div>
    </div>
  );
}

export default EditProfile;