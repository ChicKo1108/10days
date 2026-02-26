Page({
  data: {
    userInfo: {
      nickName: '书童',
      avatarUrl: 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwBHJrFd5b6y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7y8WJ5e7/0'
    }
  },

  onLoad() {
    // 模拟获取用户信息
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
          wx.showToast({
            title: '已退出',
            icon: 'success'
          });
          // 实际逻辑：清除 Token，跳转登录页
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
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '账号已注销',
              icon: 'none'
            });
          }, 1500);
        }
      }
    });
  }
})
