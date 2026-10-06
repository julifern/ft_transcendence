from channels.generic.websocket import AsyncWebsocketConsumer
# from channels.db import database_sync_to_async
# from .models import Message
import json
from django.utils import timezone


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']
        print("WebSocket ID opened:", self.id)
        self.room_group_name = 'chat_' + self.id

        print("USER: ", self.scope["user"])

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
    
    async def receive(self, text_data):
        data = json.loads(text_data)
        print(data)
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "message": data["message"]
            }
        )
    
    async def chat_message(self, event):
        # self.save_message()
        time = timezone.localtime(timezone.now())

        await self.send(text_data=json.dumps({
            "message": event["message"],
            "time": time.strftime('%H:%M'),
            "user": "emarrot",
        }))

    """
    @database_sync_to_async
    def save_message(self, text):
        Message.objects.create(
            text=text,
            user=self.scope["user"],
            group=self.id
        )
    """
    
    async def disconnect(self, close_code):
        print("WebSocket ID closed")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )