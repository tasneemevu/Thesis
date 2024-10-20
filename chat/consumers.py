    
#updatedchatgpt
# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# from .models import ChatRoom, Message, Task
# from django.contrib.auth.models import User
# from asgiref.sync import sync_to_async
# from google.cloud import translate_v2 as translate
# import os
# import asyncio
# from openai import OpenAI

# # Set up OpenAI API key
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # Set Google Translate API credentials
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "D:/thesis/coastal-idea-435113-d0-aa8b6c590c5e.json"

# class ChatConsumer(AsyncWebsocketConsumer):
#     def translate_message(self, message, target_language):
#         translate_client = translate.Client()
#         result = translate_client.translate(message, target_language=target_language)
#         return result['translatedText']
    
#     async def connect(self):
#         self.room_id = self.scope['url_route']['kwargs']['room_id']
#         self.room_group_name = f'chat_{self.room_id}'

#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#         chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
#         user2 = await sync_to_async(lambda: chatroom.user2)()

#         if user2 is None:
       
#             self.waiting_task = asyncio.create_task(self.wait_for_user2(chatroom))
#         else:
         
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'user_joined',
#                     'message': 'A second user has joined the chat. Start your conversation.',
#                     'user2_joined': True
#                 }
#             )

#     async def wait_for_user2(self, chatroom):
#         try:
#             await asyncio.sleep(120)
#             chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
#             user2 = await sync_to_async(lambda: chatroom.user2)()

#             if user2 is None:
#                 unique_chatgpt_id = f"UserC_{chatroom.id}"
#                 user_c, created = await sync_to_async(User.objects.get_or_create)(username=unique_chatgpt_id)
#                 chatroom.user2 = user_c
#                 await sync_to_async(chatroom.save)()

#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'user_joined',
#                         'message': f'{unique_chatgpt_id} has joined the chat.',
#                         'user2_joined': True
#                     }
#                 )
#         except asyncio.CancelledError:
#             # If the waiting task is cancelled, just return
#             return

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data['message']
#         username = data['username']

#         # Fetch the user and chatroom from the database
#         user = await sync_to_async(User.objects.get)(username=username)
#         chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)

#         # Get the second user in the chatroom
#         user2 = await sync_to_async(lambda: chatroom.user2)()

#         # Check if the second user is ChatGPT (UserC)
#         if user2.username.startswith("UserC_"):
#             # Handle task-related questions or instructions
#             task = await sync_to_async(lambda: Task.objects.last())()

#             if task:
#                 # Translate and save the user's message
#                 target_language1 = chatroom.user2_language
#                 translated_message1 = await sync_to_async(self.translate_message)(message, target_language1)
#                 await sync_to_async(Message.objects.create)(user=user, chatroom=chatroom, content=message, translated_content=translated_message1)

#                 # Send the user's translated message to the chatroom immediately
#                 await self.send(text_data=json.dumps({
#                     'message': message,
#                     'username': username
#                 }))
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'chat_message',
#                         'message': translated_message1,  # User's translated message
#                         'username': username,
#                         'sender': self.channel_name,
#                     }
#                 )

#                 # Now process ChatGPT's response based on the user's message
#                 gpt_response = await sync_to_async(self.get_gpt_response)(translated_message1, task.description, task.image)

#                 # Translate ChatGPT's response to user1's language
#                 target_language2 = chatroom.user1_language
#                 translated_response2 = await sync_to_async(self.translate_message)(gpt_response, target_language2)

#                 # Save ChatGPT's original and translated response
#                 await sync_to_async(Message.objects.create)(
#                     user=user2,  # ChatGPT is responding
#                     chatroom=chatroom,
#                     content=gpt_response,  # Original ChatGPT response in English
#                     translated_content=translated_response2 # Translated response in user1's language
#                 )

#                 # Send ChatGPT's translated response to the chatroom
#                 await self.send(text_data=json.dumps({
#                     'message': translated_response2,
#                     'username': 'UserC'
#                 }))
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'chat_message',
#                         'message': translated_response2,  # Translated GPT response
#                         'username': 'UserC',
#                         'sender': self.channel_name,
#                     }
#                 )
#         else:
#             # Handle user-to-user chat
#             if await sync_to_async(lambda: chatroom.user1 == user)():
#                 target_language = await sync_to_async(lambda: chatroom.user2_language)()
#             else:
#                 target_language = await sync_to_async(lambda: chatroom.user1_language)()

