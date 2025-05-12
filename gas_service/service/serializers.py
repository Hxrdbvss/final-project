# service/serializers.py
from rest_framework import serializers
from .models import UserProfile, ServiceRequest, Engineer, Location, Street
from django.utils import timezone
from datetime import datetime, timedelta

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)  # Получаем email из User

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'full_name', 'email', 'phone', 'address', 'location']
        read_only_fields = ['user', 'email']

    def to_representation(self, instance):
        try:
            return super().to_representation(instance)
        except Exception as e:
            print(f"Error in UserProfileSerializer: {e}")
            return {"error": "Failed to serialize profile"}
class EngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engineer
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class StreetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Street
        fields = '__all__'

class ServiceRequestSerializer(serializers.ModelSerializer):
    engineer_name = serializers.CharField(source='engineer.full_name', read_only=True, allow_null=True)  # Новое поле для ФИО инженера

    class Meta:
        model = ServiceRequest
        fields = ['id', 'user', 'full_name', 'phone', 'address', 'equipment_type', 'request_date', 'scheduled_time', 'status', 'engineer', 'engineer_name']
        read_only_fields = ['id', 'user', 'request_date', 'status', 'engineer']

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user if request else None
        instance = super().create(validated_data)

        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.full_name = validated_data.get('full_name', profile.full_name)
        profile.phone = validated_data.get('phone', profile.phone)
        profile.address = validated_data.get('address', profile.address)
        profile.save()

        send_notification(
            request.user.email,
            'Новая заявка создана',
            f'Ваша заявка #{instance.id} на {instance.equipment_type} создана. Статус: {instance.status}.'
        )
        if instance.engineer and hasattr(instance.engineer, 'email') and instance.engineer.email:
            send_notification(
                instance.engineer.email,
                'Новая заявка назначена',
                f'Вам назначена заявка #{instance.id} на {instance.scheduled_time}.'
            )

        if instance.scheduled_time:
            scheduled_time = instance.scheduled_time
            scheduled_date = scheduled_time.date()
            scheduled_hour = scheduled_time.time()

            engineers = Engineer.objects.filter(
                is_available=True,
                work_start_time__lte=scheduled_hour,
                work_end_time__gte=scheduled_hour
            )

            available_engineers = []
            for engineer in engineers:
                days_since_start = (scheduled_date - engineer.schedule_start_date).days
                if engineer.schedule_type == "2/2":
                    cycle_position = days_since_start % 4
                    if cycle_position < 2:
                        available_engineers.append(engineer)
                else:
                    available_engineers.append(engineer)

            if available_engineers:
                engineer_workload = []
                for engineer in available_engineers:
                    workload = ServiceRequest.objects.filter(
                        engineer=engineer,
                        scheduled_time__date=scheduled_date
                    ).count()
                    engineer_workload.append((engineer, workload))

                engineer_workload.sort(key=lambda x: x[1])
                selected_engineer = engineer_workload[0][0] if engineer_workload else None

                if selected_engineer:
                    instance.engineer = selected_engineer
                    instance.status = 'APPROVED'
                    instance.save()

        return instance

    def update(self, instance, validated_data):
        old_status = instance.status
        instance = super().update(instance, validated_data)

        profile, created = UserProfile.objects.get_or_create(user=instance.user)
        profile.full_name = validated_data.get('full_name', profile.full_name)
        profile.phone = validated_data.get('phone', profile.phone)
        profile.address = validated_data.get('address', profile.address)
        profile.save()

        if instance.status != old_status:
            send_notification(
                instance.user.email,
                'Статус заявки изменён',
                f'Статус вашей заявки #{instance.id} изменён на {instance.status}.'
            )
            if instance.engineer and hasattr(instance.engineer, 'email') and instance.engineer.email:
                send_notification(
                    instance.engineer.email,
                    'Обновление заявки',
                    f'Заявка #{instance.id} теперь имеет статус {instance.status}.'
                )

        return instance