# chat/urls.py
from django.urls import path
from . import views
from .views import  AnnotationListCreateView, SubmitAnnotationView, ClearAnnotationView

urlpatterns = [
    path('assign-chatroom/', views.assign_chatroom, name='assign_chatroom'),
    path('leave-chatroom/', views.leave_chatroom, name='leave_chatroom'),
    path('api/annotations/', AnnotationListCreateView.as_view(), name='annotations'),
    path('api/annotations/submit/', SubmitAnnotationView.as_view(), name='submit_annotation'),
    path('api/annotations/clear/', ClearAnnotationView.as_view(), name='clear_annotation'),
]


