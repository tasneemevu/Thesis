# Generated by Django 5.0.7 on 2024-08-17 17:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('chat', '0005_chatroom_user1_language_chatroom_user2_language'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='translated_content',
            field=models.TextField(default=''),
            preserve_default=False,
        ),
    ]
