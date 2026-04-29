from django.urls import path,include
from .template_views import conversations_page,messages_page, chat_view


urlpatterns = [
    path('', chat_view),

    path('conversations/', conversations_page),
    path('<int:id>/messages/', messages_page),

  
]