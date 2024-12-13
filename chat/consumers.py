    
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
import openai
from google.oauth2 import service_account
import tempfile

# Set up OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

# Set Google Translate API credentials
# os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "./coastal-idea-435113-d0-aa8b6c590c5e.json"

def get_credentials(service_account_file):
    credentials = service_account.Credentials.from_service_account_file(
        service_account_file,
        scopes=['https://www.googleapis.com/auth/cloud-platform']
    )
    return credentials

class ChatConsumer(AsyncWebsocketConsumer):
    # def translate_message(self, message, target_language):
    #     service_account_file = "./coastal-idea-435113-d0-aa8b6c590c5e.json"
        
    #     # Get credentials
    #     credentials = get_credentials(service_account_file)
        
    #     # Initialize the translation client with the credentials
    #     translate_client = translate.Client(credentials=credentials)
        
    #     result = translate_client.translate(message, target_language=target_language)
    #     return result['translatedText']
    def translate_message(self, message, target_language):
        # Load credentials from the environment variable
        credentials_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
        if not credentials_json:
            raise ValueError("Environment variable GOOGLE_APPLICATION_CREDENTIALS_JSON is not set")

        # Convert the JSON string to a dictionary
        credentials_dict = json.loads(credentials_json)

        # Create a temporary file for credentials
        with tempfile.NamedTemporaryFile(delete=False, suffix=".json", mode="w") as temp_file:
            credentials_file = temp_file.name
            json.dump(credentials_dict, temp_file)

        try:
            # Initialize the translation client
            translate_client = translate.Client.from_service_account_json(credentials_file)

            # Perform the translation
            result = translate_client.translate(message, target_language=target_language)
            return result["translatedText"]
        finally:
            # Clean up the temporary file
            os.remove(credentials_file)
    
    
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
        print(f"Received WebSocket data: {text_data}")
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
            # Fetch the latest task
            task = await sync_to_async(lambda: Task.objects.last())()
            if not task:
                print("No task found. Cannot proceed with ChatGPT response.")
                return  # Exit the function since no task is available

            # Translate and save the user's message
            target_language1 = chatroom.user2_language
            translated_message1 = await sync_to_async(self.translate_message)(message, target_language1)
            print(f"Translated message: {translated_message1}")
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
            print("Sent message to group:", self.room_group_name)

            # Now process ChatGPT's response based on the user's message
            gpt_response = await sync_to_async(self.get_gpt_response)(translated_message1, task.description, task.image)
            print(f"GPT response: {gpt_response}")

            # Translate ChatGPT's response to user1's language
            target_language2 = chatroom.user1_language
            translated_response2 = await sync_to_async(self.translate_message)(gpt_response, target_language2)

            # Save ChatGPT's original and translated response
            await sync_to_async(Message.objects.create)(
                user=user2,  # ChatGPT is responding
                chatroom=chatroom,
                content=gpt_response,  # Original ChatGPT response in English
                translated_content=translated_response2  # Translated response in user1's language
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
        Task: You are assisting a user with three types of annotations of a image. So there will be three task.
        Task Image URL: {image}
        Task Description: {task_description}
        Your job is to answer the user's questions about those three tasks and guide them.
        The image is a basket of fruits. The task 1 is to find and mark the Banana of the basket.
        The task 2 is to find and mark all the red fruits on the basket. The task 3 is to find and mark the strawberry on the basket.
        After completing Task 3, there is not any task to do. If user ask you about the task 4, you should tell them that there is no task 4 and please do not tell user about the previous tasks.
        After Task 3, you should tell the user that the task is completed.
        You should respond intelligently and with wit when guiding the user. Please guide them with three maximum sentences each time they ask for help. Because the user should not know you are an AI. Please do not introduce yourself that you are AI. 
        Write the chat in a way that the user thinks you are a human. Take time to type sentence before sending it to the user. Do not write very long sentence within some seconds, because
         that can give the user clear peception that you are AI. Write short sentences. Take time to write sentences.  
        If the user asks you to do something that is not related to the task, reply with a polite message and ask them to ask a question about the task.
        Guide them step by step. Because user will ask you about the task 1,2 and 3 one after another. If you are confused on which task they are asking you about, ask them to repeat the task number.
        Then tell them what they need to do. The marking is to place the cursor on the fruit and make a rectangle around the fruit. 
        If the user asks you about the colour of a specific fruit, tell them that it can be any colour. If the user asks you about the size of a specific fruit, tell them that it can be any size.
        You are ChatGpt4, please also try to read the image, which is attached to the chat. If you understand the image, you can use the information in the image to answer the user's question.
        User's Question: {user_question}
        """

        # Call GPT-4 API with the task context and user's question
        try:
            response = openai.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": task_context},
                    {"role": "user", "content": user_question}
                ]
            )
            print(f"User Question: {user_question}")
            print(f"Task Context: {task_context}")

            print("OpenAI Response:", response)  # Log the response for debugging
            return response.choices[0].message.content
        except Exception as e:
                print(f"OpenAI API Error: {e}")
                return "Error communicating with ChatGPT."

    async def chat_message(self, event):
        print(f"Chat message event received: {event}") 
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
