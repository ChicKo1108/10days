App({
  onLaunch() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    if (!token) {
      // 未登录，跳转到登录页
      // 由于是 TabBar 页面，reLaunch 可能不合适，这里不做强制跳转，
      // 而是由页面各自处理（如 quest/index 遇到未登录显示空或跳转）
      // 或者在第一个页面 onLoad 中检查。
      // 这里简单处理：如果当前不在登录页，且未登录，重定向到登录页
      // 但小程序启动时无法直接重定向，通常在首页 onLoad 处理
    }
  },
  globalData: {
    userInfo: null
  }
})
