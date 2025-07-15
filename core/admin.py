from django.contrib import admin
from .models import File, FileReview

@admin.register(File)
class FileAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'category', 'file_size', 'download_count', 'like_count', 'is_verified', 'upload_date')
    search_fields = ('title', 'user__username', 'category')
    list_filter = ('category', 'is_verified')

@admin.register(FileReview)
class FileReviewAdmin(admin.ModelAdmin):
    list_display = ('file', 'user', 'rating', 'created_at')
    search_fields = ('file__title', 'user__username')