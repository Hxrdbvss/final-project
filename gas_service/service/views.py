from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.contrib.auth.models import User
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timedelta, time
from .models import ServiceRequest, Engineer, UserProfile, Location, Street
from .serializers import (
    UserProfileSerializer, ServiceRequestSerializer, EngineerSerializer,
    LocationSerializer, StreetSerializer
)

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

    def list(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        serializer = self.get_serializer(profile)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

class EngineerViewSet(viewsets.ModelViewSet):
    queryset = Engineer.objects.all()
    serializer_class = EngineerSerializer
    permission_classes = [IsAuthenticated]

class ServiceRequestViewSet(viewsets.ModelViewSet):
    serializer_class = ServiceRequestSerializer
    permission_classes = [IsAuthenticated]
    queryset = ServiceRequest.objects.all()

    def get_queryset(self):
        return ServiceRequest.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        preferred_date = serializer.validated_data.get('preferred_date')
        preferred_time_of_day = serializer.validated_data.get('preferred_time_of_day')
        location = serializer.validated_data.get('location')

        if preferred_date and preferred_time_of_day:
            time_ranges = {
                'morning': (9, 12),
                'afternoon': (12, 15),
                'evening': (15, 18),
            }
            start_hour, end_hour = time_ranges.get(preferred_time_of_day, (9, 12))

            # Проверяем, что дата не раньше завтра
            tomorrow = timezone.now().date() + timedelta(days=1)
            if preferred_date < tomorrow:
                raise serializer.ValidationError("Дата должна быть не раньше завтра.")

            engineers = Engineer.objects.filter(
                is_available=True,
                work_start_time__lte=time(start_hour),
                work_end_time__gte=time(end_hour)
            )
            if location:
                engineers = engineers.filter(location=location)

            scheduled_time = None
            selected_engineer = None

            # Проверяем доступность инженеров
            for engineer in engineers.order_by('?'):
                if not is_working_day(engineer, preferred_date):
                    continue
                # Выбираем первый свободный час в диапазоне
                for hour in range(start_hour, end_hour):
                    current_time = datetime.combine(preferred_date, time(hour))
                    current_time = timezone.make_aware(current_time)
                    conflicts = ServiceRequest.objects.filter(
                        engineer=engineer,
                        scheduled_time__year=current_time.year,
                        scheduled_time__month=current_time.month,
                        scheduled_time__day=current_time.day,
                        scheduled_time__hour=current_time.hour,
                    ).count()
                    if conflicts == 0:
                        scheduled_time = current_time
                        selected_engineer = engineer
                        break
                if scheduled_time:
                    break

            # Если инженер не найден, пробуем следующий день
            if not scheduled_time:
                next_day = preferred_date + timedelta(days=1)
                for engineer in engineers.order_by('?'):
                    if not is_working_day(engineer, next_day):
                        continue
                    for hour in range(start_hour, end_hour):
                        current_time = datetime.combine(next_day, time(hour))
                        current_time = timezone.make_aware(current_time)
                        conflicts = ServiceRequest.objects.filter(
                            engineer=engineer,
                            scheduled_time__year=current_time.year,
                            scheduled_time__month=current_time.month,
                            scheduled_time__day=current_time.day,
                            scheduled_time__hour=current_time.hour,
                        ).count()
                        if conflicts == 0:
                            scheduled_time = current_time
                            selected_engineer = engineer
                            break
                    if scheduled_time:
                        break

            # Если инженер найден, сохраняем заявку
            if selected_engineer and scheduled_time:
                serializer.validated_data['scheduled_time'] = scheduled_time
                serializer.validated_data['engineer'] = selected_engineer
            else:
                raise serializer.ValidationError("Нет доступных инженеров для выбранной даты и времени.")
        else:
            # Если дата или время не указаны, назначаем завтра 9:00
            next_day = timezone.now().date() + timedelta(days=1)
            scheduled_time = datetime.combine(next_day, time(9))
            scheduled_time = timezone.make_aware(scheduled_time)
            engineers = Engineer.objects.filter(is_available=True)
            if location:
                engineers = engineers.filter(location=location)
            selected_engineer = engineers.order_by('?').first() if engineers.exists() else None
            if not selected_engineer:
                raise serializer.ValidationError("Нет доступных инженеров.")
            serializer.validated_data['scheduled_time'] = scheduled_time
            serializer.validated_data['engineer'] = selected_engineer

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

def is_working_day(engineer, date):
    if engineer.schedule_type == '2/2':
        delta = (date - engineer.schedule_start_date).days
        return delta % 4 in [0, 1]
    return True

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
    UserProfile.objects.get_or_create(user=user)
    return Response({'detail': 'Пользователь успешно создан'}, status=status.HTTP_201_CREATED)