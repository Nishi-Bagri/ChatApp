from django.urls import path
from .template_views import (
    register_view,password_reset_view,
    password_reset_done_view,password_reset_confirm_view,
    password_reset_complete_view)

urlpatterns = [
  
    path('register/', register_view),

    path('password-reset/', password_reset_view),
    path('password-reset/done/', password_reset_done_view),
    path('password-reset/confirm/<uidb64>/<token>/', password_reset_confirm_view),
    path('password-reset/complete/', password_reset_complete_view),

]