#             translated_message = await sync_to_async(self.translate_message)(message, target_language)

#             # Save both original and translated messages
#             await sync_to_async(Message.objects.create)(user=user, chatroom=chatroom, content=message, translated_content=translated_message)

#             # Send translated message to the chat room
#             await self.send(text_data=json.dumps({
#                 'message': message,
#                 'username': username,
#             }))

#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': translated_message,
#                     'username': username,
#                     'sender': self.channel_name
#                 }
#             )

#     def get_gpt_response(self, user_question, task_description, image):
#         task_context = f"""
#         Task: You are assisting a user with a specific task.
#         Task Image URL: {image}
#         Task Description: {task_description}
#         Your job is to answer the user's questions about the task and guide them.

#         The task is to find and mark the black grapes on the very right side of the basket.
#         You should respond intelligently and with wit when guiding the user.

#         User's Question: {user_question}
#         """

#         # Call GPT-4 API with the task context and user's question
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": task_context},
#                 {"role": "user", "content": user_question}
#             ]
#         )

#         return response.choices[0].message.content

    

 

#     async def chat_message(self, event):
#         message = event['message']
#         username = event['username']
#         sender = event['sender']

#         if self.channel_name != sender:
#             await self.send(text_data=json.dumps({
#                 'message': message,
#                 'username': username,
#             }))


#     async def user_joined(self, event):
#         message = event['message']
#         user2_joined = event['user2_joined']

#         # Cancel the waiting task if the second user joins before the 2 minutes
#         if hasattr(self, 'waiting_task'):
#             self.waiting_task.cancel()

#         await self.send(text_data=json.dumps({
#             'message': message,
#             'user2_joined': user2_joined,
#         }))


#     async def user_left(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'message': message,
#             'user2_left': True,
#         }))


# from channels.generic.websocket import AsyncWebsocketConsumer
# import json
# from .models import ChatRoom, Message, Task
# from django.contrib.auth.models import User
# from asgiref.sync import sync_to_async
# from google.cloud import translate_v2 as translate
# import os
# import asyncio
# from openai import OpenAI

# # Set up OpenAI API key
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# # Set Google Translate API credentials
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "D:/thesis/coastal-idea-435113-d0-aa8b6c590c5e.json"

# class ChatConsumer(AsyncWebsocketConsumer):
#     def translate_message(self, message, target_language):
#         translate_client = translate.Client()
#         result = translate_client.translate(message, target_language=target_language)
#         return result['translatedText']
    
#     async def connect(self):
#         self.room_id = self.scope['url_route']['kwargs']['room_id']
#         self.room_group_name = f'chat_{self.room_id}'

#         await self.channel_layer.group_add(self.room_group_name, self.channel_name)
#         await self.accept()

#         chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
#         user2 = await sync_to_async(lambda: chatroom.user2)()

#         if user2 is None:
#             # The connecting user is the first user
#             self.role = 'first'
#             # Optionally, start waiting for the second user
#             self.waiting_task = asyncio.create_task(self.wait_for_user2(chatroom))
#             # Send role message to the first user
#             await self.send(text_data=json.dumps({
#                 'type': 'role',
#                 'role': 'first'
#             }))
#         else:
#             # The connecting user is the second user
#             self.role = 'second'
#             # Send role message to the second user
#             await self.send(text_data=json.dumps({
#                 'type': 'role',
#                 'role': 'second'
#             }))
#             # Notify the group that a second user has joined
#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'user_joined',
#                     'message': 'A second user has joined the chat.',
#                     'user2_joined': True
#                 }
#             )

#     async def wait_for_user2(self, chatroom):
#         try:
#             await asyncio.sleep(120)  # Wait for 2 minutes
#             chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
#             user2 = await sync_to_async(lambda: chatroom.user2)()

