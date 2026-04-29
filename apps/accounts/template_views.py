from django.shortcuts import render


# ----------------------
# LOGIN PAGE
# ----------------------
def login_view(request):
    print("Login view hit")
    return render(request, "accounts/login.html")


# ----------------------
# REGISTER PAGE
# ----------------------
def register_view(request):
    return render(request, "accounts/register.html")


# ----------------------
# PASSWORD RESET FLOW
# ----------------------
def password_reset_view(request):
    return render(request, "accounts/password_reset.html")


def password_reset_done_view(request):
    return render(request, "accounts/password_reset_done.html")


def password_reset_confirm_view(request):
    return render(request, "accounts/password_reset_confirm.html")


def password_reset_complete_view(request):
    return render(request, "accounts/password_reset_complete.html")