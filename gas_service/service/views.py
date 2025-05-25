from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated  # Добавляем импорт
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
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
        try:
            profile, created = UserProfile.objects.get_or_create(user=self.request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Exception as e:
            print(f"List error: {e}")
            return Response({"error": str(e)}, status=500)

    def update(self, request, *args, **kwargs):
        profile, created = UserProfile.objects.get_or_create(user=self.request.user)
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data)
        except Exception as e:
            print(f"Update error: {e}")
            return Response({"error": str(e)}, status=400)

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
                'morning': (time(9, 0), time(12, 0)),
                'afternoon': (time(12, 0), time(15, 0)),
                'evening': (time(15, 0), time(18, 0)),
            }
            start_time, end_time = time_ranges.get(preferred_time_of_day, (time(9, 0), time(12, 0)))

            tomorrow = timezone.now().date() + timedelta(days=1)
            if preferred_date < tomorrow:
                raise ValidationError("Дата должна быть не раньше завтра.")

            scheduled_time = None
            selected_engineer = None
            current_date = preferred_date

            max_attempts = 7
            attempt = 0
            while attempt < max_attempts and not scheduled_time:
                engineers = Engineer.objects.filter(
                    is_available=True,
                    work_start_time__lte=start_time,
                    work_end_time__gte=end_time
                )
                if location:
                    engineers = engineers.filter(location=location)

                for engineer in engineers.order_by('?'):
                    if is_working_day(engineer, current_date):
                        for hour in range(start_time.hour, end_time.hour):
                            check_time = timezone.make_aware(datetime.combine(current_date, time(hour)))
                            conflicts = ServiceRequest.objects.filter(
                                engineer=engineer,
                                scheduled_time__date=current_date,
                                scheduled_time__hour=hour
                            ).count()
                            if conflicts == 0:
                                scheduled_time = check_time
                                selected_engineer = engineer
                                break
                        if scheduled_time:
                            break
                if not scheduled_time:
                    current_date += timedelta(days=1)
                attempt += 1

            if not scheduled_time:
                raise ValidationError("Нет доступных инженеров в течение ближайших 7 дней.")

            serializer.validated_data['scheduled_time'] = scheduled_time
            serializer.validated_data['engineer'] = selected_engineer
            serializer.validated_data['status'] = 'APPROVED'
        else:
            next_day = timezone.now().date() + timedelta(days=1)
            scheduled_time = timezone.make_aware(datetime.combine(next_day, time(9, 0)))
            engineers = Engineer.objects.filter(is_available=True)
            if location:
                engineers = engineers.filter(location=location)
            selected_engineer = next((e for e in engineers.order_by('?') if is_working_day(e, next_day)), None)
            if not selected_engineer:
                raise ValidationError("Нет доступных инженеров.")
            serializer.validated_data['scheduled_time'] = scheduled_time
            serializer.validated_data['engineer'] = selected_engineer
            serializer.validated_data['status'] = 'APPROVED'

        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(user=self.request.user)

def is_working_day(engineer, date):
    if engineer.schedule_type == '2/2':
        delta = (date - engineer.schedule_start_date).days
        cycle_position = delta % 4
        return cycle_position in [0, 1]
    return True

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_engineer(request):
    user_profile = UserProfile.objects.get(user=request.user)
    if user_profile.role != 'ADMIN':
        return Response({'detail': 'У вас нет прав для этой операции.'}, status=status.HTTP_403_FORBIDDEN)

    serializer = EngineerSerializer(data=request.data)
    if serializer.is_valid():
        username = request.data.get('email').split('@')[0]
        password = User.objects.make_random_password()
        user = User.objects.create_user(username=username, email=request.data.get('email'), password=password)
        engineer_data = serializer.validated_data
        engineer_data['user'] = user
        engineer = serializer.create(engineer_data)
        return Response(EngineerSerializer(engineer).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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