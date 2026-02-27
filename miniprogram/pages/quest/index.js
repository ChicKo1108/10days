const api = require('../../api/index');

Page({
  data: {
    quests: [],
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
    this.fetchQuests();
  },

  onPullDownRefresh() {
    this.fetchQuests().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  fetchQuests() {
    return api.quest.getQuests({ status: 'ongoing' })
      .then(res => {
        this.setData({
          quests: res.list,
          loading: false
        });
      })
      .catch(err => {
        console.error(err);
        wx.showToast({ title: '获取篇章失败', icon: 'none' });
        this.setData({ loading: false });
      });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({ url: `/pages/quest-detail/index?id=${id}` });
  },

  goToCreate() {
    wx.navigateTo({ url: '/pages/plan-create/index' });
  }
});
