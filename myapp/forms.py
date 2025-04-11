from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth import get_user_model
from .models import JobSeeker, Employer, Company, Skill, JobPosting, JobApplication, JobCategory
from django.utils import timezone

class JobSeekerRegistrationForm(UserCreationForm):
    bio = forms.CharField(widget=forms.Textarea, required=False)
    location = forms.CharField(max_length=100, required=True)
    skills = forms.ModelMultipleChoiceField(queryset=Skill.objects.all(), required=False)
    experience_level = forms.ChoiceField(choices=JobSeeker.EXPERIENCE_LEVEL_CHOICES, required=True)
    expected_salary = forms.DecimalField(max_digits=10, decimal_places=2, required=False)
    phone = forms.CharField(max_length=20, required=True)
    education = forms.CharField(widget=forms.Textarea, required=False)
    professional_summary = forms.CharField(widget=forms.Textarea, required=False)
    preferred_job_types = forms.MultipleChoiceField(choices=JobPosting.JOB_TYPE_CHOICES, required=False)
    preferred_locations = forms.CharField(max_length=200, required=False)
    profile_picture = forms.ImageField(required=False)

    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password1', 'password2', 'bio', 'location', 'skills',
                 'experience_level', 'expected_salary', 'phone', 'education', 'professional_summary',
                 'preferred_job_types', 'preferred_locations', 'profile_picture')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_jobseeker = True
        if commit:
            user.save()
            # Check if a JobSeeker already exists for this user
            jobseeker, created = JobSeeker.objects.get_or_create(
                user=user,
                defaults={
                    'bio': self.cleaned_data.get('bio', ''),
                    'location': self.cleaned_data['location'],
                    'experience_level': self.cleaned_data['experience_level'],
                    'expected_salary': self.cleaned_data.get('expected_salary'),
                    'phone': self.cleaned_data['phone'],
                    'education': self.cleaned_data.get('education', ''),
                    'professional_summary': self.cleaned_data.get('professional_summary', ''),
                    'preferred_locations': self.cleaned_data.get('preferred_locations', ''),
                    'profile_picture': self.cleaned_data.get('profile_picture')
                }
            )
            if created:
                jobseeker.skills.set(self.cleaned_data.get('skills', []))
                jobseeker.preferred_job_types = self.cleaned_data.get('preferred_job_types', [])
                jobseeker.save()
        return user

class EmployerRegistrationForm(UserCreationForm):
    company_name = forms.CharField(max_length=100, required=True)
    industry = forms.CharField(max_length=100, required=True)
    company_size = forms.IntegerField(required=True)
    website = forms.URLField(required=False)
    company_description = forms.CharField(widget=forms.Textarea, required=False)
    location = forms.CharField(max_length=100, required=True)
    job_title = forms.CharField(max_length=100, required=True)
    department = forms.CharField(max_length=100, required=False)

    class Meta:
        model = get_user_model()
        fields = ('username', 'email', 'password1', 'password2', 'company_name',
                 'industry', 'company_size', 'website', 'company_description',
                 'location', 'job_title', 'department')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.is_employer = True
        if commit:
            user.save()
            company = Company.objects.create(
                name=self.cleaned_data['company_name'],
                industry=self.cleaned_data['industry'],
                employee_count=self.cleaned_data['company_size'],
                website=self.cleaned_data.get('website', ''),
                description=self.cleaned_data.get('company_description', ''),
                location=self.cleaned_data['location']
            )
            employer = Employer.objects.create(
                user=user,
                company=company,
                job_title=self.cleaned_data['job_title'],
                department=self.cleaned_data.get('department', '')
            )
        return user

class JobPostingForm(forms.ModelForm):
    class Meta:
        model = JobPosting
        fields = [
            'title', 'description', 'requirements', 'company', 'category',
            'job_type', 'experience_level', 'location', 'application_deadline',
            'salary_min', 'salary_max', 'required_skills', 'preferred_skills',
            'benefits'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 4}),
            'requirements': forms.Textarea(attrs={'rows': 4}),
            'application_deadline': forms.DateTimeInput(attrs={'type': 'datetime-local'}),
        }

    def clean_application_deadline(self):
        deadline = self.cleaned_data['application_deadline']
        if deadline <= timezone.now():
            raise forms.ValidationError("Application deadline must be in the future.")
        return deadline

    def clean_salary(self):
        salary_min = self.cleaned_data.get('salary_min')
        salary_max = self.cleaned_data.get('salary_max')
        if salary_min and salary_max and salary_min > salary_max:
            raise forms.ValidationError("Minimum salary cannot be greater than maximum salary.")
        return salary_min, salary_max

class JobApplicationForm(forms.ModelForm):
    class Meta:
        model = JobApplication
        fields = ['cover_letter', 'resume']
        widgets = {
            'cover_letter': forms.Textarea(attrs={'rows': 4}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['resume'].required = False 