from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import ConversationViewSet, MessageViewSet, UnreadCountView, UserStatusView



router = DefaultRouter()

router.register(
    r"conversations",
    ConversationViewSet,
    basename="conversation"
)

router.register(
    r"messages",
    MessageViewSet,
    basename="message"
)

urlpatterns = router.urls + [
    path(
        "unread-count/",
        UnreadCountView.as_view(),
        name="unread-count"
    ),

    path('unread-count/', UnreadCountView.as_view()),
    path('user-status/', UserStatusView.as_view()),
]