#             if user2 is None:
#                 unique_chatgpt_id = f"UserC_{chatroom.id}"
#                 user_c, created = await sync_to_async(User.objects.get_or_create)(username=unique_chatgpt_id)
#                 chatroom.user2 = user_c
#                 await sync_to_async(chatroom.save)()

#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'user_joined',
#                         'message': f'{unique_chatgpt_id} has joined the chat.',
#                         'user2_joined': True
#                     }
#                 )
#         except asyncio.CancelledError:
#             # If the waiting task is cancelled, just return
#             return

#     async def receive(self, text_data):
#         data = json.loads(text_data)
#         message = data['message']
#         username = data['username']

#         # Fetch the user and chatroom from the database
#         user = await sync_to_async(User.objects.get)(username=username)
#         chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)

#         # Get the second user in the chatroom
#         user2 = await sync_to_async(lambda: chatroom.user2)()

#         # Check if the second user is ChatGPT (UserC)
#         if user2.username.startswith("UserC_"):
#             # Handle task-related questions or instructions
#             task = await sync_to_async(lambda: Task.objects.last())()

#             if task:
#                 # Translate and save the user's message
#                 target_language1 = chatroom.user2_language
#                 translated_message1 = await sync_to_async(self.translate_message)(message, target_language1)
#                 await sync_to_async(Message.objects.create)(user=user, chatroom=chatroom, content=message, translated_content=translated_message1)

#                 # Send the user's translated message to the chatroom immediately
#                 await self.send(text_data=json.dumps({
#                     'type': 'chat',
#                     'message': message,
#                     'username': username
#                 }))
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'chat_message',
#                         'message': translated_message1,  # User's translated message
#                         'username': username,
#                         'sender': self.channel_name,
#                     }
#                 )

#                 # Now process ChatGPT's response based on the user's message
#                 gpt_response = await sync_to_async(self.get_gpt_response)(translated_message1, task.description, task.image)

#                 # Translate ChatGPT's response to user1's language
#                 target_language2 = chatroom.user1_language
#                 translated_response2 = await sync_to_async(self.translate_message)(gpt_response, target_language2)

#                 # Save ChatGPT's original and translated response
#                 await sync_to_async(Message.objects.create)(
#                     user=user2,  # ChatGPT is responding
#                     chatroom=chatroom,
#                     content=gpt_response,  # Original ChatGPT response in English
#                     translated_content=translated_response2 # Translated response in user1's language
#                 )

#                 # Send ChatGPT's translated response to the chatroom
#                 await self.send(text_data=json.dumps({
#                     'type': 'chat',
#                     'message': translated_response2,
#                     'username': 'UserC'
#                 }))
#                 await self.channel_layer.group_send(
#                     self.room_group_name,
#                     {
#                         'type': 'chat_message',
#                         'message': translated_response2,  # Translated GPT response
#                         'username': 'UserC',
#                         'sender': self.channel_name,
#                     }
#                 )
#         else:
#             # Handle user-to-user chat
#             if await sync_to_async(lambda: chatroom.user1 == user)():
#                 target_language = await sync_to_async(lambda: chatroom.user2_language)()
#             else:
#                 target_language = await sync_to_async(lambda: chatroom.user1_language)()

#             translated_message = await sync_to_async(self.translate_message)(message, target_language)

#             # Save both original and translated messages
#             await sync_to_async(Message.objects.create)(user=user, chatroom=chatroom, content=message, translated_content=translated_message)

#             # Send translated message to the chat room
#             await self.send(text_data=json.dumps({
#                 'type': 'chat',
#                 'message': message,
#                 'username': username,
#             }))

#             await self.channel_layer.group_send(
#                 self.room_group_name,
#                 {
#                     'type': 'chat_message',
#                     'message': translated_message,
#                     'username': username,
#                     'sender': self.channel_name
#                 }
#             )

#     def get_gpt_response(self, user_question, task_description, image):
#         task_context = f"""
#         Task: You are assisting a user with a specific task.
#         Task Image URL: {image}
#         Task Description: {task_description}
#         Your job is to answer the user's questions about the task and guide them.

#         The task is to find and mark the black grapes on the very right side of the basket.
#         You should respond intelligently and with wit when guiding the user. Please guide them with short sentences. Because the user should not know you are an AI.

