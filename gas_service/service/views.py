# service/views.py
import requests
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta, time
from .forms import ServiceRequestForm, UserRegisterForm, UserProfileForm
from .models import ServiceRequest, Engineer, UserProfile, Location, Street
from .utils import extract_street, find_location, set_location_for_engineer
from .serializers import UserProfileSerializer, ServiceRequestSerializer, EngineerSerializer, LocationSerializer, StreetSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]

class StreetViewSet(viewsets.ModelViewSet):
    queryset = Street.objects.all()
    serializer_class = StreetSerializer
    permission_classes = [IsAuthenticated]

class UserProfileViewSet(viewsets.ModelViewSet):
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EngineerViewSet(viewsets.ModelViewSet):
    queryset = Engineer.objects.all()
    serializer_class = EngineerSerializer
    permission_classes = [IsAuthenticated]

class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ServiceRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@csrf_exempt
@api_view(['POST'])
def api_register(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not username or not password or not email:
        return Response({'detail': 'Все поля обязательны'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'detail': 'Пользователь с таким именем уже существует'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=username, password=password, email=email)
    UserProfile.objects.create(user=user)
    return Response({'detail': 'Пользователь успешно создан'}, status=status.HTTP_201_CREATED)

@login_required
def create_request(request):
    if request.method == 'POST':
        form = ServiceRequestForm(request.POST, user=request.user)
        if form.is_valid():
            service_request = form.save(commit=False)
            service_request.user = request.user

            # Определение локации
            street_name = extract_street(service_request.address)
            api_key = "ВАШ_API_КЛЮЧ"  # Замени на реальный API-ключ
            service_request.location = find_location(street_name, api_key)
            if not service_request.location:
                messages.warning(request, "Адрес не распознан, заявка в обработке")

            # Сохранение профиля
            profile, created = UserProfile.objects.get_or_create(user=request.user)
            profile.full_name = service_request.full_name
            profile.email = service_request.email
            profile.phone = service_request.phone
            profile.address = service_request.address
            profile.location = service_request.location
            profile.save()

            # Проверка даты и времени
            request_date = service_request.request_date
            if request_date < timezone.now() or not (9 <= request_date.hour < 18):
                service_request.status = 'CANCELLED'
                service_request.save()
                messages.error(request, "Дата/время недоступны")
                return redirect('request_list')

            # Поиск инженера
            current_date = request_date.date()
            slot_hour = request_date.hour
            max_attempts = 7
            engineer_found = False

            for i in range(max_attempts):
                engineers = Engineer.objects.filter(location=service_request.location, is_available=True) if service_request.location else Engineer.objects.filter(is_available=True)
                for engineer in engineers:
                    if is_working_day(engineer, current_date) and is_slot_free(engineer, current_date, slot_hour):
                        service_request.engineer = engineer
                        service_request.status = 'APPROVED'
                        service_request.request_date = timezone.datetime.combine(current_date, time(slot_hour))
                        service_request.save()
                        messages.success(request, f"Заявка подтверждена на {service_request.request_date}")
                        engineer_found = True
                        break
                if engineer_found:
                    break
                current_date += timedelta(days=1)
                slot_hour = 9

            if not engineer_found:
                service_request.status = 'PENDING'
                service_request.save()
                messages.info(request, "Заявка в ожидании")

            return redirect('request_list')
    else:
        form = ServiceRequestForm(user=request.user)
    return render(request, 'service/request_form.html', {'form': form})

def is_working_day(engineer, date):
    if engineer.schedule_type == '2/2':
        delta = (date - engineer.schedule_start_date).days
        return delta % 4 in [0, 1]
    return True

def is_slot_free(engineer, date, hour):
    slot_start = timezone.datetime.combine(date, time(hour))
    slot_end = slot_start + timedelta(hours=1)
    return not ServiceRequest.objects.filter(
        engineer=engineer,
        request_date__gte=slot_start,
        request_date__lt=slot_end,
        status__in=['PENDING', 'APPROVED']
    ).exists()

@login_required
def request_list(request):
    requests = ServiceRequest.objects.filter(user=request.user).order_by('-request_date')
    return render(request, 'service/request_list.html', {'requests': requests})

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            UserProfile.objects.create(user=user)
            username = form.cleaned_data.get('username')
            messages.success(request, f'Аккаунт создан для {username}! Теперь вы можете войти.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'service/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли!')
            return redirect('create_request')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль.')
    return render(request, 'service/login.html')

@login_required
def user_logout(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли!')
    return redirect('login')

@login_required
def profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Профиль успешно обновлён!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=profile)
    requests = ServiceRequest.objects.filter(user=request.user).order_by('-request_date')
    return render(request, 'service/profile.html', {'form': form, 'requests': requests})

@login_required
def cancel_request(request, request_id):
    # Находим заявку и проверяем, что она принадлежит текущему пользователю
    service_request = get_object_or_404(ServiceRequest, id=request_id, user=request.user)
    
    # Удаляем заявку
    service_request.delete()
    messages.success(request, 'Заявка успешно отменена.')
    return redirect('profile')