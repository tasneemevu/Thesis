from rest_framework import serializers
from .models import ChatRoom, Message,Annotation 

class ChatRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatRoom
        fields = ['id', 'name']

class MessageSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()

    class Meta:
        model = Message
        fields = ['id', 'user', 'chatroom', 'content', 'timestamp']

# chat/serializers.py


class AnnotationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Annotation
        fields = ['id', 'chatroom', 'user','geometry' 'text', 'created_at']
        read_only_fields = ['id', 'created_at']
