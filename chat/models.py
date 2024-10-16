#trans
from django.db import models
from django.contrib.auth.models import User

class ChatRoom(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    user1 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='chatroom_user1')
    user1_language = models.CharField(max_length=10, default='en')  # Store user1's language preference
    user2 = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='chatroom_user2')
    user2_language = models.CharField(max_length=10, default='en')  # Store user2's language preference
    task_state = models.CharField(max_length=20, default='start')

class Message(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()  # Original message content
    translated_content = models.TextField()  # Translated message content
    timestamp = models.DateTimeField(auto_now_add=True)


class Task(models.Model):
    description = models.TextField()
    image = models.ImageField(upload_to='images/') 
    created_at = models.DateTimeField(auto_now_add=True) # Replace the URL field with ImageField

    def __str__(self):
        return self.description
    
class Annotation(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    geometry = models.JSONField()
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_temp = models.BooleanField(default=True)  # Field to mark if the annotation is temporary

    def __str__(self):
        return f"Annotation {self.id} in ChatRoom {self.chatroom.id}"

class AnnotatedImage(models.Model):
    chatroom = models.ForeignKey(ChatRoom, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='annotated_images/')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Annotated Image {self.id} for Chatroom {self.chatroom.id}"