# service/utils.py
import re
import requests
from django.conf import settings
from .models import Street

def extract_street(address):
    # Улучшенный парсинг: ищем "ул.", "улица", и т.д., игнорируем пробелы и регистр
    address = address.lower().strip()
    patterns = [r'ул\.?\s*([^\s,]+)', r'улица\s*([^\s,]+)']
    for pattern in patterns:
        match = re.search(pattern, address, re.IGNORECASE)
        if match:
            street_name = match.group(1).strip().capitalize()
            print(f"Извлечённая улица: {street_name}")  # Отладка
            return street_name
    print(f"Не удалось извлечь улицу из адреса: {address}")  # Отладка
    return None

def find_location(street_name, api_key):
    if not street_name:
        print("Улица не передана в find_location")
        return None

    # Поиск в базе
    street = Street.objects.filter(name__iexact=street_name).first()
    if street:
        print(f"Улица найдена в базе: {street.name}, локация: {street.location}")
        return street.location

    # Если не нашли, используем HTTP Геокодер
    print(f"Улица {street_name} не найдена в базе, обращаемся к Яндекс.Картам")
    url = f"https://geocode-maps.yandex.ru/1.x/?apikey={api_key}&geocode={street_name}&format=json"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        try:
            components = data['response']['GeoObjectCollection']['featureMember'][0]['GeoObject']['metaDataProperty']['GeocoderMetaData']['Address']['Components']
            for component in components:
                if component['kind'] == 'street':
                    street_name = component['name'].strip().capitalize()
                    print(f"Яндекс.Карты вернули улицу: {street_name}")  # Отладка
                    street = Street.objects.filter(name__iexact=street_name).first()
                    if street:
                        print(f"Улица найдена после Геокодера: {street.name}, локация: {street.location}")
                        return street.location
                    else:
                        print(f"Улица {street_name} не найдена в базе даже после Геокодера")
        except (IndexError, KeyError) as e:
            print(f"Ошибка при обработке ответа Геокодера: {e}")
    else:
        print(f"Ошибка HTTP Геокодера: {response.status_code}")
    return None

def set_location_for_engineer(engineer, api_key):
    street_name = extract_street(engineer.address)
    location = find_location(street_name, api_key)
    if location:
        engineer.location = location
        engineer.save()
    else:
        print(f'Инженер #{engineer.id}: адрес "{engineer.address}" не распознан. Выберите район вручную.')