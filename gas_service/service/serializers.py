from rest_framework import serializers
from .models import UserProfile, ServiceRequest, Engineer, Location, Street
from django.utils import timezone
from datetime import datetime, timedelta

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', allow_null=True, default=None)

    class Meta:
        model = UserProfile
        fields = ['id', 'user', 'role', 'full_name', 'email', 'phone', 'address']
        read_only_fields = ['user', 'role']

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.save()

        user_data = validated_data.get('user', {})
        if 'email' in user_data and instance.user:
            instance.user.email = user_data['email']
            instance.user.save()

        return instance

class EngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engineer
        fields = ['id', 'user', 'full_name', 'is_available', 'location', 'work_start_time', 'work_end_time', 'schedule_type', 'schedule_start_date']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class StreetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Street
        fields = '__all__'

class ServiceRequestSerializer(serializers.ModelSerializer):
    engineer_name = serializers.SerializerMethodField()
    engineer_id = serializers.IntegerField(source='engineer.id', read_only=True, allow_null=True)
    scheduled_time = serializers.DateTimeField(format='%Y-%m-%d %H:%M', read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id', 'user', 'full_name', 'email', 'phone', 'address', 'equipment_type',
            'request_date', 'scheduled_time', 'status', 'engineer', 'engineer_name',
            'engineer_id', 'location', 'preferred_date', 'preferred_time_of_day'
        ]
        read_only_fields = ['id', 'user', 'request_date', 'scheduled_time', 'engineer', 'engineer_name', 'engineer_id']

    def get_engineer_name(self, obj):
        return obj.engineer.userprofile.full_name if obj.engineer and hasattr(obj.engineer, 'userprofile') and obj.engineer.userprofile else 'Не указан'

    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['user'] = request.user if request else None
        instance = super().create(validated_data)

        profile, created = UserProfile.objects.get_or_create(user=request.user)
        profile.full_name = validated_data.get('full_name', profile.full_name)
        profile.phone = validated_data.get('phone', profile.phone)
        profile.address = validated_data.get('address', profile.address)
        profile.save()

        return instance

    def update(self, instance, validated_data):
        old_status = instance.status
        instance = super().update(instance, validated_data)

        profile, created = UserProfile.objects.get_or_create(user=instance.user)
        profile.full_name = validated_data.get('full_name', profile.full_name)
        profile.phone = validated_data.get('phone', profile.phone)
        profile.address = validated_data.get('address', profile.address)
        profile.save()

        preferred_date = validated_data.get('preferred_date')
        preferred_time_of_day = validated_data.get('preferred_time_of_day')
        if preferred_date and preferred_time_of_day:
            instance.preferred_date = preferred_date
            instance.preferred_time_of_day = preferred_time_of_day
            instance.save()

        return instance