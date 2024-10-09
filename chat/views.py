# #updatedChatgpt

# import openai
# from django.shortcuts import get_object_or_404
# from django.http import JsonResponse
# from django.contrib.auth.models import User
# from .models import ChatRoom
# from django.conf import settings
# from django.utils import timezone
# from datetime import timedelta
# from django.db import transaction
# # Initialize the OpenAI API
# openai.api_key =settings.OPENAI_API_KEY


# def assign_chatroom(request):
#     if request.method == 'GET':
#         selected_language = request.GET.get('language')
        
#         user = None  # Initialize user variable

#         with transaction.atomic():  # Ensure atomicity to avoid race conditions
#             available_room = ChatRoom.objects.select_for_update().filter(user2=None).first()

#             if available_room:
#                 wait_time = timezone.now() - available_room.created_at
#                 if wait_time <= timedelta(minutes=2):
#                     username = f"user_{available_room.id}_2"
#                     user = User.objects.create(username=username)
#                     available_room.user2 = user
#                     available_room.user2_language = selected_language  # Store language for user2
#                     available_room.save()
#                     message = "You have been connected to another user."
#                 else:
#                     unique_chatgpt_id = f"UserC_{available_room.id}"
#                     user = User.objects.create(username=unique_chatgpt_id)
#                     available_room.user2 = user
#                     available_room.user2_language = selected_language  # Store language for ChatGPT
#                     available_room.save()
#                     message = "You have been connected to ChatGPT. Start your conversation."
#             else:
#                 chatroom = ChatRoom.objects.create()
#                 username = f"user_{chatroom.id}_1"
#                 user = User.objects.create(username=username)
#                 chatroom.user1 = user
#                 chatroom.user1_language = selected_language  # Store language for user1
#                 chatroom.save()
#                 message = "Please wait for another person to join the chatroom."

#         return JsonResponse({
#             'chatroom_id': available_room.id if available_room else chatroom.id,
#             'user_id': user.id,
#             'username': user.username,
#             'message': message
#         })

#     return JsonResponse({'error': 'Invalid request method'}, status=400)
#logic
import openai
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.contrib.auth.models import User
from .models import ChatRoom, Annotation
from django.conf import settings
from django.utils import timezone
from datetime import timedelta
from django.db import transaction
from rest_framework import generics, permissions
from .serializers import AnnotationSerializer
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import ValidationError  # Imported directly
from rest_framework.views import APIView




# Initialize the OpenAI API
openai.api_key = settings.OPENAI_API_KEY

def assign_chatroom(request):
    if request.method == 'GET':
        selected_language = request.GET.get('language')
        user = None  # Initialize user variable
        
        # Get the count of human-to-human and human-to-ChatGPT chatrooms
        human2human_count = ChatRoom.objects.filter(user2__isnull=False, user2__username__startswith="user_").count()
        chatgpt_count = ChatRoom.objects.filter(user2__username__startswith="UserC_").count()

        with transaction.atomic():  # Ensure atomicity to avoid race conditions
            # Check if there is any available room with only one user (waiting for another)
            available_room = ChatRoom.objects.select_for_update().filter(user2=None).first()

            if available_room:
                wait_time = timezone.now() - available_room.created_at
                
                # If there's a user waiting and within 2 minutes, connect the second user
                if wait_time <= timedelta(minutes=2):
                    username = f"user_{available_room.id}_2"
                    user = User.objects.create(username=username)
                    available_room.user2 = user
                    available_room.user2_language = selected_language  # Store language for user2
                    available_room.save()
                    message = "You have been connected to another user."
                else:
                    # The waiting time exceeds 2 minutes, connect to ChatGPT
                    unique_chatgpt_id = f"UserC_{available_room.id}"
                    user = User.objects.create(username=unique_chatgpt_id)
                    available_room.user2 = user
                    available_room.user2_language = selected_language  # Store language for ChatGPT
                    available_room.chat_completed = True  # Mark the chatroom as completed
                    available_room.save()
                    message = "You have been connected to ChatGPT. Start your conversation."

            else:
                # No available rooms; create a new room
                chatroom = ChatRoom.objects.create()
                username = f"user_{chatroom.id}_1"
                user = User.objects.create(username=username)
                chatroom.user1 = user
                chatroom.user1_language = selected_language  # Store language for user1
                chatroom.save()

                # Check if human2human connections are greater than chatgpt connections
                if human2human_count > chatgpt_count:
                    unique_chatgpt_id = f"UserC_{chatroom.id}"
                    user = User.objects.create(username=unique_chatgpt_id)
                    chatroom.user2 = user
                    chatroom.user2_language = selected_language  # Store language for ChatGPT
                    chatroom.chat_completed = True  # Mark the chatroom as completed
                    chatroom.save()
                    message = "You have been connected to ChatGPT. Start your conversation."
                else:
                    message = "Please wait for another person to join the chatroom."

        return JsonResponse({
            'chatroom_id': available_room.id if available_room else chatroom.id,
            'user_id': user.id,
            'username': user.username,
            'message': message
        })

    return JsonResponse({'error': 'Invalid request method'}, status=400)

