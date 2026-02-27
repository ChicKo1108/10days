const request = require('./request');

// 微信登录
const login = (data) => {
  return request.post('/auth/login', data);
};

// 获取用户信息
const getProfile = () => {
  return request.get('/user/profile');
};

// 退出登录
const logout = () => {
  return request.post('/auth/logout');
};

// 注销账号
const destroyAccount = () => {
  return request.delete('/user/destroy');
};

module.exports = {
  login,
  getProfile,
  logout,
  destroyAccount
};
