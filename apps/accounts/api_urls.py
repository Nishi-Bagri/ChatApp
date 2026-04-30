from django.urls import path
from .views import RegisterView, UserListView, PasswordRestView, MyTokenObtainPairView  # ✅ import it
from rest_framework_simplejwt.views import TokenRefreshView  # ✅ remove TokenObtainPairView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('users/', UserListView.as_view()),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),  # ✅ swapped
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('reset-password/', PasswordRestView.as_view()),
]
    