def leave_chatroom(request):
    if request.method == 'POST':
        user_id = request.POST.get('user_id')
        chatroom_id = request.POST.get('chatroom_id')

        user = get_object_or_404(User, id=user_id)
        chatroom = get_object_or_404(ChatRoom, id=chatroom_id)

        if chatroom.user1 == user:
            chatroom.user1 = None
        elif chatroom.user2 == user:
            chatroom.user2 = None
        chatroom.save()

        if chatroom.user1 is None and chatroom.user2 is None:
            chatroom.delete()

        user.delete()
        return JsonResponse({'status': 'left'})
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)

#annotation



class AnnotationListCreateView(generics.ListCreateAPIView):
    serializer_class = AnnotationSerializer
    permission_classes = [permissions.AllowAny]  # Allow any access, since you're not using authentication
    queryset = Annotation.objects.all()

    def get_queryset(self):
        chatroom_id = self.request.query_params.get('chatroom_id')
        return Annotation.objects.filter(chatroom__id=chatroom_id, is_temp=False)  # Only return confirmed annotations

    def perform_create(self, serializer):
        user_id = self.request.data.get('user')
        chatroom_id = self.request.data.get('chatroom')
        text = self.request.data.get('text')
        geometry = self.request.data.get('geometry')  # Ensure geometry is captured

        try:
            user = User.objects.get(id=user_id)
            chatroom = ChatRoom.objects.get(id=chatroom_id)
        except User.DoesNotExist:
            raise ValidationError({'error': 'User not found.'})  # Use ValidationError directly
        except ChatRoom.DoesNotExist:
            raise ValidationError({'error': 'ChatRoom not found.'})

        # Log the annotation details
        print(f"Creating annotation: User ID: {user_id}, Chatroom ID: {chatroom_id}, Text: {text}")

        # Save the annotation using the serializer
        serializer.save(user=user, chatroom=chatroom, is_temp=False)


class SubmitAnnotationView(APIView):
    def post(self, request):
        chatroom_id = request.data.get('chatroom_id')
        user_id = request.data.get('user_id')  # Get the user_id from the request

        try:
            user = User.objects.get(id=user_id)  # Fetch the user based on user_id
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Get the temporary annotation for the user and chatroom
            annotation = Annotation.objects.get(chatroom_id=chatroom_id, user=user, is_temp=True)
            annotation.is_temp = False  # Mark as submitted
            annotation.save()
            return Response({'status': 'Annotation submitted successfully'}, status=status.HTTP_200_OK)
        except Annotation.DoesNotExist:
            return Response({'error': 'No temporary annotation found'}, status=status.HTTP_404_NOT_FOUND)


class ClearAnnotationView(APIView):
    def post(self, request):
        chatroom_id = request.data.get('chatroom_id')
        user_id = request.data.get('user_id')  # Get the user_id from the request

        try:
            user = User.objects.get(id=user_id)  # Fetch the user based on user_id
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            # Get the temporary annotation for the user and chatroom
            annotation = Annotation.objects.get(chatroom_id=chatroom_id, user=user, is_temp=True)
            annotation.delete()  # Clear the annotation
            return Response({'status': 'Temporary annotation cleared'}, status=status.HTTP_200_OK)
        except Annotation.DoesNotExist:
            return Response({'error': 'No temporary annotation found'}, status=status.HTTP_404_NOT_FOUND)