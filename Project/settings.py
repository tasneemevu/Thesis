"""
Django settings for Project project.

Generated by 'django-admin startproject' using Django 5.0.6.

For more information on this file, see
https://docs.djangoproject.com/en/5.0/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.0/ref/settings/
"""

from pathlib import Path
import os
from dotenv import load_dotenv
import json
import dj_database_url

load_dotenv()  # Load environment variables from a .env file if present

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
credentials_json = os.getenv("GOOGLE_APPLICATION_CREDENTIALS_JSON")




# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.0/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-*75jkgo9w0p&xnkpqzmxc4w@t3x6k9q0)q&4#y*h-ki*2aj99d'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

# ALLOWED_HOSTS = []
ALLOWED_HOSTS = ['thcrowdchatb-4acf13a87d2c.herokuapp.com', 'localhost', '127.0.0.1']



# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',
    'django.contrib.sites',  # required for allauth
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'dj_rest_auth',
    'dj_rest_auth.registration',
    'channels',
    'corsheaders',
    'chat',
    'django_extensions',
    
]
ACCOUNT_AUTHENTICATION_METHOD = 'email'
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    # 'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this line
]
# CORS_ALLOW_ALL_ORIGINS = True  # Only for development

# Ensure CSRF_COOKIE_HTTPONLY is False for development
CSRF_COOKIE_HTTPONLY = False
ROOT_URLCONF = 'Project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Project.wsgi.application'
ASGI_APPLICATION = 'Project.asgi.application'


# Database
# https://docs.djangoproject.com/en/5.0/ref/settings/#databases

# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.sqlite3',
#         'NAME': BASE_DIR / 'db.sqlite3',
#     }
# }
# DATABASES = {
#     'default': dj_database_url.config(default='sqlite:///db.sqlite3')
# }
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'dcpp2kd95sitro',  # Your Heroku database name
        'USER': 'uee9k9lg31seqq',   # Your Heroku database username
        'PASSWORD': 'pf4063ae2d79dfabdad164354217cf05dc56fed488b0977c18906f1a356c5b1b3',  # Your Heroku database password
        'HOST': 'ccaml3dimis7eh.cluster-czz5s0kz4scl.eu-west-1.rds.amazonaws.com',  # Your Heroku database host
        'PORT': '5432',             # Default PostgreSQL port
        'OPTIONS': {
            'sslmode': 'require',   # Required for Heroku
        },
    }
}

# Password validation
# https://docs.djangoproject.com/en/5.0/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.0/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.0/howto/static-files/

STATIC_URL = 'static/'
STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

STATIC_ROOT = BASE_DIR / "staticfiles" 

# Default primary key field type
# https://docs.djangoproject.com/en/5.0/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CHANNEL_LAYERS = {
#     'default': {
#         'BACKEND': 'channels_redis.core.RedisChannelLayer',
#         'CONFIG': {
#             "hosts": [('127.0.0.1', 6379)],
#         },
#     },
# }
# import ssl

# REDIS_URL = os.environ.get("REDIS_URL")

# CHANNEL_LAYERS = {
#     "default": {
#         "BACKEND": "channels_redis.core.RedisChannelLayer",
#         "CONFIG": {
#             "hosts": [
#                 {
#                     "address": REDIS_URL,
#                     "ssl": {
#                         "ssl_cert_reqs": ssl.CERT_NONE,  # Skip certificate verification (for Heroku Redis)
#                     },
#                 }
#             ],
#         },
#     },
# }
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [
                {
                    "address": "rediss://ec2-34-240-54-123.eu-west-1.compute.amazonaws.com:12939",
                    "password": "p8835fa9f99270fe67be289ab561b4ac6f3497d8159e55b9259e3c5f429a62069",
                    "ssl_cert_reqs": None  # Optional: Disable SSL certificate verification if required
                }
                ]
                #   "capacity": 1000,  # Increase the number of messages per channel (default is 100)
                # "expiry": 60, # Set the expiry time for messages (default is 60 seconds) 
        
        },
    },
}

CORS_ALLOWED_ORIGINS = [
    # "http://localhost:3000",
    "https://thcrowdchatb-4acf13a87d2c.herokuapp.com",
    "https://chatapp-frontend-b0e6504a9912.herokuapp.com",
    "http://127.0.0.1:8000"
]
CSRF_TRUSTED_ORIGINS = [
    "https://thcrowdchatb-4acf13a87d2c.herokuapp.com",
    "https://chatapp-frontend-b0e6504a9912.herokuapp.com",
    "http://127.0.0.1:8000"# Include other frontend domains if any
]

CORS_ALLOW_CREDENTIALS = True
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
}
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        '': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}


AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
)

SITE_ID = 1
