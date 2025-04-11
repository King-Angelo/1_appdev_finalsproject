from django.urls import path
from django.shortcuts import redirect
from . import views
from myapp.views import JobSeekerRegistrationView, EmployerRegistrationView

app_name = 'jobs'

def redirect_to_dashboard(request):
    if request.user.is_authenticated:
        if hasattr(request.user, 'myapp_employer'):
            return redirect('jobs:employer_dashboard')
        elif hasattr(request.user, 'myapp_jobseeker'):
            return redirect('jobs:jobseeker_dashboard')
    return redirect('account_login')

urlpatterns = [
    path('', views.HomeView.as_view(), name='home'),
    path('dashboard/', redirect_to_dashboard, name='dashboard_redirect'),
    path('jobs/', views.JobListView.as_view(), name='job_list'),
    path('jobs/<int:pk>/', views.JobDetailView.as_view(), name='job_detail'),
    path('jobs/create/', views.JobPostingCreateView.as_view(), name='job_create'),
    path('jobs/<int:pk>/update/', views.JobPostingUpdateView.as_view(), name='job_update'),
    path('jobs/<int:pk>/delete/', views.JobPostingDeleteView.as_view(), name='job_delete'),
    path('jobs/<int:pk>/toggle-status/', views.JobToggleStatusView.as_view(), name='job_toggle_status'),
    path('jobs/<int:job_id>/apply/', views.ApplicationCreateView.as_view(), name='job_apply'),
    path('applications/<int:pk>/', views.ApplicationDetailView.as_view(), name='application_detail'),
    path('applications/<int:pk>/edit/', views.ApplicationUpdateView.as_view(), name='application_edit'),
    path('applications/<int:pk>/update/', views.ApplicationUpdateView.as_view(), name='application_update'),
    path('applications/<int:pk>/update-status/', views.ApplicationStatusUpdateView.as_view(), name='application_status_update'),
    path('applications/bulk-status-update/', views.BulkStatusUpdateView.as_view(), name='bulk_status_update'),
    path('applications/<int:application_id>/resume/', views.ResumeView.as_view(), name='view_resume'),
    path('employer/dashboard/', views.EmployerDashboardView.as_view(), name='employer_dashboard'),
    path('jobseeker/dashboard/', views.JobSeekerDashboardView.as_view(), name='jobseeker_dashboard'),
    path('employer/register/', EmployerRegistrationView.as_view(), name='employer_registration'),
    path('jobseeker/register/', JobSeekerRegistrationView.as_view(), name='jobseeker_registration'),
    path('jobs/<int:job_id>/save/', views.SavedJobView.as_view(), name='save_job'),
    path('saved-jobs/', views.SavedJobListView.as_view(), name='saved_jobs'),
    path('jobseeker/profile/edit/', views.JobSeekerProfileUpdateView.as_view(), name='jobseeker_profile_edit'),
    path('alerts/', views.JobAlertListView.as_view(), name='job_alert_list'),
    path('alerts/create/', views.JobAlertCreateView.as_view(), name='job_alert_create'),
    path('alerts/<int:pk>/update/', views.JobAlertUpdateView.as_view(), name='job_alert_update'),
    path('alerts/<int:pk>/delete/', views.JobAlertDeleteView.as_view(), name='job_alert_delete'),
    path('alerts/<int:pk>/toggle/', views.JobAlertToggleView.as_view(), name='job_alert_toggle'),
    path('save-search/', views.SaveSearchView.as_view(), name='save_search'),
    path('delete-search/<int:search_id>/', views.DeleteSavedSearchView.as_view(), name='delete_search'),
    path('save-job/', views.SaveJobView.as_view(), name='save_job'),
    path('jobs/<int:pk>/analytics/', views.JobAnalyticsView.as_view(), name='job_analytics'),
    path('employer/analytics/', views.EmployerAnalyticsDashboardView.as_view(), name='employer_analytics'),
    path('notifications/', views.NotificationListView.as_view(), name='notifications'),
    path('notifications/mark-read/', views.NotificationMarkReadView.as_view(), name='mark_notifications_read'),
    path('notifications/settings/', views.NotificationSettingsView.as_view(), name='notification_settings'),
    path('analytics/admin/', views.AdminAnalyticsDashboardView.as_view(), name='admin_analytics'),
    path('analytics/reports/create/', views.CreateAnalyticsReportView.as_view(), name='create_analytics_report'),
    path('analytics/reports/<int:pk>/edit/', views.EditAnalyticsReportView.as_view(), name='edit_analytics_report'),
    path('analytics/reports/<int:pk>/delete/', views.DeleteAnalyticsReportView.as_view(), name='delete_analytics_report'),
    path('analytics/reports/<int:pk>/download/', views.DownloadAnalyticsReportView.as_view(), name='download_analytics_report'),
]
