from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer,UserSerializer, PasswordResetSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def create(self, request, *args , **kwargs):
        data = request.data

        user = User.objects.create_user(
            username=data.get('username'),
            password=data.get('password')
        )

        return Response(
            {"message":"User created successfully!"}, status=status.HTTP_201_CREATED
        )
    
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]    

class PasswordRestView(APIView):

    def post(self,request):
        serializer =PasswordResetSerializer(data=request.data)

        if serializer.is_valid():
            username = serializer.validated_data['username']
            new_password = serializer.validated_data['new_password']

            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return Response(
                    {"error":"User not found"},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            user.set_password(new_password)
            user.save()

            return Response({"message":"Password reset Successfully!"})
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)