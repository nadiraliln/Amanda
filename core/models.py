import os
from mimetypes import guess_type
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Custom User Model
class UserRegister(AbstractUser):
    full_name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    REQUIRED_FIELDS = ['email', 'full_name']
    USERNAME_FIELD = 'username'  # Already default but mentioned for clarity

    def __str__(self):
        return self.username


# Optional: File categories (could also be choices)
class Category(models.Model):
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


# Main File Upload Model
class File(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    title = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255, blank=True)
    file = models.FileField(upload_to='uploads/')
    file_type = models.CharField(max_length=50, blank=True)
    file_size = models.PositiveBigIntegerField(blank=True, null=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True)
    download_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if self.file and not self.original_filename:
            self.original_filename = os.path.basename(self.file.name)
        if self.file:
            self.file_size = self.file.size
            mime_type, encoding = guess_type(self.file.name)
            self.file_type = mime_type if mime_type else 'unknown'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    def file_size_mb(self):
        if self.file_size:
            return round(self.file_size / (1024 * 1024), 2)
        return 0.0


# Optional: To track file reviews/ratings
class FileReview(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('file', 'user')

    def __str__(self):
        return f"Review by {self.user.username} on {self.file.title}"