const api = require('../../api/index');

Page({
  data: {
    loading: false
  },

  handleLogin() {
    this.setData({ loading: true });
    
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用后端登录接口
          api.user.login({ code: res.code })
            .then(res => {
              // 保存 token 和用户信息
              wx.setStorageSync('token', res.token);
              wx.setStorageSync('userInfo', res.userInfo);
              // 清除游客标记，防止冲突
              wx.removeStorageSync('is_visitor');
              
              wx.showToast({ title: '登录成功', icon: 'success' });
              
              setTimeout(() => {
                wx.switchTab({ url: '/pages/quest/index' });
              }, 1000);
            })
            .catch(err => {
              console.error(err);
              wx.showToast({ title: '登录失败', icon: 'none' });
              this.setData({ loading: false });
            });
        } else {
          console.error('登录失败！' + res.errMsg);
          this.setData({ loading: false });
        }
      },
      fail: () => {
        this.setData({ loading: false });
      }
    });
  },

  handleVisitor() {
    wx.setStorageSync('is_visitor', true);
    wx.switchTab({ url: '/pages/quest/index' });
  }
});
