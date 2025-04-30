# service/admin.py
from django.contrib import admin
from .models import ServiceRequest, Location, Engineer, UserProfile, Street
from .utils import set_location_for_engineer

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city')
    search_fields = ('name', 'city')

@admin.register(Street)
class StreetAdmin(admin.ModelAdmin):
    list_display = ['name', 'location']
    search_fields = ['name']
    list_filter = ['location']

@admin.register(Engineer)
class EngineerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'location', 'is_available')
    list_filter = ('is_available', 'location')
    search_fields = ('full_name', 'email', 'phone')
    list_editable = ('location', 'is_available')

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        api_key = "ВАШ_API_КЛЮЧ"  # Замени на свой ключ
        set_location_for_engineer(obj, api_key)

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'equipment_type', 'request_date', 'status', 'location', 'engineer', 'user')
    list_filter = ('status', 'location', 'engineer')
    search_fields = ('full_name', 'email', 'phone')
    list_editable = ('status', 'location', 'engineer')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'phone', 'location')
    search_fields = ('user__username', 'full_name', 'phone')