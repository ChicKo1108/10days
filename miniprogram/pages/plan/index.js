const api = require('../../api/index');

Page({
  data: {
    plans: [],
    loading: true
  },

  onShow() {
    // 检查登录状态
    const token = wx.getStorageSync('token');
    const isVisitor = wx.getStorageSync('is_visitor');

    // 如果有token，说明已登录，清除游客状态（可选）
    if (token) {
        wx.removeStorageSync('is_visitor');
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
    this.fetchPlans();
  },

  onPullDownRefresh() {
    this.fetchPlans().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchPlans() {
    return api.plan.getPlans()
      .then(res => {
        this.setData({
          plans: res.list, // 后端返回的数据结构 { list: [...] }
          loading: false
        });
      })
      .catch(err => {
        console.error(err);
        wx.showToast({ title: '获取长卷失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  goToChapter(e) {
    const { id, status } = e.currentTarget.dataset;
    if (status === 'locked') {
      wx.showToast({ title: '前序篇章未完，静候时机', icon: 'none' });
      return;
    }
    wx.navigateTo({ url: `/pages/quest-detail/index?id=${id}` });
  },

  goToCreatePlan() {
    wx.navigateTo({ url: '/pages/plan-create/index' });
  }
});
