from django.urls import path
from .views import (
    RegisterView,
    LoginView,
    OAuthLoginView,
    MagicLinkSendView,
    MagicLinkVerifyView,
    CurrentUserView,
    LogoutView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', LoginView.as_view(), name='auth_login'),
    path('oauth/', OAuthLoginView.as_view(), name='auth_oauth'),
    path('magic-link/send/', MagicLinkSendView.as_view(), name='auth_magic_link_send'),
    path('magic-link/verify/', MagicLinkVerifyView.as_view(), name='auth_magic_link_verify'),
    path('me/', CurrentUserView.as_view(), name='auth_me'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
