from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    LocationViewSet, StreetViewSet, UserProfileViewSet, EngineerViewSet,
    ServiceRequestViewSet, api_register, TokenObtainPairView, TokenRefreshView,
    create_engineer
)

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'streets', StreetViewSet)
router.register(r'user-profiles', UserProfileViewSet, basename='user-profiles')
router.register(r'engineers', EngineerViewSet)
router.register(r'requests', ServiceRequestViewSet, basename='requests')

user_profile_list = UserProfileViewSet.as_view({
    'get': 'list',
    'put': 'update',
})

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/profile/', user_profile_list, name='user-profile'),
    path('api/register/', api_register, name='api_register'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/create-engineer/', create_engineer, name='create-engineer'),
    path('api/requests/available-dates/', ServiceRequestViewSet.as_view({'get': 'available_dates'}), name='available-dates'),
]