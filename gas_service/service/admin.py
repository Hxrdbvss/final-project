from django.contrib import admin
from .models import ServiceRequest, Location, Engineer, UserProfile

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'address')
    search_fields = ('name', 'city')

@admin.register(Engineer)
class EngineerAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'location', 'is_available')
    list_filter = ('is_available', 'location')
    search_fields = ('full_name', 'email', 'phone')

@admin.register(ServiceRequest)
class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'email', 'phone', 'equipment_type', 'request_date', 'status', 'location', 'engineer', 'user')
    list_filter = ('status', 'location', 'engineer')
    search_fields = ('full_name', 'email', 'phone')

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'phone', 'location')
    search_fields = ('user__username', 'full_name', 'phone')