from django.shortcuts import render, redirect, get_object_or_404
from django.views.generic import CreateView, UpdateView, ListView, DetailView
from django.contrib.auth import login
from django.urls import reverse_lazy
from .models import Employer, JobSeeker, JobPosting, JobApplication
from .forms import EmployerRegistrationForm, JobSeekerRegistrationForm, JobPostingForm, JobApplicationForm
from django.contrib.auth.models import User
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib import messages
from django.utils import timezone

def index(request):
    return render(request,'index.html')

def home(request):
    return render(request, 'home.html')

class EmployerRegistrationView(CreateView):
    model = User
    form_class = EmployerRegistrationForm
    template_name = 'registration/employer_registration.html'
    success_url = reverse_lazy('account_login')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Your employer account has been created successfully. Please log in.')
        return response

class JobSeekerRegistrationView(CreateView):
    model = User
    form_class = JobSeekerRegistrationForm
    template_name = 'registration/jobseeker_registration.html'
    success_url = reverse_lazy('account_login')

    def form_valid(self, form):
        response = super().form_valid(form)
        messages.success(self.request, 'Your job seeker account has been created successfully. Please log in.')
        return response

class JobListView(ListView):
    model = JobPosting
    template_name = 'jobs/job_list.html'
    context_object_name = 'jobs'
    paginate_by = 10

    def get_queryset(self):
        queryset = JobPosting.objects.filter(is_active=True)
        category = self.request.GET.get('category')
        if category:
            queryset = queryset.filter(category__name=category)
        return queryset

class JobDetailView(DetailView):
    model = JobPosting
    template_name = 'jobs/job_detail.html'
    context_object_name = 'job'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        if self.request.user.is_authenticated:
            context['has_applied'] = JobApplication.objects.filter(
                job=self.object,
                applicant__user=self.request.user
            ).exists()
        return context

class JobApplicationView(LoginRequiredMixin, CreateView):
    model = JobApplication
    form_class = JobApplicationForm
    template_name = 'jobs/apply_job.html'

    def get_success_url(self):
        return reverse_lazy('job_detail', args=[self.kwargs['pk']])

    def form_valid(self, form):
        job = get_object_or_404(JobPosting, pk=self.kwargs['pk'])
        if JobApplication.objects.filter(job=job, applicant__user=self.request.user).exists():
            messages.error(self.request, 'You have already applied for this job.')
            return redirect('job_detail', pk=job.pk)
        
        form.instance.job = job
        form.instance.applicant = self.request.user.jobseeker
        form.instance.status = 'pending'
        messages.success(self.request, 'Your application has been submitted successfully.')
        return super().form_valid(form)

class EmployerDashboardView(LoginRequiredMixin, ListView):
    model = JobPosting
    template_name = 'jobs/employer_dashboard.html'
    context_object_name = 'jobs'

    def get_queryset(self):
        return JobPosting.objects.filter(company__employer__user=self.request.user)