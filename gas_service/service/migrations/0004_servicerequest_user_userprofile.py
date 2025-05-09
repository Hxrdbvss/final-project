# Generated by Django 4.2.7 on 2025-04-25 20:00

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('service', '0003_location_engineer_servicerequest_engineer_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='servicerequest',
            name='user',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Клиент'),
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(blank=True, max_length=100, verbose_name='ФИО')),
                ('phone', models.CharField(blank=True, max_length=15, verbose_name='Телефон')),
                ('address', models.TextField(blank=True, verbose_name='Адрес')),
                ('location', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='service.location', verbose_name='Локация')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Профиль пользователя',
                'verbose_name_plural': 'Профили пользователей',
            },
        ),
    ]
