@echo off
echo Cleaning up Django files and directories...

:: Remove Django directories
rmdir /s /q __pycache__
rmdir /s /q venv
rmdir /s /q templates
rmdir /s /q staticfiles
rmdir /s /q static
rmdir /s /q social_login_project
rmdir /s /q myproject
rmdir /s /q myapp
rmdir /s /q jobportal
rmdir /s /q django_social_login_allauth
rmdir /s /q users
rmdir /s /q src
rmdir /s /q protected_media

:: Remove Django files
del /f db.sqlite3
del /f django-debug.log
del /f requirements.txt
del /f manage.py
del /f run_tests.py
del /f test_runner.py
del /f test_api.py
del /f test_server.py
del /f create_categories.py
del /f create_jobseeker.py
del /f create_profiles.py
del /f create_skills_benefits.py

echo Django files removed successfully!
echo Creating Express directory structure...

:: Create Express directories
mkdir config
mkdir controllers
mkdir middleware
mkdir models
mkdir public\css
mkdir public\js
mkdir public\images
mkdir routes
mkdir services
mkdir views\layouts
mkdir views\partials
mkdir views\pages

echo Express directory structure created!
echo Cleanup completed!
pause 