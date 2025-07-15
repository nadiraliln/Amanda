from django.urls import path
from . import views
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('contact/', views.contact, name='contact'),
    path('downloads/', views.downloads, name='downloads'),
    path('file/<int:file_id>/', views.file_detail, name='file_detail'),
    path('register/', views.register, name='register'),
    path('verify_email/', views.verify_email, name='verify_email'),
    path('resend-otp/', views.resend_otp, name='resend_otp'),
    path('login/', views.login, name='login'),
    path('logout/', views.logout, name='logout'),
    path('profile/', views.profile, name='profile'),
    path('file/<int:file_id>/download/', views.download_file, name='download_file'),
    path('upload/', views.upload, name='upload'),   # ✅ Add this line!
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)