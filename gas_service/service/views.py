from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from .forms import ServiceRequestForm, UserRegisterForm, UserProfileForm
from .models import ServiceRequest, Engineer, UserProfile

def create_request(request):
    if request.method == 'POST':
        form = ServiceRequestForm(request.POST)
        if form.is_valid():
            service_request = form.save(commit=False)
            if request.user.is_authenticated:
                service_request.user = request.user
                profile = UserProfile.objects.filter(user=request.user).first()
                if profile:
                    service_request.full_name = profile.full_name
                    service_request.email = request.user.email
                    service_request.phone = profile.phone
                    service_request.address = profile.address
                    service_request.location = profile.location
            location = form.cleaned_data['location']
            available_engineer = Engineer.objects.filter(location=location, is_available=True).first()
            if available_engineer:
                service_request.engineer = available_engineer
            service_request.save()
            messages.success(request, 'Заявка успешно создана!')
            return redirect('request_list')
    else:
        form = ServiceRequestForm()
    return render(request, 'service/request_form.html', {'form': form})

def request_list(request):
    if request.user.is_authenticated:
        requests = ServiceRequest.objects.filter(user=request.user).order_by('-created_at')
    else:
        requests = ServiceRequest.objects.all().order_by('-created_at')
    return render(request, 'service/request_list.html', {'requests': requests})

def register(request):
    if request.method == 'POST':
        form = UserRegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            UserProfile.objects.create(user=user)
            username = form.cleaned_data.get('username')
            messages.success(request, f'Аккаунт создан для {username}! Теперь вы можете войти.')
            return redirect('login')
    else:
        form = UserRegisterForm()
    return render(request, 'service/register.html', {'form': form})

def user_login(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            messages.success(request, 'Вы успешно вошли!')
            return redirect('profile')
        else:
            messages.error(request, 'Неверное имя пользователя или пароль.')
    return render(request, 'service/login.html')

@login_required
def user_logout(request):
    logout(request)
    messages.success(request, 'Вы успешно вышли!')
    return redirect('create_request')

@login_required
def profile(request):
    profile, created = UserProfile.objects.get_or_create(user=request.user)
    if request.method == 'POST':
        form = UserProfileForm(request.POST, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, 'Профиль успешно обновлён!')
            return redirect('profile')
    else:
        form = UserProfileForm(instance=profile)
    requests = ServiceRequest.objects.filter(user=request.user).order_by('-created_at')
    return render(request, 'service/profile.html', {'form': form, 'requests': requests})