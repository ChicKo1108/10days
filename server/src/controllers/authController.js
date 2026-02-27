const { User } = require('../models');
const response = require('../utils/response');
const axios = require('axios'); // Need to install axios for WeChat API
require('dotenv').config();

// 微信登录
exports.login = async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            return response.badRequest(res, 'Code is required');
        }

        // 1. 调用微信接口获取 openid
        const appId = process.env.WECHAT_APPID;
        const appSecret = process.env.WECHAT_SECRET;
        
        // Mock logic for development without real AppID/Secret
        let openId = 'mock_openid_test';
        
        if (appId && appSecret) {
            const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`;
            const wechatRes = await axios.get(url);
            if (wechatRes.data.openid) {
                openId = wechatRes.data.openid;
            } else {
                console.error('WeChat API Error:', wechatRes.data);
                // Fallback to mock for dev if API fails
                // return response.error(res, 'WeChat login failed'); 
            }
        }

        // 2. 查找或创建用户
        let user = await User.findOne({ where: { openId } });
        if (!user) {
            user = await User.create({
                openId,
                nickName: '书童', // Default nickname
                avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHJrFd5b6y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7/0'
            });
        }

        // 3. 生成 Token (Mock simple token)
        // In production, use JWT: jwt.sign({ id: user.id }, process.env.JWT_SECRET)
        const token = `mock_token_${user.id}`;

        response.success(res, {
            token,
            userInfo: {
                nickName: user.nickName,
                avatarUrl: user.avatarUrl,
                bio: '十日一进，久久为功'
            }
        });
    } catch (error) {
        console.error(error);
        response.error(res);
    }
};
