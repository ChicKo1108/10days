const api = require('../../api/index');

Page({
  data: {
    userInfo: {
      nickName: '',
      avatarUrl: '',
      bio: ''
    }
  },

  onShow() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const storedUserInfo = wx.getStorageSync('userInfo');
    const isVisitor = wx.getStorageSync('is_visitor');
    
    // 如果有token，说明已登录，清除游客状态（可选）
    if (token) {
        wx.removeStorageSync('is_visitor');
    }

    if (storedUserInfo) {
      console.log('storedUserInfo: ', storedUserInfo)
      this.setData({ userInfo: storedUserInfo });
    }

    if (!token && !isVisitor) {
      wx.showModal({
        title: '提示',
        content: '请先登录',
        confirmText: '去登录',
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/index' });
          }
        }
      });
      return;
    }
    this.fetchProfile();
  },

  fetchProfile() {
    api.user.getProfile()
      .then(res => {
        this.setData({
          userInfo: res
        });
      })
      .catch(err => {
        console.error(err);
        wx.showToast({ title: '获取用户信息失败', icon: 'none' });
      });
  },

  handlePrivacy() {
    wx.showToast({
      title: '隐私协议已阅读',
      icon: 'none'
    });
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要暂别书童吗？',
      confirmColor: '#B22222',
      success: (res) => {
        if (res.confirm) {
          api.user.logout()
            .then(() => {
              wx.showToast({ title: '已退出', icon: 'success' });
              // 实际逻辑：清除 Token，跳转登录页或重置状态
              this.setData({
                userInfo: { nickName: '未登录', avatarUrl: '', bio: '' }
              });
            })
            .catch(() => {
              wx.showToast({ title: '退出失败', icon: 'none' });
            });
        }
      }
    });
  },

  handleDeleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销后所有墨迹将无法找回，确定要销毁吗？',
      confirmColor: '#B22222',
      confirmText: '确认销毁',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '销毁中...' });
          
          api.user.destroyAccount()
            .then(() => {
              wx.hideLoading();
              wx.showToast({ title: '账号已注销', icon: 'none' });
              // 实际逻辑：跳转登录页或首页
              setTimeout(() => {
                wx.reLaunch({ url: '/pages/quest/index' });
              }, 1500);
            })
            .catch(() => {
              wx.hideLoading();
              wx.showToast({ title: '注销失败', icon: 'none' });
            });
        }
      }
    });
  }
});
