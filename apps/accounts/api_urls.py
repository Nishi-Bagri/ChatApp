from django.urls import path
from .views import RegisterView,UserListView,PasswordRestView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    
    path('register/',RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view()),
    path('login/',TokenObtainPairView.as_view(), name='token_obtain_pair'), #Will give access Token
    path('token/refresh/',TokenRefreshView.as_view(), name='token_refresh'),
    path('reset-password/', PasswordRestView.as_view()),

    ]
    