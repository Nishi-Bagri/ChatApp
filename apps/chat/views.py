from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User
from rest_framework.response import Response



class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)
    
    def perform_create(self,serializer):

        current_user = self.request.user
        other_user_id = serializer.validated_data.pop('participant_id', None)

        if other_user_id is None:
            raise ValidationError("participant_id is required")

        if int(other_user_id) == current_user.id:
            raise ValidationError("You cannot chat with yourself")
            
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            raise ValidationError("User not found")
        
        existing = Conversation.objects.filter(participants=current_user).filter(participants=other_user).distinct().first()


        if existing:
            serializer.instance = existing
            return
        
        conversation = serializer.save()

        conversation.participants.add(current_user, other_user)


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]
    
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        conversation_id = self.request.query_params.get("conversation_id")

        queryset = Message.objects.filter(conversation__participants=self.request.user)

        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)

        return queryset.order_by("timestamp")

    def perform_create(self, serializer):
        current_user = self.request.user

        conversation_id = self.request.data.get("conversation_id")

        if not conversation_id:
            raise ValidationError("conversation_id is required")
        
        try:
            conversation = Conversation.objects.get(
                id = conversation_id,
                participants = current_user
            )
        except Conversation.DoesNotExist:
            raise ValidationError("Invalid conversation")


        serializer.save(
            sender = current_user,
            conversation=conversation
        )
        

class UnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        count = Message.objects.filter(
            conversation__participants=request.user,
            is_read=False
        ).exclude(
            sender=request.user 
        ).count()

        return Response({"unread": count})