#         User's Question: {user_question}
#         """

#         # Call GPT-4 API with the task context and user's question
#         response = client.chat.completions.create(
#             model="gpt-4",
#             messages=[
#                 {"role": "system", "content": task_context},
#                 {"role": "user", "content": user_question}
#             ]
#         )

#         return response.choices[0].message.content

#     async def chat_message(self, event):
#         message = event['message']
#         username = event['username']
#         sender = event['sender']

#         if self.channel_name != sender:
#             await self.send(text_data=json.dumps({
#                 'type': 'chat',
#                 'message': message,
#                 'username': username,
#             }))

#     async def user_joined(self, event):
#         message = event['message']
#         user2_joined = event.get('user2_joined', False)

#         # Cancel the waiting task if the second user joins before the 2 minutes
#         if hasattr(self, 'waiting_task') and not self.waiting_task.cancelled():
#             self.waiting_task.cancel()

#         await self.send(text_data=json.dumps({
#             'type': 'user_joined',
#             'message': message,
#             'user2_joined': user2_joined,
#         }))

#     async def user_left(self, event):
#         message = event['message']

#         await self.send(text_data=json.dumps({
#             'type': 'user_left',
#             'message': message,
#             'user2_left': True,
#         }))


#chatgpt_logic
from channels.generic.websocket import AsyncWebsocketConsumer
import json
from .models import ChatRoom, Message, Task
from django.contrib.auth.models import User
from asgiref.sync import sync_to_async
from google.cloud import translate_v2 as translate
import os
import asyncio
from openai import OpenAI

# Set up OpenAI API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# Set Google Translate API credentials
os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "D:/thesis/coastal-idea-435113-d0-aa8b6c590c5e.json"

