from django.contrib.auth.models import User

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    MyTokenObtainPairSerializer,
    RegisterSerializer,
    UserSerializer,
    PasswordResetSerializer,
)


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(APIView):

    def post(self, request):

        serializer = RegisterSerializer(
            data=request.data
        )

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    "message": "User created successfully",
                    "data": serializer.data,
                },
                status=status.HTTP_201_CREATED,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


class UserListView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        users = User.objects.all()

        serializer = UserSerializer(
            users,
            many=True
        )

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


class PasswordResetView(APIView):

    def post(self, request):

        serializer = PasswordResetSerializer(
            data=request.data
        )

        if serializer.is_valid():

            username = serializer.validated_data["username"]
            new_password = serializer.validated_data["new_password"]

            try:

                user = User.objects.get(
                    username=username
                )

            except User.DoesNotExist:

                return Response(
                    {
                        "error": "User not found"
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            user.set_password(new_password)

            user.save()

            return Response(
                {
                    "message": "Password reset successful"
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )