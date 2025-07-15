from django.shortcuts import render, redirect,get_object_or_404
from django.contrib import messages
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from django.contrib.auth.decorators import login_required
from .models import File  # Tumhare uploaded files model ka naam example hai
from django.contrib.auth.models import User
from django.http import FileResponse
import random
from django.conf import settings
from django.core.mail import send_mail
from django.contrib import messages
# views.py
from django.contrib.auth import get_user_model


@login_required
def download_file(request, file_id):
    file = get_object_or_404(File, pk=file_id)
    file.download_count += 1
    file.save()
    response = FileResponse(file.file.open('rb'))
    response['Content-Disposition'] = f'attachment; filename="{file.original_filename}"'
    return response

# Home Page
@login_required
def home(request):
    return render(request, 'index.html')

def upload(request):
    return render(request, 'upload.html')

# About Page
@login_required
def about(request):
    return render(request, 'about.html')

# Contact Page
@login_required
def contact(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        subject = request.POST.get('subject')
        message = request.POST.get('message')

        # Example: Save to database or send email logic yahan hoga
        messages.success(request, 'Thank you for your message! We will get back to you soon.')

        return redirect('contact')

    return render(request, 'contact.html')

# Downloads Page
@login_required
def downloads(request):
    files = File.objects.all()
    context = {
        'files': files
    }
    return render(request, 'downloads.html', context)

# File Detail Page
@login_required
def file_detail(request, file_id):
    file = File.objects.get(id=file_id)
    context = {
        'file': file
    }
    return render(request, 'file_detail.html', context)

# Register
User = get_user_model()

# ✅ OTP generate
def generate_otp():
    return str(random.randint(100000, 999999))

# ✅ OTP email bhejna
def send_otp_email(email, otp):
    subject = 'Your Email Verification Code'
    message = f'Your OTP code is: {otp}'
    from_email = settings.DEFAULT_FROM_EMAIL
    recipient_list = [email]

    send_mail(subject, message, from_email, recipient_list, fail_silently=False)

# ✅ Register view (safe)
def register(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        phone = request.POST.get('phone')
        address = request.POST.get('address')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already taken.')
            return redirect('register')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already registered.')
            return redirect('register')

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=name
        )
        user.is_active = False   # ✅ Important for verification
        user.save()

        otp = generate_otp()
        send_otp_email(email, otp)

        request.session['verification_email'] = email
        request.session['verification_otp'] = otp

        messages.success(request, 'Account created successfully! Please verify your email.')
        return redirect('verify_email')

    return render(request, 'register.html')

# ✅ Verify email view
def verify_email(request):
    email = request.session.get('verification_email')
    if not email:
        messages.error(request, 'No email found for verification.')
        return redirect('home')

    if request.method == 'POST':
        user_otp = request.POST.get('otp')
        saved_otp = request.session.get('verification_otp')

        if user_otp == saved_otp:
            try:
                user = User.objects.get(email=email)
                user.is_active = True
                # If you have email_verified field, set it True here too
                if hasattr(user, 'email_verified'):
                    user.email_verified = True
                user.save()

                del request.session['verification_email']
                del request.session['verification_otp']

                messages.success(request, 'Email verified successfully! You can now login.')
                return redirect('login')

            except User.DoesNotExist:
                messages.error(request, 'User not found.')

        else:
            messages.error(request, 'Invalid OTP. Please try again.')

    return render(request, 'verify_email.html', {'email': email})

# ✅ Resend OTP view
def resend_otp(request):
    email = request.session.get('verification_email')
    if email:
        otp = generate_otp()
        request.session['verification_otp'] = otp
        send_otp_email(email, otp)
        messages.success(request, f'New OTP sent to {email}')
        return redirect('verify_email')
    messages.error(request, 'No email to resend OTP to.')
    return redirect('home')
# Login
def login(request):
    if request.method == 'POST':
        email = request.POST.get('email')
        password = request.POST.get('password')

        try:
            user = User.objects.get(email=email)
            username = user.username
        except User.DoesNotExist:
            messages.error(request, 'Invalid email or password.')
            return redirect('login')

        user = authenticate(request, username=username, password=password)
        if user is not None:
            auth_login(request, user)
            messages.success(request, 'Login successful!')
            return redirect('profile')
        else:
            messages.error(request, 'Invalid email or password.')
            return redirect('login')

    return render(request, 'login.html')

# Logout
@login_required
def logout(request):
    auth_logout(request)
    messages.info(request, 'Logged out successfully.')
    return redirect('login')


@login_required
def profile(request):
    user = request.user
    user_files = File.objects.filter(user=user)

    total_downloads = sum(file.download_count or 0 for file in user_files)
    total_likes = sum(file.like_count or 0 for file in user_files)

    context = {
        'user': user,
        'user_files': user_files,
        'total_downloads': total_downloads,
        'total_likes': total_likes,
    }

    return render(request, 'profile.html', context)