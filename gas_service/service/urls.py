from django.urls import path
from . import views

urlpatterns = [
    path('', views.create_request, name='create_request'),
    path('list/', views.request_list, name='request_list'),
    path('register/', views.register, name='register'),
    path('login/', views.user_login, name='login'),
    path('logout/', views.user_logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    
]