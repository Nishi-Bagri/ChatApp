from django.contrib import admin
from django.contrib.auth.models import User

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'email')

admin.site.unregister(User)
admin.site.register(User, UserAdmin)
