import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ContactPage() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0); // Прокрутка вверх при загрузке страницы
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">Контакты</h1>
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Свяжитесь с нами</h2>
          <p className="text-gray-600 mb-4">
            Если у вас есть вопросы или предложения, пожалуйста, свяжитесь с нами любым удобным способом:
          </p>
          <ul className="space-y-2">
            <li className="flex items-center">
              <span className="font-medium text-gray-700">Телефон:</span>
              <span className="ml-2 text-gray-600">+7 (8652) 55-55-55</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium text-gray-700">Email:</span>
              <span className="ml-2 text-gray-600">support@example.com</span>
            </li>
            <li className="flex items-center">
              <span className="font-medium text-gray-700">Адрес:</span>
              <span className="ml-2 text-gray-600">г. Ставрополь, ул. Михаила Морозова, 22а</span>
            </li>
          </ul>
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Рабочее время</h2>
            <p className="text-gray-600">Понедельник–Пятница: 9:00–18:00</p>
            <p className="text-gray-600">Суббота–Воскресенье: Выходной</p>
          </div>
          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Наше местоположение</h2>
            <div className="relative w-full h-96">
              <iframe
                src="https://yandex.ru/map-widget/v1/?ll=41.957815%2C45.040020&z=18.8&mode=placemark&pt=41.957815,45.040020"
                className="w-full h-full rounded-lg"
                allowFullScreen={true}
                title="Местоположение офиса на ул. Михаила Морозова, 22а, Ставрополь"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactPage;