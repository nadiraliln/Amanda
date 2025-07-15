from django.db import models
from django.contrib.auth.models import User

# Optional: File categories (could also be choices)
CATEGORY_CHOICES = [
    ('software', 'Software'),
    ('music', 'Music'),
    ('document', 'Document'),
    ('archive', 'Archive'),
    ('video', 'Video'),
    ('other', 'Other'),
]

# Main File Upload Model
class File(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='files')
    title = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/')
    file_type = models.CharField(max_length=50)
    file_size = models.PositiveBigIntegerField()
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')
    description = models.TextField(blank=True)
    download_count = models.PositiveIntegerField(default=0)
    like_count = models.PositiveIntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=1, default=0.0)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} ({self.user.username})"

    def file_size_mb(self):
        return round(self.file_size / (1024 * 1024), 2)

# Optional: To track file reviews/ratings
class FileReview(models.Model):
    file = models.ForeignKey(File, on_delete=models.CASCADE, related_name='reviews')
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    rating = models.PositiveSmallIntegerField()
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('file', 'user')

    def __str__(self):
        return f"Review by {self.user.username} on {self.file.title}"