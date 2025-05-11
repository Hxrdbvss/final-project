# service/serializers.py
from rest_framework import serializers
from .models import UserProfile, ServiceRequest, Engineer, Location, Street

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class StreetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Street
        fields = '__all__'

class EngineerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Engineer
        fields = '__all__'

class ServiceRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceRequest
        fields = '__all__'

class UserProfileSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=255)  # Разрешаем редактирование
    email = serializers.EmailField(source='user.email')

    class Meta:
        model = UserProfile
        fields = ['full_name', 'email', 'phone', 'address']

    def update(self, instance, validated_data):
        # Обновляем email пользователя
        if 'user' in validated_data:
            user_data = validated_data.pop('user')
            if 'email' in user_data:
                instance.user.email = user_data['email']
                instance.user.save()

        # Обновляем остальные поля профиля
        instance.full_name = validated_data.get('full_name', instance.full_name)
        instance.phone = validated_data.get('phone', instance.phone)
        instance.address = validated_data.get('address', instance.address)
        instance.save()
        return instance