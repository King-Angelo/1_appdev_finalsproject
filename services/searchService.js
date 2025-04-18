const Job = require('../models/Job');
const User = require('../models/User');
const Company = require('../models/Company');
const elasticsearch = require('@elastic/elasticsearch');

class SearchService {
    constructor() {
        this.client = new elasticsearch.Client({
            node: process.env.ELASTICSEARCH_URL
        });
    }

    async searchJobs(query) {
        try {
            const { keyword, location, type, category, experience, salary } = query;

            const must = [];

            if (keyword) {
                must.push({
                    multi_match: {
                        query: keyword,
                        fields: ['title', 'description', 'skills'],
                        fuzziness: 'AUTO'
                    }
                });
            }

            if (location) {
                must.push({
                    match: {
                        location: {
                            query: location,
                            fuzziness: 'AUTO'
                        }
                    }
                });
            }

            if (type) {
                must.push({ term: { type } });
            }

            if (category) {
                must.push({ term: { category } });
            }

            if (experience) {
                must.push({
                    range: {
                        experienceRequired: {
                            gte: experience
                        }
                    }
                });
            }

            if (salary) {
                must.push({
                    range: {
                        salary: {
                            gte: salary
                        }
                    }
                });
            }

            const result = await this.client.search({
                index: 'jobs',
                body: {
                    query: {
                        bool: { must }
                    }
                }
            });

            return result.hits.hits.map(hit => ({
                ...hit._source,
                score: hit._score
            }));
        } catch (error) {
            console.error('Job search failed:', error);
            throw error;
        }
    }

    async searchCandidates(query) {
        try {
            const { skills, location, experience } = query;

            const must = [
                { term: { role: 'jobseeker' } }
            ];

            if (skills && skills.length > 0) {
                must.push({
                    terms: {
                        skills: skills
                    }
                });
            }

            if (location) {
                must.push({
                    match: {
                        location: {
                            query: location,
                            fuzziness: 'AUTO'
                        }
                    }
                });
            }

            if (experience) {
                must.push({
                    range: {
                        yearsOfExperience: {
                            gte: experience
                        }
                    }
                });
            }

            const result = await this.client.search({
                index: 'users',
                body: {
                    query: {
                        bool: { must }
                    }
                }
            });

            return result.hits.hits.map(hit => ({
                ...hit._source,
                score: hit._score
            }));
        } catch (error) {
            console.error('Candidate search failed:', error);
            throw error;
        }
    }

    async indexJob(job) {
        try {
            await this.client.index({
                index: 'jobs',
                id: job._id.toString(),
                body: {
                    title: job.title,
                    description: job.description,
                    company: job.company,
                    location: job.location,
                    type: job.type,
                    category: job.category,
                    skills: job.skills,
                    salary: job.salary,
                    experienceRequired: job.experienceRequired,
                    status: job.status,
                    createdAt: job.createdAt
                }
            });
        } catch (error) {
            console.error('Job indexing failed:', error);
            throw error;
        }
    }
}

module.exports = new SearchService(); 