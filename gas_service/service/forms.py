# service/forms.py
import re
from django import forms
from django.utils import timezone
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import ServiceRequest, UserProfile
from datetime import time

class ServiceRequestForm(forms.ModelForm):
    class Meta:
        model = ServiceRequest
        fields = ['full_name', 'email', 'phone', 'address', 'equipment_type', 'scheduled_time']
        widgets = {
            'scheduled_time': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
            'address': forms.TextInput(attrs={'id': 'address'}),
        }

    def __init__(self, *args, user=None, **kwargs):  # Перемещаем user после *args
        super().__init__(*args, **kwargs)
        if user and user.is_authenticated:
            profile, created = UserProfile.objects.get_or_create(user=user)
            self.fields['full_name'].initial = profile.full_name
            self.fields['email'].initial = user.email
            self.fields['phone'].initial = profile.phone
            self.fields['address'].initial = profile.address

    def clean_scheduled_time(self):
        scheduled_time = self.cleaned_data['scheduled_time']
        now = timezone.now()
        if scheduled_time < now:
            raise forms.ValidationError("Дата и время должны быть в будущем")
        hour = scheduled_time.hour
        if not (9 <= hour < 18):
            raise forms.ValidationError("Время должно быть с 9:00 до 18:00")
        return scheduled_time

    def clean_phone(self):
        phone = self.cleaned_data['phone']
        if not re.match(r'^\+?\d{10,15}$', phone):
            raise forms.ValidationError("Некорректный номер телефона")
        return phone

class UserRegisterForm(UserCreationForm):
    email = forms.EmailField()

    class Meta:
        model = User
        fields = ['username', 'email', 'password1', 'password2']

class UserProfileForm(forms.ModelForm):
    class Meta:
        model = UserProfile
        fields = ['full_name', 'phone', 'address']
        widgets = {
            'location': forms.Select(attrs={'required': False}),
        }