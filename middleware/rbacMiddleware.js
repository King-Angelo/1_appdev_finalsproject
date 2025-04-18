const Role = require('../models/Role');
const Permission = require('../models/Permission');

const rbacMiddleware = {
    // Check user role
    checkRole: (roles) => {
        return (req, res, next) => {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized'
                });
            }

            if (roles.includes(req.user.role)) {
                next();
            } else {
                res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
        };
    },

    // Check specific permission
    checkPermission: (permission) => {
        return async (req, res, next) => {
            try {
                if (!req.user) {
                    return res.status(401).json({
                        success: false,
                        message: 'Unauthorized'
                    });
                }

                const userRole = await Role.findById(req.user.roleId)
                    .populate('permissions');

                const hasPermission = userRole.permissions.some(
                    p => p.name === permission
                );

                if (hasPermission) {
                    next();
                } else {
                    res.status(403).json({
                        success: false,
                        message: 'Insufficient permissions'
                    });
                }
            } catch (error) {
                next(error);
            }
        };
    },

    // Check resource ownership
    checkOwnership: (model) => {
        return async (req, res, next) => {
            try {
                const resource = await model.findById(req.params.id);
                
                if (!resource) {
                    return res.status(404).json({
                        success: false,
                        message: 'Resource not found'
                    });
                }

                if (resource.user.toString() !== req.user._id.toString()) {
                    return res.status(403).json({
                        success: false,
                        message: 'Access denied'
                    });
                }

                req.resource = resource;
                next();
            } catch (error) {
                next(error);
            }
        };
    }
};

module.exports = rbacMiddleware; 