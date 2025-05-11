# backend/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from service.views import (
    LocationViewSet, StreetViewSet, UserProfileViewSet, EngineerViewSet,
    ServiceRequestViewSet, api_register, TokenObtainPairView, TokenRefreshView,
    create_request, request_list, register, user_login, user_logout, profile, cancel_request
)

# Настройка маршрутов для ViewSet
router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'streets', StreetViewSet)
router.register(r'user-profiles', UserProfileViewSet)  # Базовый маршрут для UserProfileViewSet
router.register(r'engineers', EngineerViewSet)
router.register(r'requests', ServiceRequestViewSet)

# Кастомный маршрут для /api/profile/
user_profile_list = UserProfileViewSet.as_view({
    'get': 'list',    # Для GET-запросов
    'put': 'update',  # Для PUT-запросов
})

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/profile/', user_profile_list, name='user-profile'),  # Кастомный маршрут для профиля
    path('api/register/', api_register, name='api_register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create_request/', create_request, name='create_request'),
    path('requests/', request_list, name='request_list'),
    path('register/', register, name='register'),
    path('login/', user_login, name='login'),
    path('logout/', user_logout, name='logout'),
    path('profile/', profile, name='profile'),
    path('cancel_request/<int:request_id>/', cancel_request, name='cancel_request'),
]