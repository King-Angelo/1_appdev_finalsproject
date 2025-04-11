from django.urls import path
from . import views

app_name = 'myapp'

urlpatterns = [
    path('', views.index, name='index'),
    path('employer/register/', views.EmployerRegistrationView.as_view(), name='employer_register'),
    path('jobseeker/register/', views.JobSeekerRegistrationView.as_view(), name='jobseeker_register'),
    path('jobs/', views.JobListView.as_view(), name='job_list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job_detail'),
    path('jobs/<int:pk>/apply/', views.JobApplicationView.as_view(), name='apply_job'),
    path('employer/dashboard/', views.EmployerDashboardView.as_view(), name='employer_dashboard'),
]