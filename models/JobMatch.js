const mongoose = require('mongoose');

const jobMatchSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    jobseeker: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobSeeker',
        required: true
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    details: {
        skillMatch: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        experienceMatch: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        salaryMatch: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        },
        locationMatch: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    },
    lastCalculated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
jobMatchSchema.index({ job: 1, jobseeker: 1 }, { unique: true });
jobMatchSchema.index({ jobseeker: 1, matchScore: -1 });
jobMatchSchema.index({ job: 1, matchScore: -1 });

// Method to recalculate match score
jobMatchSchema.methods.recalculateMatch = async function() {
    const job = await this.model('Job').findById(this.job);
    const jobseeker = await this.model('JobSeeker').findById(this.jobseeker);
    
    if (!job || !jobseeker) {
        throw new Error('Job or JobSeeker not found');
    }

    // Calculate skill match
    const requiredSkills = new Set(job.requiredSkills.map(s => s.toString()));
    const seekerSkills = new Set(jobseeker.skills.map(s => s.toString()));
    const skillMatch = (
        Array.from(requiredSkills).filter(skill => seekerSkills.has(skill)).length / 
        requiredSkills.size
    ) * 100;

    // Calculate experience match
    const experienceLevels = { 'entry': 1, 'mid': 2, 'senior': 3, 'executive': 4 };
    const jobLevel = experienceLevels[job.experienceLevel] || 0;
    const seekerLevel = experienceLevels[jobseeker.experienceLevel] || 0;
    const experienceMatch = Math.max(0, (1 - Math.abs(jobLevel - seekerLevel) / 3)) * 100;

    // Calculate salary match
    let salaryMatch = 50; // Default if no salary info
    if (job.salary && jobseeker.expectedSalary) {
        if (jobseeker.expectedSalary < job.salary.min) {
            salaryMatch = Math.max(0, (jobseeker.expectedSalary / job.salary.min) * 100);
        } else if (jobseeker.expectedSalary > job.salary.max) {
            salaryMatch = Math.max(0, (job.salary.max / jobseeker.expectedSalary) * 100);
        } else {
            salaryMatch = 100;
        }
    }

    // Calculate location match
    let locationMatch = 50; // Default if no location info
    if (job.location.coordinates && jobseeker.location.coordinates) {
        const distance = calculateDistance(
            job.location.coordinates,
            jobseeker.location.coordinates
        );
        if (distance <= 5) locationMatch = 100;
        else if (distance <= 10) locationMatch = 80;
        else if (distance <= 20) locationMatch = 60;
        else if (distance <= 50) locationMatch = 40;
        else locationMatch = 20;
    }

    // Update match details
    this.details = {
        skillMatch,
        experienceMatch,
        salaryMatch,
        locationMatch
    };

    // Calculate overall match score
    this.matchScore = (
        skillMatch * 0.4 +
        experienceMatch * 0.3 +
        salaryMatch * 0.2 +
        locationMatch * 0.1
    );

    this.lastCalculated = new Date();
    await this.save();
};

module.exports = mongoose.model('JobMatch', jobMatchSchema); 