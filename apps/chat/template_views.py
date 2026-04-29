from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required

from .models import Conversation, Message


def chat_view(request):
    return render(request, "chat/chat.html")

# -----------------------------
# CHAT: CONVERSATION LIST PAGE
# -----------------------------
@login_required
def conversations_page(request):
    conversations = Conversation.objects.filter(
        participants=request.user
    ).prefetch_related("participants")

    return render(request, "chat/conversations.html", {
        "conversations": conversations
    })


# -----------------------------
# CHAT: MESSAGES PAGE
# -----------------------------
@login_required
def messages_page(request, id):
    conversation = get_object_or_404(
        Conversation,
        id=id,
        participants=request.user
    )

    messages = Message.objects.filter(
        conversation=conversation
    ).select_related("sender").order_by("created_at")

    return render(request, "chat/messages.html", {
        "conversation": conversation,
        "messages": messages
    })