const { User } = require('../models');
const response = require('../utils/response');

// 3.1 获取用户信息
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findOne();
        if (!user) {
            const newUser = await User.create({
                openId: 'mock_openid_' + Date.now(),
                nickName: '书童',
                avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHJrFd5b6y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7/0'
            });
            return response.success(res, {
                nickName: newUser.nickName,
                avatarUrl: newUser.avatarUrl,
                bio: '十日一进，久久为功'
            });
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
        const user = await User.findOne();
        if (user) {
            await user.destroy();
        }
        response.success(res);
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
