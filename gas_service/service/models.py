from django.db import models
from django.contrib.auth.models import User

class Location(models.Model):
    name = models.CharField(max_length=100, verbose_name='Название локации')
    address = models.TextField(verbose_name='Адрес')
    city = models.CharField(max_length=50, verbose_name='Город')

    class Meta:
        verbose_name = 'Локация'
        verbose_name_plural = 'Локации'

    def __str__(self):
        return f"{self.name}, {self.city}"

class Engineer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    full_name = models.CharField(max_length=100, verbose_name='ФИО инженера')
    phone = models.CharField(max_length=15, verbose_name='Телефон')
    email = models.EmailField(verbose_name='Email')
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, verbose_name='Локация')
    is_available = models.BooleanField(default=True, verbose_name='Доступен')

    class Meta:
        verbose_name = 'Инженер'
        verbose_name_plural = 'Инженеры'

    def __str__(self):
        return self.full_name

class ServiceRequest(models.Model):
    STATUS_CHOICES = [
        ('PENDING', 'В ожидании'),
        ('APPROVED', 'Подтверждено'),
        ('COMPLETED', 'Завершено'),
        ('CANCELLED', 'Отменено'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name='Клиент', null=True, blank=True)
    full_name = models.CharField(max_length=100, verbose_name='ФИО клиента')
    email = models.EmailField(verbose_name='Email')
    phone = models.CharField(max_length=15, verbose_name='Телефон')
    address = models.TextField(verbose_name='Адрес')
    equipment_type = models.CharField(max_length=100, verbose_name='Тип оборудования')
    request_date = models.DateTimeField(verbose_name='Желаемая дата')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING', verbose_name='Статус')
    created_at = models.DateTimeField(auto_now_add=True, verbose_name='Дата создания')
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, verbose_name='Локация')
    engineer = models.ForeignKey(Engineer, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Инженер')

    class Meta:
        verbose_name = 'Заявка на обслуживание'
        verbose_name_plural = 'Заявки на обслуживание'

    def __str__(self):
        return f"{self.full_name} - {self.equipment_type}"

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, verbose_name='Пользователь')
    full_name = models.CharField(max_length=100, verbose_name='ФИО', blank=True)
    phone = models.CharField(max_length=15, verbose_name='Телефон', blank=True)
    address = models.TextField(verbose_name='Адрес', blank=True)
    location = models.ForeignKey(Location, on_delete=models.SET_NULL, null=True, blank=True, verbose_name='Локация')

    class Meta:
        verbose_name = 'Профиль пользователя'
        verbose_name_plural = 'Профили пользователей'

    def __str__(self):
        return f"Профиль {self.user.username}"