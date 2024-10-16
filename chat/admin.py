from django.contrib import admin
from .models import ChatRoom,  Annotation, AnnotatedImage
from .models import Task

admin.site.register(ChatRoom)
admin.site.register(Annotation)
admin.site.register(AnnotatedImage)

# Register your models here

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('description', 'created_at')

