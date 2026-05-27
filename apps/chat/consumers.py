import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):

    async def connect(self):
        self.room_id = self.scope["url_route"]["kwargs"]["room_id"]
        self.room_group_name = f"chat_{self.room_id}"
        self.user = self.scope["user"]

        if not self.user.is_authenticated:
            await self.close()
            return

        
        await self.set_online(True)

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "username": self.user.username,
                "is_online": True,
            }
        )

        await self.accept()

    async def disconnect(self, close_code):
       
        await self.set_online(False)

        
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "user_status",
                "username": self.user.username,
                "is_online": False,
            }
        )

        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message = data.get("message", "")
        user = self.scope["user"]
        username = user.username if user.is_authenticated else "Anonymous"

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message,
                "username": username,
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "message",
            "message": event["message"],
            "username": event["username"],
        }))

    
    async def user_status(self, event):
        await self.send(text_data=json.dumps({
            "type": "status",
            "username": event["username"],
            "is_online": event["is_online"],
        }))

    @database_sync_to_async
    def set_online(self, status):
        from .models import UserStatus
        UserStatus.objects.update_or_create(
            user=self.user,
            defaults={"is_online": status}
        )