class ChatConsumer(AsyncWebsocketConsumer):
    def translate_message(self, message, target_language):
        translate_client = translate.Client()
        result = translate_client.translate(message, target_language=target_language)
        return result['translatedText']
    
    async def connect(self):
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.room_group_name = f'chat_{self.room_id}'

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
        user2 = await sync_to_async(lambda: chatroom.user2)()

        if user2 is None:
            # The connecting user is the first user
            self.role = 'first'
            # Optionally, start waiting for the second user
            self.waiting_task = asyncio.create_task(self.wait_for_user2(chatroom))
            # Send role message to the first user
            await self.send(text_data=json.dumps({
                'type': 'role',
                'role': 'first',
                'isChatGPT': False  # Initially False
            }))
        else:
            # The connecting user is the second user
            self.role = 'second'
            is_chatgpt = user2.username.startswith("UserC_")
            # Send role message to the second user with isChatGPT flag
            await self.send(text_data=json.dumps({
                'type': 'role',
                'role': 'second',
                'isChatGPT': is_chatgpt
            }))
            # Notify the group that a second user has joined
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'user_joined',
                    'message': 'A second user has joined the chat.',
                    'user2_joined': True,
                    'isChatGPT': is_chatgpt  # Include isChatGPT flag
                }
            )

    async def wait_for_user2(self, chatroom):
        try:
            await asyncio.sleep(120)  # Wait for 2 minutes
            chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)
            user2 = await sync_to_async(lambda: chatroom.user2)()

            if user2 is None:
                unique_chatgpt_id = f"UserC_{chatroom.id}"
                user_c, created = await sync_to_async(User.objects.get_or_create)(username=unique_chatgpt_id)
                chatroom.user2 = user_c
                await sync_to_async(chatroom.save)()

                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'user_joined',
                        'message': f'{unique_chatgpt_id} has joined the chat.',
                        'user2_joined': True,
                        'isChatGPT': True  # Indicate that ChatGPT has joined
                    }
                )
        except asyncio.CancelledError:
            # If the waiting task is cancelled, just return
            return

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data['message']
        username = data['username']

        # Fetch the user and chatroom from the database
        user = await sync_to_async(User.objects.get)(username=username)
        chatroom = await sync_to_async(ChatRoom.objects.get)(id=self.room_id)

        # Get the second user in the chatroom
        user2 = await sync_to_async(lambda: chatroom.user2)()

        # Check if the second user is ChatGPT (UserC)
        if user2.username.startswith("UserC_"):
            # Handle task-related questions or instructions
            task = await sync_to_async(lambda: Task.objects.last())()

            if task:
                # Translate and save the user's message
                target_language1 = chatroom.user2_language
                translated_message1 = await sync_to_async(self.translate_message)(message, target_language1)
                await sync_to_async(Message.objects.create)(user=user, chatroom=chatroom, content=message, translated_content=translated_message1)

                # Send the user's translated message to the chatroom immediately
                await self.send(text_data=json.dumps({
                    'type': 'chat',
                    'message': message,
                    'username': username
                }))
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': translated_message1,  # User's translated message
                        'username': username,
                        'sender': self.channel_name,
                    }
                )

                # Now process ChatGPT's response based on the user's message
                gpt_response = await sync_to_async(self.get_gpt_response)(translated_message1, task.description, task.image)

                # Translate ChatGPT's response to user1's language
                target_language2 = chatroom.user1_language
                translated_response2 = await sync_to_async(self.translate_message)(gpt_response, target_language2)

                # Save ChatGPT's original and translated response
                await sync_to_async(Message.objects.create)(
                    user=user2,  # ChatGPT is responding
                    chatroom=chatroom,
                    content=gpt_response,  # Original ChatGPT response in English
                    translated_content=translated_response2 # Translated response in user1's language
                )

                # Send ChatGPT's translated response to the chatroom
                await self.send(text_data=json.dumps({
                    'type': 'chat',
                    'message': translated_response2,
                    'username': 'UserC'
                }))
                await self.channel_layer.group_send(
                    self.room_group_name,
                    {
                        'type': 'chat_message',
                        'message': translated_response2,  # Translated GPT response
                        'username': 'UserC',
                        'sender': self.channel_name,
                    }
                )
        else:
            # Handle user-to-user chat
            if await sync_to_async(lambda: chatroom.user1 == user)():
                target_language = await sync_to_async(lambda: chatroom.user2_language)()
            else:
                target_language = await sync_to_async(lambda: chatroom.user1_language)()

            translated_message = await sync_to_async(self.translate_message)(message, target_language)

            # Save both original and translated messages
            await sync_to_async(Message.objects.create)(user=user, chatroom=chatroom, content=message, translated_content=translated_message)

            # Send translated message to the chat room
            await self.send(text_data=json.dumps({
                'type': 'chat',
                'message': message,
                'username': username,
            }))

            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': translated_message,
                    'username': username,
                    'sender': self.channel_name
                }
            )

    def get_gpt_response(self, user_question, task_description, image):
        task_context = f"""
        Task: You are assisting a user with a specific task.
        Task Image URL: {image}
        Task Description: {task_description}
        Your job is to answer the user's questions about the task and guide them.

        The task is to find and mark the black grapes on the very right side of the basket.
        You should respond intelligently and with wit when guiding the user. Please guide them with short sentences. Because the user should not know you are an AI.

        User's Question: {user_question}
        """

        # Call GPT-4 API with the task context and user's question
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": task_context},
                {"role": "user", "content": user_question}
            ]
        )

        return response.choices[0].message.content

    async def chat_message(self, event):
        message = event['message']
        username = event['username']
        sender = event['sender']

        if self.channel_name != sender:
            await self.send(text_data=json.dumps({
                'type': 'chat',
                'message': message,
                'username': username,
            }))

    async def user_joined(self, event):
        message = event['message']
        user2_joined = event.get('user2_joined', False)
        is_chatgpt = event.get('isChatGPT', False)  # Retrieve isChatGPT flag

        # Cancel the waiting task if the second user joins before the 2 minutes
        if hasattr(self, 'waiting_task') and not self.waiting_task.cancelled():
            self.waiting_task.cancel()

        await self.send(text_data=json.dumps({
            'type': 'user_joined',
            'message': message,
            'user2_joined': user2_joined,
            'isChatGPT': is_chatgpt  # Include isChatGPT flag
        }))

    async def user_left(self, event):
        message = event['message']

        await self.send(text_data=json.dumps({
            'type': 'user_left',
            'message': message,
            'user2_left': True,
        }))
