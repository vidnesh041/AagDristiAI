from rest_framework import serializers
from django.contrib.auth import authenticate
from django.contrib.auth.models import User

class UserRoleSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'is_staff']

    def get_role(self, obj):
        return "admin" if (obj.is_staff or obj.is_superuser) else "citizen"


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            # Also allow logging in with email as username
            if '@' in username:
                try:
                    user_obj = User.objects.get(email__iexact=username)
                    username = user_obj.username
                except User.DoesNotExist:
                    pass

            user = authenticate(username=username, password=password)
            if not user:
                raise serializers.ValidationError("Invalid credentials. Please check your username/email and password.")
            if not user.is_active:
                raise serializers.ValidationError("User account is disabled.")
            data['user'] = user
        else:
            raise serializers.ValidationError("Must include both username and password.")
        return data


class RegisterSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, min_length=6)
    name = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=['citizen', 'admin'], default='citizen', required=False)

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("An account with this email address already exists. Please sign in instead.")
        return value.lower()

    def create(self, validated_data):
        email = validated_data['email']
        password = validated_data['password']
        name = validated_data.get('name', '').strip()
        role = validated_data.get('role', 'citizen')

        username = email.split('@')[0]
        base_username = username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}_{counter}"
            counter += 1

        name_parts = name.split(' ', 1)
        first_name = name_parts[0] if name_parts else "Nagpur"
        last_name = name_parts[1] if len(name_parts) > 1 else "Resident"

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_staff=(role == 'admin')
        )
        return user


class OAuthLoginSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=['google', 'nmc_sso', 'nmc'], required=True)
    email = serializers.EmailField(required=False, allow_blank=True)
    name = serializers.CharField(required=False, allow_blank=True)
    employee_id = serializers.CharField(required=False, allow_blank=True)
    sso_token = serializers.CharField(required=False, allow_blank=True)
