from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = 'django-insecure-@o0unms!l=(u@#8p1-4t1+#4n!(htv*@#0!cfkqt6s%2tmfhnv'
DEBUG = True
ALLOWED_HOSTS = ['*']

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'properties',
    'polygons',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

ROOT_URLCONF = 'config.urls'
WSGI_APPLICATION = 'config.wsgi.application'

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    },
}

LANGUAGE_CODE = 'ru'
TIME_ZONE = 'Asia/Yekaterinburg'
USE_I18N = True
USE_TZ = True
STATIC_URL = 'static/'

# --- Redis ---
REDIS_URL = 'redis://localhost:6380/0'

# --- Celery ---
CELERY_BROKER_URL = 'redis://localhost:6380/1'
CELERY_RESULT_BACKEND = 'redis://localhost:6380/1'
CELERY_BEAT_SCHEDULE = {
    'parse-profitbase-feed': {
        'task': 'properties.tasks.parse_feed',
        'schedule': 60,  # every 2 hours
    },
}

# --- Feed ---
PROFITBASE_FEED_URL = (
    'https://pb6620.profitbase.ru/export/profitbase_xml/'
    'fe6b2658da373993605b6983d81180cb?scheme=https'
)

# --- Logging ---
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'short': {
            'format': '[%(asctime)s] %(levelname)s %(name)s: %(message)s',
            'datefmt': '%H:%M:%S',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'short',
        },
    },
    'loggers': {
        'properties': {
            'handlers': ['console'],
            'level': 'INFO',
        },
    },
}
