from rest_framework import serializers
from .models import ChatRoom, Message,Annotation 
from .models import AnnotatedImage

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
        fields = ['id', 'chatroom', 'user','geometry', 'text', 'created_at']
        read_only_fields = ['id', 'created_at']

        def create(self, validated_data):
        # Ensure 'is_temp' is set to False when creating
            validated_data['is_temp'] = False
            return super().create(validated_data)



class AnnotatedImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnnotatedImage
        fields = ['id', 'chatroom', 'user', 'image', 'created_at']
        read_only_fields = ['id', 'created_at']