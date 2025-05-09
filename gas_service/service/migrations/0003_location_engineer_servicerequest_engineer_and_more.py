# Generated by Django 4.2.7 on 2025-04-25 19:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('service', '0002_remove_servicerequest_customer_name_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Location',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Название локации')),
                ('address', models.TextField(verbose_name='Адрес')),
                ('city', models.CharField(max_length=50, verbose_name='Город')),
            ],
            options={
                'verbose_name': 'Локация',
                'verbose_name_plural': 'Локации',
            },
        ),
        migrations.CreateModel(
            name='Engineer',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('full_name', models.CharField(max_length=100, verbose_name='ФИО инженера')),
                ('phone', models.CharField(max_length=15, verbose_name='Телефон')),
                ('email', models.EmailField(max_length=254, verbose_name='Email')),
                ('is_available', models.BooleanField(default=True, verbose_name='Доступен')),
                ('location', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='service.location', verbose_name='Локация')),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='Пользователь')),
            ],
            options={
                'verbose_name': 'Инженер',
                'verbose_name_plural': 'Инженеры',
            },
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='engineer',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='service.engineer', verbose_name='Инженер'),
        ),
        migrations.AddField(
            model_name='servicerequest',
            name='location',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, to='service.location', verbose_name='Локация'),
        ),
    ]
