from rest_framework import serializers
from .models import Message, Conversation


class ConversationSerializer(serializers.ModelSerializer):
    participant_id = serializers.IntegerField(write_only=True, required=False)

    class Meta:
        model = Conversation
        fields = ['id','participants','created_at','participant_id']
        read_only_fields = ['participants','created_at']

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = '__all__'
        read_only_fields = ['sender']

