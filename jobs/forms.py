from django import forms
from myapp.models import JobSeeker, Employer, JobPosting, JobApplication, Skill, Benefit, JobAlert, Company
from django.core.exceptions import ValidationError
from django.utils import timezone
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User

# Company size choices for employer registration
COMPANY_SIZE_CHOICES = [
    ('1-10', '1-10 employees'),
    ('11-50', '11-50 employees'),
    ('51-200', '51-200 employees'),
    ('201-500', '201-500 employees'),
    ('501-1000', '501-1000 employees'),
    ('1000+', '1000+ employees'),
]

class JobSeekerProfileForm(forms.ModelForm):
    class Meta:
        model = JobSeeker
        fields = [
            'bio', 'resume', 'skills', 'experience_level', 
            'expected_salary', 'location', 'is_available',
            'education', 'work_experience', 'phone',
            'preferred_job_types', 'preferred_locations',
            'profile_picture', 'professional_summary'
        ]
        widgets = {
            'bio': forms.Textarea(attrs={'class': 'form-control', 'rows': 4}),
            'resume': forms.FileInput(attrs={'class': 'form-control'}),
            'skills': forms.SelectMultiple(attrs={'class': 'form-control select2'}),
            'experience_level': forms.Select(attrs={'class': 'form-control'}),
            'expected_salary': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'e.g., 50000'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., New York, NY'}),
            'is_available': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'education': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Enter your education history'}),
            'work_experience': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Enter your work experience'}),
            'phone': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., +1 (555) 123-4567'}),
            'preferred_job_types': forms.SelectMultiple(attrs={'class': 'form-control select2'}),
            'preferred_locations': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., New York, NY; San Francisco, CA'}),
            'profile_picture': forms.FileInput(attrs={'class': 'form-control'}),
            'professional_summary': forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Write a brief professional summary'}),
        }

class EmployerProfileForm(forms.ModelForm):
    class Meta:
        model = Employer
        fields = ['company', 'job_title', 'department', 'phone', 'is_primary_contact', 'can_post_jobs']
        widgets = {
            'company': forms.Select(attrs={'class': 'form-control'}),
            'job_title': forms.TextInput(attrs={'class': 'form-control'}),
            'department': forms.TextInput(attrs={'class': 'form-control'}),
            'phone': forms.TextInput(attrs={'class': 'form-control'}),
            'is_primary_contact': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
            'can_post_jobs': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

class JobPostingForm(forms.ModelForm):
    required_skills = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2'}),
        required=True
    )
    
    preferred_skills = forms.ModelMultipleChoiceField(
        queryset=Skill.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2'}),
        required=False
    )
    
    benefits = forms.ModelMultipleChoiceField(
        queryset=Benefit.objects.all(),
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2'}),
        required=False
    )

    class Meta:
        model = JobPosting
        fields = [
            'title', 'company', 'category', 'description', 'requirements', 
            'job_type', 'experience_level', 'location', 'salary_min', 
            'salary_max', 'required_skills', 'preferred_skills', 'benefits',
            'is_active', 'is_featured', 'application_deadline', 'cost_per_day'
        ]
        widgets = {
            'description': forms.Textarea(attrs={'class': 'form-control'}),
            'requirements': forms.Textarea(attrs={'class': 'form-control'}),
            'application_deadline': forms.DateTimeInput(attrs={'type': 'datetime-local', 'class': 'form-control'}),
            'cost_per_day': forms.NumberInput(attrs={'class': 'form-control'}),
        }

    def clean(self):
        cleaned_data = super().clean()
        salary_min = cleaned_data.get('salary_min')
        salary_max = cleaned_data.get('salary_max')
        application_deadline = cleaned_data.get('application_deadline')

        if salary_min and salary_max and salary_min > salary_max:
            raise ValidationError('Minimum salary cannot be greater than maximum salary')

        if application_deadline and application_deadline < timezone.now():
            raise ValidationError('Application deadline cannot be in the past')

        return cleaned_data

class ApplicationForm(forms.ModelForm):
    class Meta:
        model = JobApplication
        fields = ['cover_letter', 'resume']
        widgets = {
            'cover_letter': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
            'resume': forms.FileInput(attrs={'class': 'form-control'}),
        }

class ApplicationUpdateForm(forms.ModelForm):
    class Meta:
        model = JobApplication
        fields = ['cover_letter', 'resume']
        widgets = {
            'cover_letter': forms.Textarea(attrs={'class': 'form-control', 'rows': 5}),
            'resume': forms.FileInput(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Make resume field optional when updating
        self.fields['resume'].required = False
        # Add help text for resume field
        self.fields['resume'].help_text = 'Leave empty to keep the current resume'

class EmployerRegistrationForm(UserCreationForm):
    company_name = forms.CharField(max_length=100)
    industry = forms.CharField(max_length=100)
    company_size = forms.ChoiceField(choices=COMPANY_SIZE_CHOICES)
    website = forms.URLField(required=False)
    company_description = forms.CharField(widget=forms.Textarea)
    location = forms.CharField(max_length=100)
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'company_name', 
                 'industry', 'company_size', 'website', 'company_description', 'location')
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.is_staff = True  # Set is_staff to True for employers
        
        if commit:
            user.save()
            
            # Create or get the company first
            company = Company.objects.create(
                name=self.cleaned_data['company_name'],
                industry=self.cleaned_data['industry'],
                description=self.cleaned_data['company_description'],
                website=self.cleaned_data['website'],
                location=self.cleaned_data['location']
            )
            
            # Create the employer profile
            if not hasattr(user, 'myapp_employer'):
                employer = Employer.objects.create(
                    user=user,
                    company=company,
                    job_title='Manager',  # Default job title
                    department='Management',  # Default department
                    is_primary_contact=True,  # Make them primary contact by default
                    can_post_jobs=True  # Allow them to post jobs by default
                )
            
        return user

class JobSeekerRegistrationForm(UserCreationForm):
    email = forms.EmailField(
        required=True,
        widget=forms.EmailInput(attrs={'class': 'form-control'})
    )
    phone = forms.CharField(
        max_length=20,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., +1 (555) 123-4567'})
    )
    location = forms.CharField(
        max_length=100,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., New York, NY'})
    )
    address = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 2, 'placeholder': 'Your address'})
    )
    professional_summary = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Brief summary of your professional background'})
    )
    education = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Your educational background'})
    )
    experience = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 4, 'placeholder': 'Your work experience'})
    )
    skills = forms.CharField(
        required=False,
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3, 'placeholder': 'Your skills (e.g., Python, JavaScript, Project Management)'})
    )
    expected_salary = forms.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        widget=forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Expected annual salary'})
    )
    preferred_job_types = forms.MultipleChoiceField(
        choices=[
            ('full_time', 'Full Time'),
            ('part_time', 'Part Time'),
            ('contract', 'Contract'),
            ('internship', 'Internship'),
        ],
        required=False,
        widget=forms.SelectMultiple(attrs={'class': 'form-control select2'})
    )
    preferred_locations = forms.CharField(
        max_length=200,
        required=False,
        widget=forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Preferred work locations'})
    )
    
    class Meta:
        model = User
        fields = ('username', 'email', 'password1', 'password2', 'phone', 'location', 
                 'address', 'professional_summary', 'education', 'experience', 
                 'skills', 'expected_salary', 'preferred_job_types', 'preferred_locations')
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({'class': 'form-control'})
        self.fields['password1'].widget.attrs.update({'class': 'form-control'})
        self.fields['password2'].widget.attrs.update({'class': 'form-control'})
        
        # Add help text below the password fields
        self.fields['password1'].help_text = 'Your password must contain at least 8 characters.'
        self.fields['password2'].help_text = 'Enter the same password as before, for verification.'
    
    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        
        if commit:
            user.save()
            
            # Create or update the job seeker profile
            if not hasattr(user, 'myapp_jobseeker'):
                job_seeker = JobSeeker.objects.create(
                    user=user,
                    phone=self.cleaned_data['phone'],
                    location=self.cleaned_data['location'],
                    address=self.cleaned_data['address'],
                    professional_summary=self.cleaned_data['professional_summary'],
                    education=self.cleaned_data['education'],
                    work_experience=self.cleaned_data['experience'],
                    skills=self.cleaned_data['skills'],
                    expected_salary=self.cleaned_data['expected_salary'],
                    preferred_job_types=','.join(self.cleaned_data['preferred_job_types']),
                    preferred_locations=self.cleaned_data['preferred_locations']
                )
            else:
                # Update existing job seeker profile
                job_seeker = user.myapp_jobseeker
                job_seeker.phone = self.cleaned_data['phone']
                job_seeker.location = self.cleaned_data['location']
                job_seeker.address = self.cleaned_data['address']
                job_seeker.professional_summary = self.cleaned_data['professional_summary']
                job_seeker.education = self.cleaned_data['education']
                job_seeker.work_experience = self.cleaned_data['experience']
                job_seeker.skills = self.cleaned_data['skills']
                job_seeker.expected_salary = self.cleaned_data['expected_salary']
                job_seeker.preferred_job_types = ','.join(self.cleaned_data['preferred_job_types'])
                job_seeker.preferred_locations = self.cleaned_data['preferred_locations']
                job_seeker.save()
                
        return user

class JobAlertForm(forms.ModelForm):
    class Meta:
        model = JobAlert
        fields = [
            'keywords', 'job_type', 'category', 'location', 
            'min_salary', 'frequency', 'is_active'
        ]
        widgets = {
            'keywords': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'Job title keywords'}),
            'job_type': forms.Select(attrs={'class': 'form-select'}),
            'category': forms.Select(attrs={'class': 'form-select'}),
            'location': forms.TextInput(attrs={'class': 'form-control', 'placeholder': 'e.g., New York, NY'}),
            'min_salary': forms.NumberInput(attrs={'class': 'form-control', 'placeholder': 'Minimum salary'}),
            'frequency': forms.Select(attrs={'class': 'form-select'}),
            'is_active': forms.CheckboxInput(attrs={'class': 'form-check-input'}),
        }

class ApplicationStatusUpdateForm(forms.ModelForm):
    comments = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 3}),
        required=False,
        help_text='Optional comments about the status change'
    )

    class Meta:
        model = JobApplication
        fields = ['status']
        widgets = {
            'status': forms.Select(attrs={'class': 'form-control'}),
        }

    def save(self, commit=True, changed_by=None):
        instance = super().save(commit=False)
        if commit:
            instance.save()
            # Create history entry if status has changed
            if instance.status != instance._original_status:
                from myapp.models import ApplicationStatusHistory
                ApplicationStatusHistory.objects.create(
                    application=instance,
                    status=instance.status,
                    notes=self.cleaned_data.get('comments', ''),
                    created_by=changed_by
                )
        return instance
