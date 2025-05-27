import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm">
          © 2025 Газпром Сервис. Все права защищены.
        </p>
        <p className="text-sm mt-2">
          Газпром Сервис — ведущая компания в области обслуживания и ремонта газового оборудования. Мы предоставляем качественные услуги по всей территории России. Свяжитесь с нами: info@gazprom-service.ru | +7 (495) 123-45-67.
        </p>
        <div className="mt-4">
          <a href="/privacy" className="text-indigo-400 hover:text-indigo-300 mx-2">Политика конфиденциальности</a>
          <a href="/terms" className="text-indigo-400 hover:text-indigo-300 mx-2">Условия использования</a>
          <a href="/contacts" className="text-indigo-400 hover:text-indigo-300 mx-2">Контакты</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;