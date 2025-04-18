const Job = require('../models/Job');
const User = require('../models/User');

class JobMatchingService {
    async findMatchingJobs(userId) {
        try {
            const user = await User.findById(userId)
                .select('skills experience preferredLocations salary');

            const matchingJobs = await Job.aggregate([
                {
                    $match: {
                        status: 'active',
                        $or: [
                            { skills: { $in: user.skills } },
                            { location: { $in: user.preferredLocations } }
                        ]
                    }
                },
                {
                    $addFields: {
                        matchScore: {
                            $sum: [
                                { 
                                    $multiply: [
                                        { 
                                            $size: {
                                                $setIntersection: ['$skills', user.skills]
                                            }
                                        },
                                        10
                                    ]
                                },
                                {
                                    $cond: [
                                        { $in: ['$location', user.preferredLocations] },
                                        20,
                                        0
                                    ]
                                },
                                {
                                    $cond: [
                                        { $gte: ['$salary', user.salary] },
                                        15,
                                        0
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $match: {
                        matchScore: { $gt: 0 }
                    }
                },
                {
                    $sort: {
                        matchScore: -1
                    }
                },
                {
                    $limit: 10
                }
            ]);

            return matchingJobs;
        } catch (error) {
            console.error('Job matching failed:', error);
            throw error;
        }
    }

    async findMatchingCandidates(jobId) {
        try {
            const job = await Job.findById(jobId);
            
            const matchingCandidates = await User.aggregate([
                {
                    $match: {
                        role: 'jobseeker',
                        skills: { $in: job.skills }
                    }
                },
                {
                    $addFields: {
                        matchScore: {
                            $sum: [
                                {
                                    $multiply: [
                                        {
                                            $size: {
                                                $setIntersection: ['$skills', job.skills]
                                            }
                                        },
                                        10
                                    ]
                                },
                                {
                                    $cond: [
                                        { $eq: ['$location', job.location] },
                                        20,
                                        0
                                    ]
                                }
                            ]
                        }
                    }
                },
                {
                    $match: {
                        matchScore: { $gt: 30 }
                    }
                },
                {
                    $sort: {
                        matchScore: -1
                    }
                },
                {
                    $limit: 20
                }
            ]);

            return matchingCandidates;
        } catch (error) {
            console.error('Candidate matching failed:', error);
            throw error;
        }
    }
}

module.exports = new JobMatchingService(); 