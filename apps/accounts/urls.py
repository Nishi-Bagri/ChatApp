from django.urls import path

from rest_framework_simplejwt.views import (
    TokenRefreshView
)

from .views import (
    RegisterView,
    UserListView,
    PasswordResetView,
    MyTokenObtainPairView,
)

urlpatterns = [

    path(
        'register/',
        RegisterView.as_view(),
        name='register'
    ),

    path(
        'users/',
        UserListView.as_view(),
        name='users'
    ),

    path(
        'login/',
        MyTokenObtainPairView.as_view(),
        name='token_obtain_pair'
    ),

    path(
        'token/refresh/',
        TokenRefreshView.as_view(),
        name='token_refresh'
    ),

    path(
        'reset-password/',
        PasswordResetView.as_view(),
        name='reset-password'
    ),
]