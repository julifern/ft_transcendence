from channels.generic.websocket import AsyncWebsocketConsumer
import json


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.id = self.scope['url_route']['kwargs']['id']
        print("WebSocket ID opened:", id)
        self.room_group_name = 'chat_' + self.id

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
        await self.send(text_data=json.dumps({
            "message": "Echoes..."
        }))
    
    async def disconnect(self, close_code):
        print("WebSocket ID closed")
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )