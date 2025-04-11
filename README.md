# Job Portal API

A comprehensive job portal API built with Django REST Framework.

## Features

- User authentication with JWT
- Job posting and application management
- Job seeker and employer profiles
- Job matching and recommendations
- Application tracking
- Notifications and alerts
- Metrics and analytics
- Search and filtering capabilities

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd django-social-login-allauth-copy
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
Create a `.env` file in the project root with the following variables:
```
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgres://user:password@localhost:5432/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
```

5. Run migrations:
```bash
python manage.py migrate
```

6. Create a superuser:
```bash
python manage.py createsuperuser
```

7. Run the development server:
```bash
python manage.py runserver
```

## API Documentation

The API documentation is available at `/api/docs/` when running the development server.

### Authentication

All API endpoints require authentication using JWT tokens. To obtain a token:

1. Send a POST request to `/api/token/` with username and password:
```json
{
    "username": "your_username",
    "password": "your_password"
}
```

2. Use the returned access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### Endpoints

#### Jobs
- `GET /api/jobs/` - List all jobs
- `POST /api/jobs/` - Create a new job
- `GET /api/jobs/{id}/` - Get job details
- `PUT /api/jobs/{id}/` - Update job
- `DELETE /api/jobs/{id}/` - Delete job
- `POST /api/jobs/{id}/apply/` - Apply for a job

#### Applications
- `GET /api/applications/` - List all applications
- `GET /api/applications/{id}/` - Get application details
- `PUT /api/applications/{id}/` - Update application status

#### Job Seekers
- `GET /api/job-seekers/` - List all job seekers
- `GET /api/job-seekers/{id}/` - Get job seeker details
- `PUT /api/job-seekers/{id}/` - Update job seeker profile

#### Employers
- `GET /api/employers/` - List all employers
- `GET /api/employers/{id}/` - Get employer details
- `PUT /api/employers/{id}/` - Update employer profile

#### Companies
- `GET /api/companies/` - List all companies
- `POST /api/companies/` - Create a new company
- `GET /api/companies/{id}/` - Get company details
- `PUT /api/companies/{id}/` - Update company

#### Metrics
- `GET /api/metrics/jobs/` - Job posting metrics
- `GET /api/metrics/applications/` - Application metrics
- `GET /api/metrics/job-seekers/` - Job seeker metrics
- `GET /api/metrics/employers/` - Employer metrics
- `GET /api/metrics/companies/` - Company metrics

## Testing

Run the test suite:
```bash
python manage.py test
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
# 2-websys2
