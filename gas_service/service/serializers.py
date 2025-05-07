from rest_framework import serializers
from .models import UserProfile, ServiceRequest, Engineer, Location, Street

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'name', 'city', 'streets']

class StreetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Street
        fields = ['id', 'name', 'location']

class UserProfileSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)  # Вложенный сериализатор для location

    class Meta:
        model = UserProfile
        fields = ['id', 'full_name', 'phone', 'address', 'location']

class EngineerSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)  # Вложенный сериализатор для location

    class Meta:
        model = Engineer
        fields = ['id', 'full_name', 'phone', 'email', 'address', 'location', 'is_available', 'work_start_time', 'work_end_time', 'schedule_type', 'schedule_start_date']

class ServiceRequestSerializer(serializers.ModelSerializer):
    location = LocationSerializer(read_only=True)  # Вложенный сериализатор для location
    engineer = EngineerSerializer(read_only=True)  # Вложенный сериализатор для engineer

    class Meta:
        model = ServiceRequest
        fields = ['id', 'full_name', 'email', 'phone', 'address', 'equipment_type', 'request_date', 'status', 'location', 'engineer']