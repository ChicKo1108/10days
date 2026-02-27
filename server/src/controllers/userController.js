const { User } = require('../models');
const response = require('../utils/response');

// 3.1 获取用户信息
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return response.notFound(res, 'User not found');
        }

        response.success(res, {
            nickName: user.nickName,
            avatarUrl: user.avatarUrl,
            bio: '十日一进，久久为功'
        });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};

// 3.2 退出登录
exports.logout = async (req, res) => {
    response.success(res);
};

// 3.3 注销账号
exports.destroyAccount = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (user) {
            await user.destroy();
        }
        response.success(res);
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
