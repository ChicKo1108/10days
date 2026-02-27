const response = require('../utils/response');

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
        return response.error(res, 'Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];
    
    if (!token || !token.startsWith('mock_token_')) {
        return response.error(res, 'Invalid token', 401);
    }

    // Extract user ID from mock token (mock_token_UUID)
    const userId = token.replace('mock_token_', '');
    
    if (!userId) {
        return response.error(res, 'Invalid token format', 401);
    }

    // Attach user to request
    req.user = { id: userId };
    next();
};

module.exports = authMiddleware;
