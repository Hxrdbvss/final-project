from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Location(models.Model):
    name = models.CharField(max_length=100)  # Например, "Центральный"
    city = models.CharField(max_length=100)  # Например, "Ставрополь"
    streets = models.TextField(blank=True)  # Список улиц: "Ленина, Мира"

    def __str__(self):
        return f"{self.name}, {self.city}"

class Street(models.Model):
    name = models.CharField(max_length=100)  # Например, "Ленина"
    location = models.ForeignKey(Location, on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=15, blank=True)
    address = models.TextField(blank=True)
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)

    def __str__(self):
        return self.full_name or self.user.username

class Engineer(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=15)
    email = models.EmailField()
    address = models.TextField(blank=True)  # Новый адрес
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)
    is_available = models.BooleanField(default=True)
    work_start_time = models.TimeField(default="09:00")
    work_end_time = models.TimeField(default="18:00")
    schedule_type = models.CharField(max_length=10, default="2/2")  # Например, "2/2"
    schedule_start_date = models.DateField(default=timezone.now)

    def __str__(self):
        return self.full_name

class ServiceRequest(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'В ожидании'),
        ('APPROVED', 'Подтверждено'),
        ('COMPLETED', 'Завершено'),
        ('CANCELLED', 'Отменено'),
    )

    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=15)
    address = models.TextField()
    equipment_type = models.CharField(max_length=100)
    request_date = models.DateTimeField(auto_now_add=True)
    scheduled_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    engineer = models.ForeignKey(Engineer, null=True, blank=True, on_delete=models.SET_NULL)
    location = models.ForeignKey(Location, null=True, blank=True, on_delete=models.SET_NULL)
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time_of_day = models.CharField(
        max_length=20,
        choices=[
            ('morning', 'Morning (9:00–12:00)'),
            ('afternoon', 'Afternoon (12:00–15:00)'),
            ('evening', 'Evening (15:00–18:00)'),
        ],
        null=True,
        blank=True
    )

    def __str__(self):
        return f"Заявка #{self.id} от {self.full_name}"