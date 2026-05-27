from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from urllib.parse import parse_qs

User = get_user_model()

class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):
        scope = dict(scope)
        scope["user"] = AnonymousUser()

        query_string = scope.get("query_string", b"").decode()
        params = parse_qs(query_string)

        token = params.get("token", [None])[0]

        if token:
            try:
                validated_token = AccessToken(token)
                user_id = validated_token["user_id"]

                user = await User.objects.aget(id=user_id)
                scope["user"] = user

                print("JWT USER LOADED:", user.username)

            except Exception as e:
                print("JWT ERROR:", str(e))

        return await super().__call__(scope, receive, send)