from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework.exceptions import ValidationError
from django.contrib.auth.models import User

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
        
        conversation = serializer.save()

        conversation.participants.add(current_user, other_user)


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes=[IsAuthenticated]
    
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        return Message.objects.filter(conversation__participants=self.request.user)

    def perform_create(self, serializer):
        current_user = self.request.user
        conversation = serializer.validated_data.get('conversation')

        if not conversation.participants.filter(id=current_user.id).exists():
            raise ValidationError("You are not part of this conversation")
        
        serializer.save(sender=current_user)