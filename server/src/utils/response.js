// 统一响应格式工具函数
const response = {
    success: (res, data = {}, msg = 'success') => {
        res.json({ code: 0, data, msg });
    },
    error: (res, msg = 'Server error', code = 500) => {
        res.status(code).json({ code, data: {}, msg });
    },
    notFound: (res, msg = 'Not found') => {
        res.status(404).json({ code: 404, data: {}, msg });
    },
    badRequest: (res, msg = 'Bad request') => {
        res.status(400).json({ code: 400, data: {}, msg });
    }
};

module.exports = response;
