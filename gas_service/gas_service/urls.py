from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from service.views import UserProfileViewSet, ServiceRequestViewSet, EngineerViewSet, LocationViewSet, StreetViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='profile')
router.register(r'requests', ServiceRequestViewSet, basename='requests')
router.register(r'engineers', EngineerViewSet, basename='engineers')
router.register(r'locations', LocationViewSet, basename='locations')
router.register(r'streets', StreetViewSet, basename='streets')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),  # API-маршруты
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include('service.urls')),  # Добавление маршрутов из service/urls.py
]